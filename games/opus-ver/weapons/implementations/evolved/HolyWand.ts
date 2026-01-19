// Holy Wand - 마법봉 + 빈고서 진화

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { Projectile } from '../../../entities/Projectile';
import { DEPTH } from '../../../config/Constants';
import { Enemy } from '../../../entities/Enemy';

export class HolyWand extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    const count = this.getEffectiveProjectileCount(player) * 2;
    const damage = this.getEffectiveDamage(player) * 1.5;
    const area = this.getEffectiveArea(player) * 1.5;

    // 화면 내 적들
    const enemies = this.findEnemiesInView(player);
    if (enemies.length === 0) return;

    // 랜덤으로 타겟 선택
    const targets = Phaser.Utils.Array.Shuffle([...enemies]).slice(0, count);

    targets.forEach((target, index) => {
      this.scene.time.delayedCall(index * 80, () => {
        this.launchHolyProjectile(player, target as Enemy, damage, area);
      });
    });
  }

  private launchHolyProjectile(player: Player, target: Enemy, damage: number, area: number): void {
    if (!target.active) return;

    const projectile = new HolyProjectile(
      this.scene,
      player.x,
      player.y,
      'projectile_magic',
      {
        damage,
        speed: this.speed * 1.2,
        piercing: 3,
        duration: this.duration,
        area,
        knockback: 10,
      },
      this.id,
      target
    );

    projectile.setData('weaponId', this.id);

    const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
    if (projectiles) {
      projectiles.add(projectile);
    }
  }
}

// 성스러운 호밍 투사체
class HolyProjectile extends Projectile {
  private target: Enemy;
  private trailTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: any,
    weaponId: string,
    target: Enemy
  ) {
    super(scene, x, y, texture, config, weaponId);
    this.target = target;

    // 성스러운 이펙트 (노란 색조)
    this.setTint(0xffcd75);
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);

    // body가 없으면 리턴
    if (!this.body || !this.active) return;

    // 타겟 추적
    if (this.target && this.target.active) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      const currentAngle = Math.atan2(body.velocity.y, body.velocity.x);

      // 부드러운 회전
      const turnRate = 0.15;
      const newAngle = Phaser.Math.Angle.RotateTo(currentAngle, angle, turnRate);

      const speed = Math.sqrt(
        body.velocity.x * body.velocity.x +
        body.velocity.y * body.velocity.y
      );

      this.setVelocity(
        Math.cos(newAngle) * speed,
        Math.sin(newAngle) * speed
      );
    }

    // 트레일 이펙트
    this.trailTimer += delta;
    if (this.trailTimer > 50) {
      this.trailTimer = 0;
      this.createTrail();
    }
  }

  private createTrail(): void {
    const trail = this.scene.add.graphics();
    trail.setDepth(DEPTH.EFFECTS - 1);
    trail.fillStyle(0xffcd75, 0.5);
    trail.fillCircle(this.x, this.y, 4);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.5,
      duration: 200,
      onComplete: () => trail.destroy(),
    });
  }
}
