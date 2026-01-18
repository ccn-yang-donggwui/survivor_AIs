import Phaser from 'phaser';
import { PLAYER } from '../config/Constants';
import { PlayerStats } from '../types/GameTypes';
import { BaseWeapon } from '../weapons/BaseWeapon';
import { BasePassive } from '../passives/BasePassive';
import { Dagger } from '../weapons/Dagger';
import { GameScene } from '../scenes/GameScene';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private baseStats: PlayerStats;
  public stats: PlayerStats;
  public weapons: BaseWeapon[] = [];
  public passives: BasePassive[] = [];

  private isInvincible = false;
  private invincibilityTimer = 0;
  private lastDirection: { x: number; y: number } = { x: 1, y: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    this.baseStats = {
      maxHP: PLAYER.BASE_HP,
      currentHP: PLAYER.BASE_HP,
      hpRegen: PLAYER.BASE_HP_REGEN,
      moveSpeed: PLAYER.BASE_SPEED,
      damage: 1.0,
      attackSpeed: 1.0,
      area: 1.0,
      duration: 1.0,
      projectileCount: 0,
      expMultiplier: 1.0,
      pickupRange: 80
    };

    this.stats = { ...this.baseStats };

    // 시작 무기: 단검
    this.addWeapon(new Dagger(scene as GameScene));
  }

  private recalculateStats(): void {
    // 기본 스탯으로 리셋
    const currentHP = this.stats.currentHP;
    const previousMaxHP = this.stats.maxHP;

    this.stats = { ...this.baseStats };

    // 패시브 효과 적용
    for (const passive of this.passives) {
      passive.applyToStats(this.stats);
    }

    // 최대 HP가 증가했으면 현재 HP도 비례 증가
    if (this.stats.maxHP > previousMaxHP) {
      const hpIncrease = this.stats.maxHP - previousMaxHP;
      this.stats.currentHP = Math.min(this.stats.maxHP, currentHP + hpIncrease);
    } else {
      this.stats.currentHP = Math.min(this.stats.maxHP, currentHP);
    }
  }

  public move(dirX: number, dirY: number): void {
    // 대각선 이동 정규화
    if (dirX !== 0 && dirY !== 0) {
      dirX *= 0.707;
      dirY *= 0.707;
    }

    this.setVelocity(
      dirX * this.stats.moveSpeed,
      dirY * this.stats.moveSpeed
    );

    // 마지막 이동 방향 저장 (투사체 방향용)
    if (dirX !== 0 || dirY !== 0) {
      this.lastDirection = { x: dirX, y: dirY };
    }

    // 스프라이트 방향 전환
    if (dirX < 0) {
      this.setFlipX(true);
    } else if (dirX > 0) {
      this.setFlipX(false);
    }
  }

  public update(time: number, delta: number): void {
    // 무적 시간 처리
    if (this.isInvincible) {
      this.invincibilityTimer -= delta;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
        this.setAlpha(1);
      } else {
        // 깜빡임 효과
        this.setAlpha(Math.sin(time / 50) * 0.5 + 0.5);
      }
    }

    // HP 자동 회복
    if (this.stats.currentHP < this.stats.maxHP) {
      this.stats.currentHP = Math.min(
        this.stats.maxHP,
        this.stats.currentHP + this.stats.hpRegen * (delta / 1000)
      );
    }
  }

  public updateWeapons(time: number, delta: number, enemies: Phaser.Physics.Arcade.Group): void {
    for (const weapon of this.weapons) {
      weapon.update(time, delta, this, enemies);
    }
  }

  public takeDamage(amount: number): void {
    if (this.isInvincible) return;

    this.stats.currentHP -= amount;
    this.isInvincible = true;
    this.invincibilityTimer = PLAYER.INVINCIBILITY_TIME;

    // 피격 효과
    this.scene.cameras.main.shake(100, 0.01);

    // 사망 체크
    if (this.stats.currentHP <= 0) {
      this.stats.currentHP = 0;
      this.die();
    }
  }

  public heal(amount: number): void {
    this.stats.currentHP = Math.min(this.stats.maxHP, this.stats.currentHP + amount);
  }

  public addWeapon(weapon: BaseWeapon): boolean {
    if (this.weapons.length >= 6) return false;

    // 이미 보유한 무기인지 확인
    const existingWeapon = this.weapons.find(w => w.id === weapon.id);
    if (existingWeapon) {
      return this.levelUpWeapon(weapon.id);
    }

    this.weapons.push(weapon);
    return true;
  }

  public levelUpWeapon(weaponId: string): boolean {
    const weapon = this.weapons.find(w => w.id === weaponId);
    if (weapon && weapon.level < weapon.maxLevel) {
      weapon.levelUp();
      return true;
    }
    return false;
  }

  public addPassive(passive: BasePassive): boolean {
    if (this.passives.length >= 6) return false;

    // 이미 보유한 패시브인지 확인
    const existingPassive = this.passives.find(p => p.id === passive.id);
    if (existingPassive) {
      return this.levelUpPassive(passive.id);
    }

    this.passives.push(passive);
    this.recalculateStats();
    return true;
  }

  public levelUpPassive(passiveId: string): boolean {
    const passive = this.passives.find(p => p.id === passiveId);
    if (passive && passive.level < passive.maxLevel) {
      passive.levelUp();
      this.recalculateStats();
      return true;
    }
    return false;
  }

  public onLevelUp(): void {
    // 레벨업 선택 UI가 없을 때의 폴백 (더 이상 사용 안함)
  }

  public getLastDirection(): { x: number; y: number } {
    return this.lastDirection;
  }

  private die(): void {
    (this.scene as GameScene).gameOver();
  }
}
