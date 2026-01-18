// Thunder Loop - 번개반지 + 복제기 진화 (연쇄 번개)

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { DEPTH } from '../../../config/Constants';
import { Enemy } from '../../../entities/Enemy';

export class ThunderLoop extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    const count = this.getEffectiveProjectileCount(player) * 2;
    const damage = this.getEffectiveDamage(player) * 1.5;

    const enemies = this.findEnemiesInView(player);
    if (enemies.length === 0) return;

    // 초기 타겟들 선택
    const initialTargets = Phaser.Utils.Array.Shuffle([...enemies]).slice(0, Math.min(count, 3));

    initialTargets.forEach((target, index) => {
      this.scene.time.delayedCall(index * 150, () => {
        this.strikeChainLightning(target as Enemy, damage, enemies as Enemy[], 5);
      });
    });
  }

  private strikeChainLightning(
    target: Enemy,
    damage: number,
    allEnemies: Enemy[],
    chainCount: number
  ): void {
    if (!target.active || chainCount <= 0) return;

    const x = target.x;
    const y = target.y;

    // 번개 이펙트
    this.createLightningEffect(x, y);

    // 데미지
    const isDead = target.takeDamage(damage);
    if (isDead) {
      this.scene.events.emit('enemyKilled', target);
    }

    // 화면 흔들기 (첫 번째만)
    if (chainCount === 5) {
      this.scene.cameras.main.shake(50, 0.003);
    }

    // 연쇄 타겟 찾기
    if (chainCount > 1) {
      const chainRange = 150;
      const nextTargets = allEnemies.filter(e =>
        e !== target &&
        e.active &&
        Phaser.Math.Distance.Between(x, y, e.x, e.y) <= chainRange
      );

      if (nextTargets.length > 0) {
        const nextTarget = Phaser.Utils.Array.GetRandom(nextTargets);

        // 연결 번개 효과
        this.createChainEffect(x, y, nextTarget.x, nextTarget.y);

        // 다음 연쇄
        this.scene.time.delayedCall(100, () => {
          this.strikeChainLightning(nextTarget, damage * 0.8, allEnemies, chainCount - 1);
        });
      }
    }
  }

  private createLightningEffect(x: number, y: number): void {
    const graphics = this.scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    // 위에서 내려오는 번개
    const startY = y - 200;
    let currentX = x;
    let currentY = startY;

    graphics.lineStyle(4, 0xffcd75, 1);
    graphics.beginPath();
    graphics.moveTo(currentX, currentY);

    const segments = 6;
    const segmentHeight = 200 / segments;

    for (let i = 0; i < segments; i++) {
      currentY += segmentHeight;
      currentX = x + (Math.random() - 0.5) * 40;
      graphics.lineTo(currentX, currentY);
    }

    graphics.lineTo(x, y);
    graphics.strokePath();

    // 글로우 효과
    graphics.lineStyle(8, 0xffcd75, 0.3);
    graphics.strokePath();

    // 임팩트 원
    graphics.fillStyle(0xffcd75, 0.7);
    graphics.fillCircle(x, y, 25);

    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(x, y, 12);

    // 페이드 아웃
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 200,
      onComplete: () => graphics.destroy(),
    });
  }

  private createChainEffect(fromX: number, fromY: number, toX: number, toY: number): void {
    const graphics = this.scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    // 연결 번개
    graphics.lineStyle(3, 0x73eff7, 1);
    graphics.beginPath();
    graphics.moveTo(fromX, fromY);

    // 지그재그
    const segments = 4;
    const dx = (toX - fromX) / segments;
    const dy = (toY - fromY) / segments;

    let currentX = fromX;
    let currentY = fromY;

    for (let i = 0; i < segments; i++) {
      currentX += dx;
      currentY += dy;

      if (i < segments - 1) {
        const perpX = -dy * 0.2 * (Math.random() - 0.5);
        const perpY = dx * 0.2 * (Math.random() - 0.5);
        graphics.lineTo(currentX + perpX, currentY + perpY);
      } else {
        graphics.lineTo(toX, toY);
      }
    }

    graphics.strokePath();

    // 글로우
    graphics.lineStyle(6, 0x73eff7, 0.3);
    graphics.strokePath();

    // 페이드 아웃
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 150,
      onComplete: () => graphics.destroy(),
    });
  }
}
