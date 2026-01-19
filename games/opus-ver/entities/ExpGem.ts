import Phaser from 'phaser';
import { DEPTH } from '../config/Constants';

// 5가지 경험치 젬 종류
export type GemSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

// 경험치 젬 설정
export const GEM_CONFIG: Record<GemSize, { minExp: number; texture: string; scale: number; tint?: number }> = {
  tiny:   { minExp: 0,  texture: 'item_exp_tiny',   scale: 0.7 },
  small:  { minExp: 3,  texture: 'item_exp_small',  scale: 0.85 },
  medium: { minExp: 7,  texture: 'item_exp_medium', scale: 1.0 },
  large:  { minExp: 15, texture: 'item_exp_large',  scale: 1.15 },
  huge:   { minExp: 30, texture: 'item_exp_huge',   scale: 1.3 },
};

export class ExpGem extends Phaser.Physics.Arcade.Sprite {
  public expValue: number;
  public gemSize: GemSize;

  private isBeingCollected: boolean = false;
  private collectSpeed: number = 400;
  private target: Phaser.GameObjects.Sprite | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    expValue: number
  ) {
    // 경험치 값에 따라 크기 결정 (5단계)
    let size: GemSize;

    if (expValue >= 30) {
      size = 'huge';
    } else if (expValue >= 15) {
      size = 'large';
    } else if (expValue >= 7) {
      size = 'medium';
    } else if (expValue >= 3) {
      size = 'small';
    } else {
      size = 'tiny';
    }

    const config = GEM_CONFIG[size];
    super(scene, x, y, config.texture);

    this.expValue = expValue;
    this.gemSize = size;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.DROPS);

    // 바디 설정
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);

    // 크기별 스케일 적용
    const baseScale = config.scale;

    // 스폰 애니메이션 (스케일만 바운스, alpha는 별도)
    this.setAlpha(0);
    this.setScale(baseScale * 0.5);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 100,
      ease: 'Sine.easeOut',
    });
    scene.tweens.add({
      targets: this,
      scale: baseScale * 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.setScale(baseScale);
      }
    });
  }

  override update(time: number, delta: number): void {
    if (this.isBeingCollected && this.target && this.target.active) {
      // 플레이어 방향으로 이동
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        this.target.x, this.target.y
      );

      // 가속
      this.collectSpeed = Math.min(800, this.collectSpeed + delta * 0.5);

      this.setVelocity(
        Math.cos(angle) * this.collectSpeed,
        Math.sin(angle) * this.collectSpeed
      );
    }
  }

  startCollecting(target: Phaser.GameObjects.Sprite): void {
    if (this.isBeingCollected) return;

    this.isBeingCollected = true;
    this.target = target;
    this.collectSpeed = 400;
  }

  isCollecting(): boolean {
    return this.isBeingCollected;
  }

  static getTextureForValue(expValue: number): string {
    if (expValue >= 30) return 'item_exp_huge';
    if (expValue >= 15) return 'item_exp_large';
    if (expValue >= 7) return 'item_exp_medium';
    if (expValue >= 3) return 'item_exp_small';
    return 'item_exp_tiny';
  }

  static getSizeForValue(expValue: number): GemSize {
    if (expValue >= 30) return 'huge';
    if (expValue >= 15) return 'large';
    if (expValue >= 7) return 'medium';
    if (expValue >= 3) return 'small';
    return 'tiny';
  }
}
