import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';
import { DEPTH } from '../config/Constants';

export class Axe extends BaseWeapon {
  constructor(scene: GameScene) {
    super(scene, {
      id: 'axe',
      name: '도끼',
      icon: '🪓',
      baseDamage: 25,
      baseCooldown: 2000,
      baseProjectileCount: 1
    });
  }

  protected attack(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const projectileCount = this.getProjectileCount(player);
    const damage = this.getEffectiveDamage(player);

    for (let i = 0; i < projectileCount; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        this.throwAxe(player, damage, enemies);
      });
    }
  }

  private throwAxe(player: Player, damage: number, enemies: Phaser.Physics.Arcade.Group): void {
    // 도끼 스프라이트 생성
    const axe = this.scene.add.sprite(player.x, player.y, 'projectile_axe');
    axe.setDepth(DEPTH.PROJECTILES);

    // 랜덤 방향으로 던지기
    const angle = Math.random() * Math.PI * 2;
    const horizontalSpeed = Math.cos(angle) * 200;

    // 포물선 운동
    const startY = player.y;
    const peakHeight = 300;
    const duration = 1500;

    let elapsed = 0;
    const hitEnemies = new Set<number>();

    // 회전 애니메이션
    this.scene.tweens.add({
      targets: axe,
      rotation: Math.PI * 8,
      duration: duration,
      ease: 'Linear'
    });

    // 이동 업데이트
    const updateEvent = this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        elapsed += 16;
        const progress = elapsed / duration;

        // X 이동 (일정 속도)
        axe.x += horizontalSpeed * 0.016;

        // Y 이동 (포물선)
        const yOffset = -4 * peakHeight * progress * (progress - 1);
        axe.y = startY - yOffset;

        // 적과 충돌 체크
        enemies.getChildren().forEach((enemy) => {
          const e = enemy as Phaser.Physics.Arcade.Sprite;
          if (!e.active) return;

          const enemyId = (e as any).__id || ((e as any).__id = Math.random());

          if (!hitEnemies.has(enemyId)) {
            const dist = Phaser.Math.Distance.Between(axe.x, axe.y, e.x, e.y);
            if (dist < 40) {
              hitEnemies.add(enemyId);
              (e as any).takeDamage(damage);
              this.showDamageNumber(e.x, e.y, damage);
            }
          }
        });

        // 완료 시 제거
        if (progress >= 1) {
          axe.destroy();
          updateEvent.destroy();
        }
      },
      loop: true
    });
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x, y - 20, damage.toString(), {
      fontSize: '16px',
      color: '#ff8800',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    text.setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    });
  }
}
