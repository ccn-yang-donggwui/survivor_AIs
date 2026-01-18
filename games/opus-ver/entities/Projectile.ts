import Phaser from 'phaser';
import type { ProjectileConfig } from '../types/GameTypes';
import { DEPTH } from '../config/Constants';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number;
  public piercing: number;
  public knockback: number;
  public hitEnemies: Set<number> = new Set();

  private lifetime: number;
  private maxLifetime: number;
  private weaponId: string;
  private isOrbiting: boolean = false;
  private orbitAngle: number = 0;
  private orbitRadius: number = 0;
  private orbitTarget: Phaser.GameObjects.Sprite | null = null;
  private orbitSpeed: number = 0.003;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: ProjectileConfig,
    weaponId: string
  ) {
    super(scene, x, y, texture);

    this.weaponId = weaponId;
    this.damage = config.damage;
    this.piercing = config.piercing;
    this.knockback = config.knockback;
    this.maxLifetime = config.duration;
    this.lifetime = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.PROJECTILES);
    this.setScale(config.area * 2);

    // 바디 설정
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(6, 6);
  }

  update(time: number, delta: number): void {
    this.lifetime += delta;

    if (this.lifetime >= this.maxLifetime) {
      this.destroy();
      return;
    }

    // 궤도 운동
    if (this.isOrbiting && this.orbitTarget && this.orbitTarget.active) {
      this.orbitAngle += this.orbitSpeed * delta;
      this.x = this.orbitTarget.x + Math.cos(this.orbitAngle) * this.orbitRadius;
      this.y = this.orbitTarget.y + Math.sin(this.orbitAngle) * this.orbitRadius;
    }
  }

  setVelocityFromAngle(angle: number, speed: number): void {
    this.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    this.setRotation(angle);
  }

  setOrbit(target: Phaser.GameObjects.Sprite, radius: number, startAngle: number, speed: number): void {
    this.isOrbiting = true;
    this.orbitTarget = target;
    this.orbitRadius = radius;
    this.orbitAngle = startAngle;
    this.orbitSpeed = speed;

    // 속도는 0으로
    this.setVelocity(0, 0);
  }

  onHitEnemy(enemyId: number): boolean {
    // 이미 맞힌 적인지 확인
    if (this.hitEnemies.has(enemyId)) {
      return false;
    }

    this.hitEnemies.add(enemyId);

    // 관통력 감소
    this.piercing--;

    if (this.piercing < 0) {
      this.destroy();
    }

    return true;
  }

  canHitEnemy(enemyId: number): boolean {
    return !this.hitEnemies.has(enemyId);
  }

  getWeaponId(): string {
    return this.weaponId;
  }
}

// 도끼용 특수 투사체 (포물선 - 원작 스타일)
export class AxeProjectile extends Projectile {
  private gravity: number = 400; // 중력 가속도
  private velocityY: number;
  private velocityX: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: ProjectileConfig,
    weaponId: string,
    initialVelocityX: number = 0,
    initialVelocityY: number = -350 // 위쪽으로 던지기
  ) {
    super(scene, x, y, texture, config, weaponId);
    this.velocityX = initialVelocityX;
    this.velocityY = initialVelocityY;
  }

  update(time: number, delta: number): void {
    // body 체크 (부모 클래스의 duration 체크 등)
    if (!this.active || !this.scene) return;

    const deltaSeconds = delta / 1000;

    // 중력 적용
    this.velocityY += this.gravity * deltaSeconds;

    // 위치 업데이트
    this.x += this.velocityX * deltaSeconds;
    this.y += this.velocityY * deltaSeconds;

    // 회전 (던지는 느낌)
    this.rotation += delta * 0.015;

    // 화면 아래로 벗어나면 제거
    if (this.y > this.scene.scale.height + 100) {
      this.destroy();
    }
  }
}
