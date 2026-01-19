import Phaser from 'phaser';

export class ExpGem extends Phaser.Physics.Arcade.Sprite {
  public value: number;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number) {
    super(scene, x, y, 'exp_gem');

    this.value = value;
    this.setOrigin(0.5);

    // 크기에 따른 스케일
    if (value >= 10) {
      this.setScale(1.5);
      this.setTint(0x00ffff);
    } else if (value >= 5) {
      this.setScale(1.2);
      this.setTint(0x00ff88);
    }

    // 드롭 애니메이션
    this.scene.tweens.add({
      targets: this,
      y: y + 10,
      duration: 300,
      ease: 'Bounce.easeOut'
    });
  }

  public override update(): void {
    // 부드러운 부유 효과
    // 실제 애니메이션은 GameScene에서 자석 효과로 처리
  }
}
