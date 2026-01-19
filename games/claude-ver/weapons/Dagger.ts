import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';

export class Dagger extends BaseWeapon {
  private projectileSpeed: number = 400;

  constructor(scene: GameScene) {
    super(scene, {
      id: 'dagger',
      name: '단검',
      icon: '🗡️',
      baseDamage: 10,
      baseCooldown: 500,
      baseProjectileCount: 1
    });
  }

  protected attack(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const projectileCount = this.getProjectileCount(player);
    const damage = this.getEffectiveDamage(player);

    const nearestEnemy = this.findNearestEnemy(player, enemies);

    for (let i = 0; i < projectileCount; i++) {
      let angle: number;

      if (nearestEnemy) {
        // 가장 가까운 적 방향
        angle = Phaser.Math.Angle.Between(
          player.x, player.y,
          nearestEnemy.x, nearestEnemy.y
        );
        // 다중 투사체 시 약간의 스프레드 추가
        if (projectileCount > 1) {
          const spread = 0.2;
          angle += (i - (projectileCount - 1) / 2) * spread;
        }
      } else {
        // 적이 없으면 플레이어가 바라보는 방향
        const dir = player.getLastDirection();
        angle = Math.atan2(dir.y, dir.x);
        if (projectileCount > 1) {
          const spread = 0.3;
          angle += (i - (projectileCount - 1) / 2) * spread;
        }
      }

      const velocityX = Math.cos(angle) * this.projectileSpeed;
      const velocityY = Math.sin(angle) * this.projectileSpeed;

      this.scene.spawnProjectile(
        player.x,
        player.y,
        'projectile_dagger',
        velocityX,
        velocityY,
        damage,
        0
      );
    }
  }

  protected override onLevelUp(): void {
    // 레벨업 효과
    if (this.level === 5) {
      this.projectileSpeed = 500;
    }
  }
}
