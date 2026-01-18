import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { DEPTH } from '../../config/Constants';
import { Enemy } from '../../entities/Enemy';

export class Whip extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    if (!this.scene) return;

    const scene = this.scene;
    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const effectiveRange = this.range * area;
    const effectiveWidth = 60 * area;

    // 플레이어가 보는 방향
    const direction = player.lastDirection;
    const angle = Math.atan2(direction.y, direction.x);

    // 공격 범위 중심점
    const centerX = player.x + Math.cos(angle) * (effectiveRange / 2);
    const centerY = player.y + Math.sin(angle) * (effectiveRange / 2);

    // 시각 효과 (Graphics로 채찍 그리기)
    const graphics = scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    // 채찍 곡선
    graphics.lineStyle(4, 0xffcd75, 1);
    graphics.beginPath();
    graphics.moveTo(player.x, player.y);

    const segments = 8;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const px = player.x + Math.cos(angle) * effectiveRange * t;
      const py = player.y + Math.sin(angle) * effectiveRange * t +
        Math.sin(t * Math.PI * 3) * 10;
      graphics.lineTo(px, py);
    }
    graphics.strokePath();

    // 페이드 아웃
    scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 200,
      onComplete: () => graphics.destroy(),
    });

    // 범위 내 적에게 데미지
    const enemies = scene.children.getChildren()
      .filter(child => child.getData('isEnemy')) as Enemy[];

    enemies.forEach(enemy => {
      // 사각형 범위 체크 (간단화)
      const dx = enemy.x - centerX;
      const dy = enemy.y - centerY;

      // 방향 벡터로 회전된 좌표
      const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
      const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle);

      if (Math.abs(rotatedX) <= effectiveRange / 2 &&
          Math.abs(rotatedY) <= effectiveWidth / 2) {
        const isDead = enemy.takeDamage(damage);

        // 넉백
        if (!isDead && this.knockback > 0) {
          const knockAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
          enemy.x += Math.cos(knockAngle) * this.knockback;
          enemy.y += Math.sin(knockAngle) * this.knockback;
        }

        if (isDead) {
          scene.events.emit('enemyKilled', enemy);
        }
      }
    });
  }
}
