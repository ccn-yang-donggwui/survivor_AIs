import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';
import { DEPTH } from '../config/Constants';

export class HolyWater extends BaseWeapon {
  private poolDuration: number = 2000;
  private poolRadius: number = 60;

  constructor(scene: GameScene) {
    super(scene, {
      id: 'holy_water',
      name: '성수',
      icon: '💧',
      baseDamage: 8,
      baseCooldown: 3000,
      baseProjectileCount: 1
    });
  }

  protected attack(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const count = this.getProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const duration = this.poolDuration * player.stats.duration;
    const radius = this.poolRadius * player.stats.area;

    for (let i = 0; i < count; i++) {
      // 랜덤 위치 (플레이어 주변)
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      const x = player.x + Math.cos(angle) * distance;
      const y = player.y + Math.sin(angle) * distance;

      this.createHolyWaterPool(x, y, damage, duration, radius, enemies);
    }
  }

  private createHolyWaterPool(
    x: number,
    y: number,
    damage: number,
    duration: number,
    radius: number,
    enemies: Phaser.Physics.Arcade.Group
  ): void {
    // 웅덩이 시각 효과
    const pool = this.scene.add.graphics();
    pool.setDepth(DEPTH.EFFECTS);

    // 초기 애니메이션 (떨어지는 효과)
    const dropY = y - 100;
    const drop = this.scene.add.circle(x, dropY, 10, 0x00aaff, 0.8);
    drop.setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: drop,
      y: y,
      duration: 300,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        drop.destroy();

        // 웅덩이 생성
        pool.fillStyle(0x00aaff, 0.5);
        pool.fillCircle(x, y, radius);

        // 데미지 틱
        const damageInterval = this.scene.time.addEvent({
          delay: 200,
          callback: () => {
            enemies.getChildren().forEach((enemy) => {
              const e = enemy as Phaser.Physics.Arcade.Sprite;
              if (!e.active) return;

              const dist = Phaser.Math.Distance.Between(x, y, e.x, e.y);
              if (dist <= radius) {
                (e as any).takeDamage(damage);
                this.showDamageEffect(e.x, e.y, damage);
              }
            });
          },
          repeat: Math.floor(duration / 200) - 1
        });

        // 페이드 아웃 및 제거
        this.scene.tweens.add({
          targets: pool,
          alpha: 0,
          duration: 500,
          delay: duration - 500,
          onComplete: () => {
            pool.destroy();
            damageInterval.destroy();
          }
        });
      }
    });
  }

  private showDamageEffect(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x + Phaser.Math.Between(-20, 20), y - 10, damage.toString(), {
      fontSize: '14px',
      color: '#00aaff'
    });
    text.setOrigin(0.5);
    text.setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy()
    });
  }

  protected onLevelUp(): void {
    if (this.level === 3) this.poolRadius = 75;
    if (this.level === 5) this.poolDuration = 2500;
    if (this.level === 7) this.poolRadius = 90;
  }
}
