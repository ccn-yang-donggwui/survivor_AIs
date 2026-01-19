import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { Projectile } from '../../entities/Projectile';

export class Dagger extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    if (!this.scene) return;

    const scene = this.scene;
    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const speed = this.speed;
    const piercing = this.getEffectivePiercing(player);
    const knockback = this.knockback;
    const weaponId = this.id;

    // 연발 발사 (관통이 없으므로 같은 방향으로 연속 발사)
    for (let i = 0; i < count; i++) {
      scene.time.delayedCall(i * 80, () => {
        if (!player.active) return;

        // 발사 시점마다 타겟 재탐색 (적이 움직이므로)
        const target = this.findNearestEnemy(player);
        let angle: number;

        if (target) {
          angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
        } else {
          angle = Math.atan2(player.lastDirection.y, player.lastDirection.x);
        }

        const projectile = new Projectile(
          scene,
          player.x,
          player.y,
          'projectile_dagger',
          {
            damage,
            speed,
            piercing,
            duration: 2000,
            area,
            knockback,
          },
          weaponId
        );

        projectile.setData('weaponId', weaponId);

        const projectiles = scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
        if (projectiles) {
          projectiles.add(projectile);
        }

        projectile.setVelocityFromAngle(angle, speed);
      });
    }
  }
}
