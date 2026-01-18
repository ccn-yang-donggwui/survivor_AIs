import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { DEPTH } from '../../config/Constants';
import { Enemy } from '../../entities/Enemy';

export class LightningRing extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    if (!this.scene) return;

    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const scene = this.scene;

    // 화면 내 적들
    const enemies = this.findEnemiesInView(player);
    if (enemies.length === 0) return;

    // 스마트 타겟팅: 체력 낮은 적 우선 + 가까운 적 혼합
    const sortedByHp = [...enemies].sort((a, b) => {
      const hpA = a.getData('currentHp') || a.getData('hp') || 100;
      const hpB = b.getData('currentHp') || b.getData('hp') || 100;
      return hpA - hpB;
    });

    const sortedByDistance = [...enemies].sort((a, b) => {
      const distA = Phaser.Math.Distance.Between(player.x, player.y, a.x, a.y);
      const distB = Phaser.Math.Distance.Between(player.x, player.y, b.x, b.y);
      return distA - distB;
    });

    // 절반은 체력 낮은 적, 절반은 가까운 적
    const halfCount = Math.ceil(count / 2);
    const targets = new Set<Phaser.GameObjects.Sprite>();

    for (let i = 0; i < halfCount && i < sortedByHp.length; i++) {
      targets.add(sortedByHp[i]);
    }
    for (let i = 0; targets.size < count && i < sortedByDistance.length; i++) {
      targets.add(sortedByDistance[i]);
    }

    Array.from(targets).forEach((target, index) => {
      scene.time.delayedCall(index * 80, () => {
        if (target.active) {
          this.strikeLightning(target as Enemy, damage, scene);
        }
      });
    });
  }

  private strikeLightning(target: Enemy, damage: number, scene: Phaser.Scene): void {
    if (!target.active) return;

    const x = target.x;
    const y = target.y;

    // 번개 그래픽
    const graphics = scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    // 지그재그 번개 그리기
    graphics.lineStyle(3, 0xffcd75, 1);
    graphics.beginPath();

    const startY = y - 300;
    graphics.moveTo(x, startY);

    let currentX = x;
    let currentY = startY;
    const segments = 8;
    const segmentHeight = 300 / segments;

    for (let i = 0; i < segments; i++) {
      currentY += segmentHeight;
      currentX += (Math.random() - 0.5) * 30;
      graphics.lineTo(currentX, currentY);
    }

    graphics.strokePath();

    // 임팩트 원
    graphics.fillStyle(0xffcd75, 0.5);
    graphics.fillCircle(x, y, 20);

    // 화면 흔들기
    scene.cameras.main.shake(50, 0.003);

    // 데미지
    const isDead = target.takeDamage(damage);
    if (isDead) {
      scene.events.emit('enemyKilled', target);
    }

    // 페이드 아웃
    scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 150,
      onComplete: () => graphics.destroy(),
    });
  }
}
