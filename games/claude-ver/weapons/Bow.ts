import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';

export class Bow extends BaseWeapon {
  private projectileSpeed: number = 500;
  private basePiercing: number = 2;

  constructor(scene: GameScene) {
    super(scene, {
      id: 'bow',
      name: '활',
      icon: '🏹',
      baseDamage: 20,
      baseCooldown: 1200,
      baseProjectileCount: 1
    });
  }

  protected attack(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const projectileCount = this.getProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const piercing = this.basePiercing + Math.floor(this.level / 3);

    const nearestEnemy = this.findNearestEnemy(player, enemies);

    for (let i = 0; i < projectileCount; i++) {
      let angle: number;

      if (nearestEnemy) {
        angle = Phaser.Math.Angle.Between(
          player.x, player.y,
          nearestEnemy.x, nearestEnemy.y
        );
      } else {
        const dir = player.getLastDirection();
        angle = Math.atan2(dir.y, dir.x);
      }

      // 다중 투사체 시 약간의 각도 차이
      if (projectileCount > 1) {
        const spread = 0.15;
        angle += (i - (projectileCount - 1) / 2) * spread;
      }

      const velocityX = Math.cos(angle) * this.projectileSpeed;
      const velocityY = Math.sin(angle) * this.projectileSpeed;

      // 화살 발사 딜레이
      this.scene.time.delayedCall(i * 80, () => {
        this.scene.spawnProjectile(
          player.x,
          player.y,
          'projectile_arrow',
          velocityX,
          velocityY,
          damage,
          piercing
        );
      });
    }
  }

  protected override onLevelUp(): void {
    if (this.level === 5) this.projectileSpeed = 600;
  }
}
