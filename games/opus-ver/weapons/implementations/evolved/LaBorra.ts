// La Borra - 성수 + 자석구슬 진화 (거대 데미지 영역)

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { DEPTH } from '../../../config/Constants';
import { Enemy } from '../../../entities/Enemy';

export class LaBorra extends BaseWeapon {
  private auraGraphics: Phaser.GameObjects.Graphics | null = null;
  private damageTimer: number = 0;
  private player!: Player;

  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  update(time: number, delta: number, player: Player): void {
    this.player = player;
    const area = this.getEffectiveArea(player);
    const radius = 150 * area;

    // 거대 오라 그래픽
    if (!this.auraGraphics) {
      this.auraGraphics = this.scene.add.graphics();
      this.auraGraphics.setDepth(DEPTH.EFFECTS - 2);
    }

    this.auraGraphics.clear();
    this.auraGraphics.setPosition(player.x, player.y);

    // 다층 오라 효과
    const pulse = 1 + Math.sin(time * 0.003) * 0.1;
    const innerPulse = 1 + Math.sin(time * 0.005 + Math.PI) * 0.15;

    // 외부 오라 (파란색)
    this.auraGraphics.fillStyle(0x41a6f6, 0.15);
    this.auraGraphics.fillCircle(0, 0, radius * pulse);

    // 중간 오라
    this.auraGraphics.fillStyle(0x73eff7, 0.2);
    this.auraGraphics.fillCircle(0, 0, radius * 0.7 * innerPulse);

    // 내부 오라
    this.auraGraphics.fillStyle(0x41a6f6, 0.25);
    this.auraGraphics.fillCircle(0, 0, radius * 0.4 * pulse);

    // 외곽선
    this.auraGraphics.lineStyle(3, 0x41a6f6, 0.5);
    this.auraGraphics.strokeCircle(0, 0, radius * pulse);

    // 회전하는 파티클 효과
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (time * 0.002) + (i * Math.PI * 2 / particleCount);
      const dist = radius * 0.6;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;

      this.auraGraphics.fillStyle(0x73eff7, 0.8);
      this.auraGraphics.fillCircle(px, py, 5);
    }

    // 데미지 타이머
    this.damageTimer += delta;
    if (this.damageTimer >= 100) { // 100ms마다 데미지
      this.damageTimer = 0;
      this.dealDamage(player, radius);
    }
  }

  private dealDamage(player: Player, radius: number): void {
    const damage = this.getEffectiveDamage(player) * 0.5;

    const enemies = this.scene.children.getChildren()
      .filter(child => child.getData('isEnemy')) as Enemy[];

    enemies.forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (dist <= radius) {
        const isDead = enemy.takeDamage(damage);

        // 끌어당기는 효과
        const pullStrength = 2;
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * pullStrength;
        enemy.y += Math.sin(angle) * pullStrength;

        if (isDead) {
          this.scene.events.emit('enemyKilled', enemy);
        }
      }
    });
  }

  protected attack(player: Player): void {
    // La Borra는 지속적인 오라 효과이므로 별도 attack 없음
  }

  destroy(): void {
    if (this.auraGraphics) {
      this.auraGraphics.destroy();
      this.auraGraphics = null;
    }
  }
}
