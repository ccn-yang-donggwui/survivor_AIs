import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { DEPTH } from '../../config/Constants';
import { Enemy } from '../../entities/Enemy';

export class HolyWater extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const effectiveDuration = this.getEffectiveDuration(player);

    for (let i = 0; i < count; i++) {
      // 플레이어 주변 랜덤 위치
      const distance = 100 + Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      const x = player.x + Math.cos(angle) * distance;
      const y = player.y + Math.sin(angle) * distance;

      this.createPool(x, y, damage, area * 60, effectiveDuration);
    }
  }

  private createPool(x: number, y: number, damage: number, radius: number, duration: number): void {
    if (!this.scene) return;

    const scene = this.scene;

    // 웅덩이 그래픽
    const graphics = scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS - 1);
    graphics.setPosition(x, y);

    // 초기 애니메이션 (떨어지는 효과)
    graphics.setAlpha(0);
    graphics.setScale(0.3);

    scene.tweens.add({
      targets: graphics,
      alpha: 0.8,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Bounce.easeOut',
    });

    // 주기적 데미지
    const damageInterval = 200;
    let elapsed = 0;

    const damageTimer = scene.time.addEvent({
      delay: damageInterval,
      repeat: Math.floor(duration / damageInterval) - 1,
      callback: () => {
        if (!graphics.active) return;

        elapsed += damageInterval;

        // 그래픽 업데이트
        graphics.clear();
        graphics.fillStyle(0x41a6f6, 0.5 - (elapsed / duration) * 0.3);
        graphics.fillCircle(0, 0, radius);

        // 범위 내 적에게 데미지
        const enemies = scene.children.getChildren()
          .filter(child => child.getData('isEnemy')) as Enemy[];

        enemies.forEach(enemy => {
          const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
          if (dist <= radius) {
            const isDead = enemy.takeDamage(damage);
            if (isDead) {
              scene.events.emit('enemyKilled', enemy);
            }
          }
        });
      },
    });

    // 종료 처리
    scene.time.delayedCall(duration, () => {
      damageTimer.destroy();

      if (!graphics.active) return;

      scene.tweens.add({
        targets: graphics,
        alpha: 0,
        duration: 200,
        onComplete: () => graphics.destroy(),
      });
    });

    // 초기 그래픽
    graphics.fillStyle(0x41a6f6, 0.5);
    graphics.fillCircle(0, 0, radius);
  }
}
