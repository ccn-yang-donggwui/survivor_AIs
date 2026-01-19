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
    this.setScale(1.5);

    // 회전 설정 제거 (해골 모양은 회전하면 안됨)
    // this.setRotation(angle);

    // 바디 설정 및 속도 적용
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(8, 8);
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

    // 부드러운 흔들림 (해골 모양이므로 회전 대신)
    this.setScale(1.5 + Math.sin(this.elapsed * 0.01) * 0.1);
  }

  onHitPlayer(): void {
    // 피격 이펙트
    if (this.scene) {
      const flash = this.scene.add.graphics();
      flash.setDepth(DEPTH.EFFECTS);
      flash.setPosition(this.x, this.y);
      flash.fillStyle(0xffffff, 0.8);
      flash.fillCircle(0, 0, 10);

      this.scene.tweens.add({
        targets: flash,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 150,
        onComplete: () => flash.destroy(),
      });
    }

    this.destroy();
  }
}
