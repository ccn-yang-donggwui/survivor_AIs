import Phaser from 'phaser';
import { DEPTH } from '../config/Constants';

export interface EnemyProjectileConfig {
  damage: number;
  speed: number;
  duration: number;
}

export class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number;
  private projectileSpeed: number;
  private lifetime: number;
  private elapsed: number = 0;
  private moveAngle: number;
  private velocityX: number;
  private velocityY: number;
  private trailTimer: number = 0;
  private baseScale: number = 0.8; // 몬스터(24px)의 절반 이하 크기

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: EnemyProjectileConfig,
    angle: number
  ) {
    super(scene, x, y, texture);

    this.damage = config.damage;
    this.projectileSpeed = config.speed;
    this.lifetime = config.duration;
    this.moveAngle = angle;

    // 속도 미리 계산
    this.velocityX = Math.cos(angle) * this.projectileSpeed;
    this.velocityY = Math.sin(angle) * this.projectileSpeed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.PROJECTILES);
    this.setScale(this.baseScale);

    // 위협적인 색조 (보라/빨강 강조)
    this.setTint(0xff88ff);

    // 바디 설정 및 속도 적용
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(6, 6);
      body.setVelocity(this.velocityX, this.velocityY);
    }
  }

  override update(time: number, delta: number): void {
    if (!this.active) return;

    this.elapsed += delta;

    // 수명 체크
    if (this.elapsed >= this.lifetime) {
      this.destroy();
      return;
    }

    // 펄스 효과 (크기 + 투명도)
    const pulse = Math.sin(this.elapsed * 0.015) * 0.15;
    this.setScale(this.baseScale + pulse);
    this.setAlpha(0.85 + Math.sin(this.elapsed * 0.02) * 0.15);

    // 트레일 효과 (40ms마다)
    this.trailTimer += delta;
    if (this.trailTimer >= 40) {
      this.trailTimer = 0;
      this.createTrail();
    }
  }

  private createTrail(): void {
    if (!this.scene) return;

    const trail = this.scene.add.graphics();
    trail.setDepth(DEPTH.PROJECTILES - 1);
    trail.setPosition(this.x, this.y);

    // 보라/빨강 그라데이션 트레일
    trail.fillStyle(0x9933ff, 0.5);
    trail.fillCircle(0, 0, 4);
    trail.fillStyle(0xff3366, 0.3);
    trail.fillCircle(0, 0, 6);

    // 페이드아웃
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 150,
      onComplete: () => trail.destroy(),
    });
  }

  onHitPlayer(): void {
    // 피격 이펙트 (보라/빨강 폭발)
    if (this.scene) {
      const flash = this.scene.add.graphics();
      flash.setDepth(DEPTH.EFFECTS);
      flash.setPosition(this.x, this.y);

      // 다층 폭발 효과
      flash.fillStyle(0xff3366, 0.6);
      flash.fillCircle(0, 0, 12);
      flash.fillStyle(0x9933ff, 0.8);
      flash.fillCircle(0, 0, 8);
      flash.fillStyle(0xffffff, 0.9);
      flash.fillCircle(0, 0, 4);

      this.scene.tweens.add({
        targets: flash,
        scaleX: 2.5,
        scaleY: 2.5,
        alpha: 0,
        duration: 200,
        onComplete: () => flash.destroy(),
      });
    }

    this.destroy();
  }
}
