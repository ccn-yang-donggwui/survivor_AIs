// Thousand Edge - 단검 + 팔찌 진화

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { Projectile } from '../../../entities/Projectile';

export class ThousandEdge extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    const count = this.getEffectiveProjectileCount(player) * 2; // 2배 투사체
    const damage = this.getEffectiveDamage(player) * 1.5; // 1.5배 데미지

    const target = this.findNearestEnemy(player);
    let baseAngle: number;

    if (target) {
      baseAngle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    } else {
      baseAngle = Math.atan2(player.lastDirection.y, player.lastDirection.x);
    }

    // 부채꼴로 발사
    const spread = Math.PI / 3; // 60도 부채꼴
    const angleStep = spread / (count - 1 || 1);

    for (let i = 0; i < count; i++) {
      const angle = baseAngle - spread / 2 + angleStep * i;

      // 약간의 발사 딜레이로 연속 효과
      this.scene.time.delayedCall(i * 30, () => {
        // scene이나 player가 유효하지 않으면 리턴
        if (!this.scene || !player.active) return;

        const projectile = new Projectile(
          this.scene,
          player.x,
          player.y,
          'projectile_dagger',
          {
            damage,
            speed: this.speed * 1.3,
            piercing: 999, // 무한 관통
            duration: this.duration,
            area: 1,
            knockback: 5,
          },
          this.id
        );

        projectile.setData('weaponId', this.id);

        const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
        if (projectiles) {
          projectiles.add(projectile);
        }

        // 그룹 추가 후 velocity 설정
        projectile.setVelocityFromAngle(angle, this.speed * 1.3);
      });
    }
  }
}
