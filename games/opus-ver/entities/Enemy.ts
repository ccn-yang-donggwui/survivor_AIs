import Phaser from 'phaser';
import type { EnemyType } from '../types/GameTypes';
import { DEPTH } from '../config/Constants';

export interface EnemyConfig {
  id: string;
  name: string;
  sprite: string;
  hp: number;
  damage: number;
  speed: number;
  expValue: number;
  scale: number;
  behavior: 'chase' | 'charge' | 'ranged' | 'boss';
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public enemyId: string;
  public enemyType: EnemyType;
  public maxHP: number;
  public currentHP: number;
  public damage: number;
  public speed: number;
  public expValue: number;
  public behavior: string;

  private target: Phaser.GameObjects.Sprite | null = null;
  private chargeTimer: number = 0;
  private isCharging: boolean = false;
  private chargeDirection: { x: number; y: number } = { x: 0, y: 0 };

  // 원거리 공격 관련
  private attackCooldown: number = 0;
  private readonly attackInterval: number = 3000; // 3초마다 공격

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    super(scene, x, y, config.sprite);

    this.enemyId = config.id;
    this.enemyType = config.id as EnemyType;
    this.maxHP = config.hp;
    this.currentHP = config.hp;
    this.damage = config.damage;
    this.speed = config.speed;
    this.expValue = config.expValue;
    this.behavior = config.behavior;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.ENEMIES);
    this.setScale(config.scale); // HD 모드에서는 scale 1이 기본

    // 데이터 설정 (충돌 감지 및 타게팅용)
    this.setData('isEnemy', true);
    this.setData('enemyId', Date.now() + Math.random()); // 유니크 ID
    this.setData('hp', this.maxHP);
    this.setData('currentHp', this.currentHP);

    // 바디 설정
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
  }

  setTarget(target: Phaser.GameObjects.Sprite): void {
    this.target = target;
  }

  update(time: number, delta: number): void {
    if (!this.target || !this.active) return;

    switch (this.behavior) {
      case 'chase':
        this.updateChase();
        break;
      case 'charge':
        this.updateCharge(delta);
        break;
      case 'ranged':
        this.updateRanged(delta);
        break;
      case 'boss':
        this.updateBoss(time, delta);
        break;
    }

    // 좌우 반전
    if (this.body) {
      const vx = (this.body as Phaser.Physics.Arcade.Body).velocity.x;
      if (vx < -10) this.setFlipX(true);
      else if (vx > 10) this.setFlipX(false);
    }
  }

  private updateChase(): void {
    if (!this.target) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  private updateCharge(delta: number): void {
    if (!this.target) return;

    if (this.isCharging) {
      this.chargeTimer -= delta;
      if (this.chargeTimer <= 0) {
        this.isCharging = false;
        this.chargeTimer = 2000 + Math.random() * 1000;
      }
      // 돌진 중에는 빠르게
      this.setVelocity(
        this.chargeDirection.x * this.speed * 2,
        this.chargeDirection.y * this.speed * 2
      );
    } else {
      // 대기 중
      this.chargeTimer -= delta;
      if (this.chargeTimer <= 0) {
        // 돌진 시작
        this.isCharging = true;
        this.chargeTimer = 500;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.chargeDirection = { x: Math.cos(angle), y: Math.sin(angle) };
      } else {
        // 느리게 접근
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.setVelocity(
          Math.cos(angle) * this.speed * 0.5,
          Math.sin(angle) * this.speed * 0.5
        );
      }
    }
  }

  private updateRanged(delta: number): void {
    if (!this.target) return;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

    // 공격 쿨다운 처리
    this.attackCooldown -= delta;

    // 공격 가능 거리 내에서 쿨다운이 끝나면 발사
    if (this.attackCooldown <= 0 && distance < 350 && distance > 100) {
      this.fireProjectile();
      this.attackCooldown = this.attackInterval;
    }

    if (distance < 150) {
      // 거리 유지 (도망)
      const angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.x, this.y);
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    } else if (distance > 300) {
      // 접근
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    } else {
      // 적정 거리 - 천천히 원형으로 이동
      const circleAngle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y) + Math.PI / 2;
      this.setVelocity(
        Math.cos(circleAngle) * this.speed * 0.5,
        Math.sin(circleAngle) * this.speed * 0.5
      );
    }
  }

  private fireProjectile(): void {
    if (!this.target || !this.scene) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);

    // 이벤트를 통해 GameScene에서 투사체 생성
    this.scene.events.emit('enemyFireProjectile', {
      x: this.x,
      y: this.y,
      angle: angle,
      damage: Math.floor(this.damage * 0.8), // 접촉 데미지보다 약간 낮게
      speed: 150,
      duration: 3000,
    });

    // 발사 이펙트
    this.createFireEffect();
  }

  private createFireEffect(): void {
    if (!this.scene) return;

    // 유령 발사 이펙트 (흰색 빛)
    const flash = this.scene.add.graphics();
    flash.setDepth(DEPTH.EFFECTS);
    flash.setPosition(this.x, this.y);
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(0, 0, 12);

    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // 파티클 (흰색/회색)
    for (let i = 0; i < 4; i++) {
      const particle = this.scene.add.graphics();
      particle.setDepth(DEPTH.EFFECTS);
      particle.setPosition(this.x, this.y);
      particle.fillStyle(0xd8d8d8, 1);
      particle.fillCircle(0, 0, 4);

      const pAngle = Math.random() * Math.PI * 2;
      const pDist = 15 + Math.random() * 10;

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(pAngle) * pDist,
        y: this.y + Math.sin(pAngle) * pDist,
        alpha: 0,
        duration: 200,
        onComplete: () => particle.destroy(),
      });
    }
  }

  private updateBoss(time: number, delta: number): void {
    if (!this.target) return;

    // 보스는 느리게 플레이어 추적
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  takeDamage(amount: number): boolean {
    this.currentHP -= amount;
    this.setData('currentHp', this.currentHP); // 데이터 동기화

    // 피격 효과
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    if (this.currentHP <= 0) {
      return true; // 사망
    }
    return false;
  }

  getHPPercent(): number {
    return this.currentHP / this.maxHP;
  }

  applyDifficultyScaling(healthMult: number, speedMult: number, damageMult: number): void {
    this.maxHP = Math.floor(this.maxHP * healthMult);
    this.currentHP = this.maxHP;
    this.speed = this.speed * speedMult;
    this.damage = Math.floor(this.damage * damageMult);
  }
}
