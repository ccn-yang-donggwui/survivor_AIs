import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';

export class MagicWand extends BaseWeapon {
  private projectileSpeed: number = 350;

  constructor(scene: GameScene) {
    super(scene, {
      id: 'magic_wand',
      name: '마법봉',
      icon: '🪄',
      baseDamage: 15,
      baseCooldown: 1000,
      baseProjectileCount: 1
    });
  }

  protected attack(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const projectileCount = this.getProjectileCount(player);
    const damage = this.getEffectiveDamage(player);

    for (let i = 0; i < projectileCount; i++) {
      // 랜덤 적 타겟
      const target = this.findRandomEnemy(enemies);

      if (target) {
        const angle = Phaser.Math.Angle.Between(
          player.x, player.y,
          target.x, target.y
        );

        const velocityX = Math.cos(angle) * this.projectileSpeed;
        const velocityY = Math.sin(angle) * this.projectileSpeed;

        // 약간의 딜레이로 연속 발사 효과
        this.scene.time.delayedCall(i * 100, () => {
          this.scene.spawnProjectile(
            player.x,
            player.y,
            'projectile_magic',
            velocityX,
            velocityY,
            damage,
            0
          );
        });
      } else {
        // 적이 없으면 랜덤 방향
        const angle = Math.random() * Math.PI * 2;
        const velocityX = Math.cos(angle) * this.projectileSpeed;
        const velocityY = Math.sin(angle) * this.projectileSpeed;

        this.scene.time.delayedCall(i * 100, () => {
          this.scene.spawnProjectile(
            player.x,
            player.y,
            'projectile_magic',
            velocityX,
            velocityY,
            damage,
            0
          );
        });
      }
    }
  }

  protected override onLevelUp(): void {
    // 레벨 3에서 관통 추가 가능
    // 레벨 5에서 데미지 보너스
  }
}
