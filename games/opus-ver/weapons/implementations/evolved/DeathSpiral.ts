// Death Spiral - 도끼 + 촛대 진화 (거대 회전 도끼)

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { Projectile } from '../../../entities/Projectile';
import { DEPTH } from '../../../config/Constants';

export class DeathSpiral extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player) * 2.5;
    const area = this.getEffectiveArea(player) * 2;

    // 8방향으로 거대 도끼 발사
    const directions = 8;
    const angleStep = (Math.PI * 2) / directions;

    for (let i = 0; i < directions; i++) {
      const angle = angleStep * i;

      const projectile = new DeathSpiralProjectile(
        this.scene,
        player.x,
        player.y,
        'projectile_axe',
        {
          damage,
          speed: this.speed * 0.6,
          piercing: 999,
          duration: this.duration * 3,
          area: area * 2,
          knockback: 30,
        },
        this.id
      );

      projectile.setScale(area * 1.5);
      projectile.setData('weaponId', this.id);

      const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
      if (projectiles) {
        projectiles.add(projectile);
      }

      // 그룹 추가 후 velocity 설정
      projectile.setVelocityFromAngle(angle, this.speed * 0.6);
    }

    // 화면 흔들기
    this.scene.cameras.main.shake(150, 0.008);
  }
}

// 죽음의 회전 도끼 투사체
class DeathSpiralProjectile extends Projectile {
  private rotationSpeed: number = 0.02;
  private currentRotation: number = 0;
  private bounceCount: number = 0;
  private maxBounces: number = 3;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: any,
    weaponId: string
  ) {
    super(scene, x, y, texture, config, weaponId);

    // 붉은 색조
    this.setTint(0xb13e53);
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);

    // 빠른 회전
    this.currentRotation += this.rotationSpeed * delta;
    this.setRotation(this.currentRotation);

    // 경계에서 반사
    this.checkBounce();

    // 트레일 이펙트
    if (Math.random() < 0.4) {
      this.createTrail();
    }
  }

  private checkBounce(): void {
    if (this.bounceCount >= this.maxBounces) return;

    const camera = this.scene.cameras.main;
    const margin = 50;

    const minX = camera.scrollX - margin;
    const maxX = camera.scrollX + camera.width + margin;
    const minY = camera.scrollY - margin;
    const maxY = camera.scrollY + camera.height + margin;

    let bounced = false;

    if (this.x < minX || this.x > maxX) {
      this.body!.velocity.x *= -1;
      bounced = true;
    }
    if (this.y < minY || this.y > maxY) {
      this.body!.velocity.y *= -1;
      bounced = true;
    }

    if (bounced) {
      this.bounceCount++;
      this.scene.cameras.main.shake(50, 0.003);
    }
  }

  private createTrail(): void {
    const trail = this.scene.add.graphics();
    trail.setDepth(DEPTH.EFFECTS - 1);
    trail.fillStyle(0xb13e53, 0.4);
    trail.fillCircle(this.x, this.y, 8);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.3,
      duration: 200,
      onComplete: () => trail.destroy(),
    });
  }
}
