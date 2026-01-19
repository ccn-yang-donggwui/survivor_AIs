import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { DEPTH } from '../../config/Constants';
import { Enemy } from '../../entities/Enemy';

export class Garlic extends BaseWeapon {
  private auraGraphics: Phaser.GameObjects.Graphics | null = null;
  private lastDamageTime: number = 0;

  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  override update(time: number, delta: number, player: Player): void {
    if (!this.scene) return;

    const area = this.getEffectiveArea(player);
    const radius = 80 * area;

    // 오라 그래픽 업데이트
    if (!this.auraGraphics) {
      this.auraGraphics = this.scene.add.graphics();
      this.auraGraphics.setDepth(DEPTH.EFFECTS - 2);
    }

    this.auraGraphics.clear();
    this.auraGraphics.setPosition(player.x, player.y);

    // 펄스 효과
    const pulse = 1 + Math.sin(time * 0.005) * 0.1;

    this.auraGraphics.fillStyle(0xa7f070, 0.15);
    this.auraGraphics.fillCircle(0, 0, radius * pulse);

    this.auraGraphics.lineStyle(2, 0xa7f070, 0.4);
    this.auraGraphics.strokeCircle(0, 0, radius * pulse);

    // 데미지 타이머
    this.currentCooldown -= delta;
    if (this.currentCooldown <= 0) {
      this.attack(player);
      this.currentCooldown = this.getEffectiveCooldown(player);
    }
  }

  protected attack(player: Player): void {
    if (!this.scene) return;

    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const radius = 80 * area;

    const enemies = this.scene.children.getChildren()
      .filter(child => child.getData('isEnemy')) as Enemy[];

    enemies.forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (dist <= radius) {
        const isDead = enemy.takeDamage(damage);

        // 넉백
        if (!isDead && this.knockback > 0) {
          const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
          enemy.x += Math.cos(angle) * this.knockback;
          enemy.y += Math.sin(angle) * this.knockback;
        }

        if (isDead) {
          this.scene.events.emit('enemyKilled', enemy);
        }
      }
    });
  }

  destroy(): void {
    if (this.auraGraphics) {
      this.auraGraphics.destroy();
      this.auraGraphics = null;
    }
  }
}
