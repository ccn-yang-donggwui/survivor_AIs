import Phaser from 'phaser';
import { DEPTH, COLORS } from '../config/Constants';

export type DropType = 'heal' | 'magnet' | 'chest' | 'gold';

interface DropConfig {
  texture: string;
  tint?: number;
  scale?: number;
}

const DROP_CONFIGS: Record<DropType, DropConfig> = {
  heal: { texture: 'meat', scale: 1.2 },
  magnet: { texture: 'exp_gem', tint: 0xff00ff, scale: 1.5 },
  chest: { texture: 'chest', scale: 1.5 },
  gold: { texture: 'exp_gem', tint: COLORS.GOLD, scale: 1 }
};

export class DropItem extends Phaser.Physics.Arcade.Sprite {
  public dropType: DropType;
  public value: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: DropType, value: number = 0) {
    const config = DROP_CONFIGS[type];
    super(scene, x, y, config.texture);

    this.dropType = type;
    this.value = value;

    this.setOrigin(0.5);
    this.setDepth(DEPTH.DROPS);

    if (config.scale) {
      this.setScale(config.scale);
    }

    if (config.tint) {
      this.setTint(config.tint);
    }

    // 드롭 애니메이션
    this.scene.tweens.add({
      targets: this,
      y: y + 10,
      duration: 300,
      ease: 'Bounce.easeOut'
    });

    // 부유 애니메이션
    this.scene.tweens.add({
      targets: this,
      y: y + 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 자석 아이템은 빛나는 효과
    if (type === 'magnet') {
      this.scene.tweens.add({
        targets: this,
        alpha: 0.6,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  public collect(): { type: DropType; value: number } {
    return {
      type: this.dropType,
      value: this.value
    };
  }
}
