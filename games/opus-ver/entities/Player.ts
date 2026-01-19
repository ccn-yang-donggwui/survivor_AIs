import Phaser from 'phaser';
import type { PlayerStats, WeaponState, PassiveState, Direction } from '../types/GameTypes';
import type { CharacterData } from '../types/DataTypes';
import { PLAYER, DEPTH } from '../config/Constants';
import { BaseWeapon } from '../weapons/BaseWeapon';
import { BasePassive } from '../passives/BasePassive';
import { WeaponFactory } from '../weapons/WeaponFactory';
import { PassiveFactory } from '../passives/PassiveFactory';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public stats: PlayerStats;
  public baseStats: PlayerStats;
  public weapons: BaseWeapon[] = [];
  public passives: BasePassive[] = [];
  public lastDirection: Direction = { x: 1, y: 0 };

  // 경험치 관련
  public level: number = 1;
  public currentExp: number = 0;
  public expToNextLevel: number = 15; // 초기 필요 경험치

  private _isInvincible: boolean = false;
  private invincibilityTimer: number = 0;
  private characterData: CharacterData;
  private temporaryBuffs: Map<string, { multiplier: number; endTime: number }> = new Map();
  private isMoving: boolean = false;
  private currentAnimDirection: 'down' | 'up' | 'side' = 'down';

  get isInvincible(): boolean {
    return this._isInvincible;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, characterData: CharacterData) {
    super(scene, x, y, characterData.sprite);

    this.characterData = characterData;

    // 물리 설정
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.setDepth(DEPTH.PLAYER);
    this.setScale(1); // HD 모드에서는 scale 1이 기본 (32x32 스프라이트)

    // 바디 크기 조절 (HD 스프라이트 기준)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 20);
    body.setOffset(6, 8);

    // 기본 스탯 초기화
    this.baseStats = {
      maxHP: characterData.stats.maxHP,
      currentHP: characterData.stats.maxHP,
      hpRegen: PLAYER.BASE_HP_REGEN,
      moveSpeed: characterData.stats.moveSpeed,
      damage: characterData.stats.damage,
      attackSpeed: characterData.stats.cooldownReduction,
      area: characterData.stats.area,
      duration: 1.0,
      projectileCount: 0,
      piercing: 0,
      cooldownReduction: 1.0,
      expMultiplier: 1.0,
      pickupRange: characterData.stats.pickupRange,
      luck: 1.0,
      revives: 0,
    };

    this.stats = { ...this.baseStats };
  }

  override update(time: number, delta: number): void {
    // 무적 타이머
    if (this._isInvincible) {
      this.invincibilityTimer -= delta;
      if (this.invincibilityTimer <= 0) {
        this._isInvincible = false;
        this.setAlpha(1);
      } else {
        // 깜빡임 효과
        this.setAlpha(Math.sin(time / 50) > 0 ? 1 : 0.5);
      }
    }

    // HP 자동 회복
    if (this.stats.currentHP < this.stats.maxHP) {
      this.stats.currentHP = Math.min(
        this.stats.maxHP,
        this.stats.currentHP + this.stats.hpRegen * (delta / 1000)
      );
    }

    // 임시 버프 타이머 체크
    const currentTime = this.scene.time.now;
    this.temporaryBuffs.forEach((buff, key) => {
      if (currentTime >= buff.endTime) {
        this.temporaryBuffs.delete(key);
        this.recalculateStats();
      }
    });

    // 무기 업데이트
    this.weapons.forEach(weapon => {
      weapon.update(time, delta, this);
    });
  }

  move(direction: Direction): void {
    let dirX = direction.x;
    let dirY = direction.y;

    // 대각선 정규화
    if (dirX !== 0 && dirY !== 0) {
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      dirX /= length;
      dirY /= length;
    }

    this.setVelocity(
      dirX * this.stats.moveSpeed,
      dirY * this.stats.moveSpeed
    );

    // 마지막 방향 저장
    if (dirX !== 0 || dirY !== 0) {
      this.lastDirection = { x: dirX, y: dirY };

      // 좌우 반전
      if (dirX < 0) {
        this.setFlipX(true);
      } else if (dirX > 0) {
        this.setFlipX(false);
      }
    }

    // 4방향 걷기 애니메이션 재생
    const isNowMoving = dirX !== 0 || dirY !== 0;

    if (isNowMoving) {
      // 방향 결정: 수직 이동이 우선, 그 다음 수평
      let newDirection: 'down' | 'up' | 'side';
      if (Math.abs(dirY) > Math.abs(dirX) * 0.5) {
        // 수직 이동이 더 강함
        newDirection = dirY > 0 ? 'down' : 'up';
      } else {
        // 수평 이동이 더 강함
        newDirection = 'side';
      }

      // 이동 시작 또는 방향 변경 시 애니메이션 재생
      if (!this.isMoving || this.currentAnimDirection !== newDirection) {
        const walkAnimKey = `${this.characterData.sprite}_walk_${newDirection}`;
        const animExists = this.scene.anims.exists(walkAnimKey);

        if (animExists) {
          this.play(walkAnimKey, true);
          this.currentAnimDirection = newDirection;
        } else {
          // 방향별 애니메이션이 없으면 기본 애니메이션 사용
          const fallbackKey = `${this.characterData.sprite}_walk`;
          if (this.scene.anims.exists(fallbackKey)) {
            this.play(fallbackKey, true);
          }
        }
        this.isMoving = true;
      }
    } else if (!isNowMoving && this.isMoving) {
      // 이동 종료: 애니메이션 정지 및 idle 프레임
      this.stop();
      this.setTexture(this.characterData.sprite);
      this.isMoving = false;
    }
  }

  takeDamage(amount: number): boolean {
    if (this._isInvincible) return false;

    this.stats.currentHP -= amount;

    if (this.stats.currentHP <= 0) {
      // 부활 체크
      if (this.stats.revives > 0) {
        this.stats.revives--;
        this.stats.currentHP = this.stats.maxHP * 0.5;
        this.startInvincibility(2000);
        return false;
      }
      return true; // 사망
    }

    this.startInvincibility(PLAYER.INVINCIBILITY_TIME);
    return false;
  }

  heal(amount: number): void {
    this.stats.currentHP = Math.min(this.stats.maxHP, this.stats.currentHP + amount);
  }

  startInvincibility(duration: number): void {
    this._isInvincible = true;
    this.invincibilityTimer = duration;
  }

  addWeapon(weaponOrId: BaseWeapon | string): boolean {
    // 문자열이면 ID로, BaseWeapon이면 id 속성으로
    const weaponId = typeof weaponOrId === 'string' ? weaponOrId : weaponOrId.id;

    // 이미 있는 무기인지 먼저 확인 (레벨업은 슬롯과 무관)
    const existing = this.weapons.find(w => w.id === weaponId);
    if (existing) {
      return existing.levelUp();
    }

    // 새 무기 추가 시에만 슬롯 체크
    if (this.weapons.length >= PLAYER.MAX_WEAPONS) return false;

    // 문자열이면 WeaponFactory로 생성
    let weapon: BaseWeapon | null;
    if (typeof weaponOrId === 'string') {
      weapon = WeaponFactory.create(this.scene, weaponOrId);
      if (!weapon) {
        console.warn(`Failed to create weapon: ${weaponOrId}`);
        return false;
      }
    } else {
      weapon = weaponOrId;
    }

    this.weapons.push(weapon);
    return true;
  }

  removeWeapon(weaponId: string): boolean {
    const index = this.weapons.findIndex(w => w.id === weaponId);
    if (index === -1) return false;
    this.weapons.splice(index, 1);
    return true;
  }

  getWeapon(id: string): BaseWeapon | undefined {
    return this.weapons.find(w => w.id === id);
  }

  addPassive(passiveOrId: BasePassive | string): boolean {
    // 문자열이면 ID로, BasePassive이면 id 속성으로
    const passiveId = typeof passiveOrId === 'string' ? passiveOrId : passiveOrId.id;

    // 이미 있는 패시브인지 먼저 확인 (레벨업은 슬롯과 무관)
    const existing = this.passives.find(p => p.id === passiveId);
    if (existing) {
      const result = existing.levelUp();
      // 레벨업 후 스탯 즉시 재계산 (투사체 추가 등 바로 반영)
      this.recalculateStats();
      return result;
    }

    // 새 패시브 추가 시에만 슬롯 체크
    if (this.passives.length >= PLAYER.MAX_PASSIVES) return false;

    // 문자열이면 PassiveFactory로 생성
    let passive: BasePassive | null;
    if (typeof passiveOrId === 'string') {
      passive = PassiveFactory.create(passiveOrId);
      if (!passive) {
        console.warn(`Failed to create passive: ${passiveOrId}`);
        return false;
      }
    } else {
      passive = passiveOrId;
    }

    this.passives.push(passive);
    this.recalculateStats();
    return true;
  }

  getPassive(id: string): BasePassive | undefined {
    return this.passives.find(p => p.id === id);
  }

  hasPassive(id: string): boolean {
    return this.passives.some(p => p.id === id);
  }

  getWeapons(): WeaponState[] {
    return this.weapons.map(w => ({
      id: w.id,
      level: w.level,
      isEvolved: w.isEvolved,
    }));
  }

  getPassives(): PassiveState[] {
    return this.passives.map(p => ({
      id: p.id,
      level: p.level,
    }));
  }

  recalculateStats(): void {
    const currentHP = this.stats.currentHP;
    const previousMaxHP = this.stats.maxHP;

    // 기본 스탯으로 리셋
    this.stats = { ...this.baseStats };

    // 모든 패시브 적용
    this.passives.forEach(passive => {
      passive.applyToStats(this.stats);
    });

    // 임시 버프 적용
    const currentTime = this.scene.time.now;
    this.temporaryBuffs.forEach((buff, stat) => {
      if (currentTime < buff.endTime) {
        const statKey = stat as keyof PlayerStats;
        if (typeof this.stats[statKey] === 'number') {
          (this.stats[statKey] as number) *= (1 + buff.multiplier);
        }
      }
    });

    // HP 동기화
    if (this.stats.maxHP > previousMaxHP) {
      const hpIncrease = this.stats.maxHP - previousMaxHP;
      this.stats.currentHP = Math.min(this.stats.maxHP, currentHP + hpIncrease);
    } else {
      this.stats.currentHP = Math.min(this.stats.maxHP, currentHP);
    }
  }

  applyMetaUpgrades(upgrades: Record<string, number>, metaData: any[]): void {
    metaData.forEach(upgrade => {
      const level = upgrades[upgrade.id] || 0;
      if (level <= 0) return;

      const value = upgrade.baseValue + (level - 1) * upgrade.perLevelValue;
      const stat = upgrade.stat as keyof PlayerStats;

      if (upgrade.isMultiplier) {
        (this.baseStats[stat] as number) *= (1 + value);
      } else {
        (this.baseStats[stat] as number) += value;
      }
    });

    // stats도 업데이트
    this.stats = { ...this.baseStats };
    this.recalculateStats();
  }

  getHPPercent(): number {
    return this.stats.currentHP / this.stats.maxHP;
  }

  isAlive(): boolean {
    return this.stats.currentHP > 0;
  }

  // 경험치 추가
  addExp(amount: number): boolean {
    const adjustedExp = Math.floor(amount * this.stats.expMultiplier);
    this.currentExp += adjustedExp;

    // 레벨업 체크
    if (this.currentExp >= this.expToNextLevel) {
      this.levelUp();
      return true; // 레벨업 발생
    }
    return false;
  }

  private levelUp(): void {
    this.level++;
    this.currentExp -= this.expToNextLevel;

    // 다음 레벨 필요 경험치 계산
    // 목표: 10분에 레벨 60 도달 (모든 스킬 맥스 가능)
    this.expToNextLevel = this.calculateExpToNextLevel(this.level);

    // 레벨업 이벤트 발생
    this.scene.events.emit('playerLevelUp', this.level);
  }

  private calculateExpToNextLevel(level: number): number {
    // 완만한 경험치 곡선 (레벨당 +5% 증가)
    // 목표: 10분에 레벨 60 도달 → 모든 스킬(무기6+패시브6) 맥스 가능
    // Lv 10: ~23exp, Lv 30: ~58exp, Lv 50: ~142exp, Lv 60: ~231exp
    // 총 누적 (Lv60): ~3,800exp
    const baseExp = 15;
    const growthRate = 1.05;
    return Math.floor(baseExp * Math.pow(growthRate, level - 1));
  }

  getExpPercent(): number {
    return this.currentExp / this.expToNextLevel;
  }

  getLevel(): number {
    return this.level;
  }

  // 임시 버프 적용
  applyTemporaryBuff(stat: keyof PlayerStats, multiplier: number, duration: number): void {
    const endTime = this.scene.time.now + duration;
    this.temporaryBuffs.set(stat as string, { multiplier, endTime });
    this.recalculateStats();
  }

  // 임시 버프 값 가져오기
  getTemporaryBuffMultiplier(stat: keyof PlayerStats): number {
    const buff = this.temporaryBuffs.get(stat as string);
    if (buff && this.scene.time.now < buff.endTime) {
      return 1 + buff.multiplier;
    }
    return 1;
  }
}
