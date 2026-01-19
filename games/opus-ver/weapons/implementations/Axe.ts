import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { AxeProjectile } from '../../entities/Projectile';

export class Axe extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    if (!this.scene) return;

    const scene = this.scene;
    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const piercing = this.getEffectivePiercing(player);
    const weaponId = this.id;

    for (let i = 0; i < count; i++) {
      scene.time.delayedCall(i * 150, () => {
        if (!player.active) return;

        // 위쪽으로 던지기 + 약간의 좌우 랜덤
        const velocityX = (Math.random() - 0.5) * 150; // -75 ~ 75
        const velocityY = -350 - Math.random() * 100;  // -350 ~ -450 (위쪽)

        const projectile = new AxeProjectile(
          scene,
          player.x,
          player.y,
          'projectile_axe',
          {
            damage,
            speed: 0, // 직접 velocity 관리
            piercing,
            duration: 5000, // 충분한 시간
            area: area * 1.5,
            knockback: 30,
          },
          weaponId,
          velocityX,
          velocityY
        );

        projectile.setData('weaponId', weaponId);

        const projectiles = scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
        if (projectiles) {
          projectiles.add(projectile);
        }
      });
    }
  }
}
