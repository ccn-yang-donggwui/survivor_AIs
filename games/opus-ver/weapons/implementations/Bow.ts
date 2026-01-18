import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { Projectile } from '../../entities/Projectile';

export class Bow extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    if (!this.scene) return;

    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);

    // 가장 가까운 적 찾기
    const target = this.findNearestEnemy(player);
    let baseAngle: number;

    if (target) {
      baseAngle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    } else {
      baseAngle = Math.atan2(player.lastDirection.y, player.lastDirection.x);
    }

    // 관통 무기: 동시 발사 (spread) - 여러 방향으로 퍼져나감
    const spread = 0.15; // 화살 간 각도 간격

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spread;
      const angle = baseAngle + angleOffset;

      const projectile = new Projectile(
        this.scene,
        player.x,
        player.y,
        'projectile_arrow',
        {
          damage,
          speed: this.speed,
          piercing: this.piercing,
          duration: 2500,
          area,
          knockback: this.knockback,
        },
        this.id
      );

      projectile.setData('weaponId', this.id);

      const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
      if (projectiles) {
        projectiles.add(projectile);
      }

      projectile.setVelocityFromAngle(angle, this.speed);
    }
  }
}
