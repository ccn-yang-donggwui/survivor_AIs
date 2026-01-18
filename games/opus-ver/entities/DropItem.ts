import Phaser from 'phaser';
import { DEPTH } from '../config/Constants';

export type DropType = 'health' | 'coin' | 'chest' | 'magnet' | 'bomb';

export interface DropConfig {
  type: DropType;
  value: number;
}

export class DropItem extends Phaser.Physics.Arcade.Sprite {
  public dropType: DropType;
  public value: number;

  private isBeingCollected: boolean = false;
  private collectSpeed: number = 300;
  private target: Phaser.GameObjects.Sprite | null = null;
  private bobOffset: number = 0;
  private initialY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: DropConfig
  ) {
    const texture = DropItem.getTextureForType(config.type);
    super(scene, x, y, texture);

    this.dropType = config.type;
    this.value = config.value;
    this.initialY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.DROPS);
    this.setScale(2);

    // 스폰 애니메이션
    this.setAlpha(0);
    this.setScale(0.5);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 2,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  update(time: number, delta: number): void {
    if (this.isBeingCollected && this.target && this.target.active) {
      // 플레이어 방향으로 이동
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );

      this.collectSpeed = Math.min(600, this.collectSpeed + delta * 0.3);

      this.setVelocity(
        Math.cos(angle) * this.collectSpeed,
        Math.sin(angle) * this.collectSpeed
      );
    } else {
      // 위아래 흔들림 효과
      this.bobOffset += delta * 0.003;
      this.y = this.initialY + Math.sin(this.bobOffset) * 3;
    }
  }

  startCollecting(target: Phaser.GameObjects.Sprite): void {
    if (this.isBeingCollected) return;

    this.isBeingCollected = true;
    this.target = target;
    this.collectSpeed = 300;
  }

  isCollecting(): boolean {
    return this.isBeingCollected;
  }

  static getTextureForType(type: DropType): string {
    switch (type) {
      case 'health': return 'item_health';
      case 'coin': return 'item_coin';
      case 'chest': return 'item_chest';
      case 'magnet': return 'item_magnet';
      case 'bomb': return 'item_bomb';
      default: return 'item_coin';
    }
  }

  static getDropChance(type: DropType): number {
    switch (type) {
      case 'health': return 0.015; // 1.5% (하향 조정)
      case 'coin': return 0.08; // 8%
      case 'chest': return 0.003; // 0.3%
      case 'magnet': return 0.005; // 0.5% (체력의 1/3)
      case 'bomb': return 0.005; // 0.5% (체력의 1/3)
      default: return 0;
    }
  }
}
