// Bloody Tear - 채찍 + 빈심장 진화 (흡혈 채찍)

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { DEPTH } from '../../../config/Constants';
import { Enemy } from '../../../entities/Enemy';

export class BloodyTear extends BaseWeapon {
  private player!: Player;

  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    this.player = player;
    const damage = this.getEffectiveDamage(player) * 2;
    const area = this.getEffectiveArea(player) * 1.5;
    const range = 180 * area;

    // 양쪽으로 채찍 공격
    const directions = [
      { angle: 0, flip: false },
      { angle: Math.PI, flip: true },
    ];

    directions.forEach((dir, index) => {
      this.scene.time.delayedCall(index * 100, () => {
        this.createBloodyWhipEffect(player, dir.angle, range, damage, dir.flip);
      });
    });
  }

  private createBloodyWhipEffect(
    player: Player,
    baseAngle: number,
    range: number,
    damage: number,
    flip: boolean
  ): void {
    // 채찍 그래픽
    const graphics = this.scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    // 피 같은 붉은색
    const color = 0xb13e53;

    // 채찍 스윙 애니메이션
    const startAngle = baseAngle - Math.PI / 3;
    const endAngle = baseAngle + Math.PI / 3;

    let currentAngle = startAngle;
    const hitEnemies = new Set<number>();

    const swingTween = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 150,
      ease: 'Power2',
      onUpdate: (tween) => {
        const progress = tween.getValue();
        currentAngle = Phaser.Math.Linear(startAngle, endAngle, progress);

        graphics.clear();

        // 채찍 곡선
        graphics.lineStyle(6, color, 0.9);
        graphics.beginPath();
        graphics.moveTo(player.x, player.y);

        const segments = 10;
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const dist = range * t;
          const waveOffset = Math.sin(t * Math.PI * 2 + progress * Math.PI) * 15;
          const x = player.x + Math.cos(currentAngle) * dist + Math.cos(currentAngle + Math.PI / 2) * waveOffset;
          const y = player.y + Math.sin(currentAngle) * dist + Math.sin(currentAngle + Math.PI / 2) * waveOffset;

          graphics.lineTo(x, y);
        }

        graphics.strokePath();

        // 채찍 끝 강조
        const tipX = player.x + Math.cos(currentAngle) * range;
        const tipY = player.y + Math.sin(currentAngle) * range;
        graphics.fillStyle(color, 1);
        graphics.fillCircle(tipX, tipY, 8);

        // 피 튀김 이펙트
        if (Math.random() < 0.3) {
          this.createBloodSplatter(tipX, tipY);
        }

        // 범위 내 적에게 데미지
        this.damageEnemiesInArc(player, currentAngle, range, damage, hitEnemies);
      },
      onComplete: () => {
        // 페이드 아웃
        this.scene.tweens.add({
          targets: graphics,
          alpha: 0,
          duration: 100,
          onComplete: () => graphics.destroy(),
        });
      },
    });
  }

  private damageEnemiesInArc(
    player: Player,
    angle: number,
    range: number,
    damage: number,
    hitEnemies: Set<number>
  ): void {
    const enemies = this.scene.children.getChildren()
      .filter(child => child.getData('isEnemy')) as Enemy[];

    const arcWidth = Math.PI / 4;

    enemies.forEach(enemy => {
      const enemyId = enemy.getData('objectId') || enemy.getData('enemyId');
      if (hitEnemies.has(enemyId)) return;

      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (dist > range) return;

      const enemyAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
      const angleDiff = Phaser.Math.Angle.Wrap(enemyAngle - angle);

      if (Math.abs(angleDiff) <= arcWidth) {
        hitEnemies.add(enemyId);

        const isDead = enemy.takeDamage(damage);

        // 흡혈 효과 (15% lifesteal)
        this.player.heal(damage * 0.15);
        this.createBloodDrainEffect(enemy.x, enemy.y, player.x, player.y);

        // 넉백
        const knockbackForce = 25;
        enemy.x += Math.cos(enemyAngle) * knockbackForce;
        enemy.y += Math.sin(enemyAngle) * knockbackForce;

        if (isDead) {
          this.scene.events.emit('enemyKilled', enemy);
        }
      }
    });
  }

  private createBloodSplatter(x: number, y: number): void {
    const splatter = this.scene.add.graphics();
    splatter.setDepth(DEPTH.EFFECTS - 1);
    splatter.fillStyle(0xb13e53, 0.7);

    // 랜덤 피 방울들
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      const size = 2 + Math.random() * 4;
      splatter.fillCircle(x + offsetX, y + offsetY, size);
    }

    this.scene.tweens.add({
      targets: splatter,
      alpha: 0,
      duration: 300,
      onComplete: () => splatter.destroy(),
    });
  }

  private createBloodDrainEffect(fromX: number, fromY: number, toX: number, toY: number): void {
    const blood = this.scene.add.graphics();
    blood.setDepth(DEPTH.EFFECTS);
    blood.fillStyle(0xb13e53, 0.8);
    blood.fillCircle(0, 0, 4);
    blood.setPosition(fromX, fromY);

    this.scene.tweens.add({
      targets: blood,
      x: toX,
      y: toY,
      alpha: 0,
      scale: 0.3,
      duration: 200,
      ease: 'Power2',
      onComplete: () => blood.destroy(),
    });
  }
}
