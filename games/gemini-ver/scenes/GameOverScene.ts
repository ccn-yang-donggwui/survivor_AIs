import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { score: number }) {
    this.cameras.main.setBackgroundColor('#000000');

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add.text(centerX, centerY - 100, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY, `Final Kills: ${data.score}`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const restartBtn = this.add.text(centerX, centerY + 100, 'Click to Restart', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5).setInteractive();

    restartBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    restartBtn.on('pointerover', () => restartBtn.setColor('#ffffff'));
    restartBtn.on('pointerout', () => restartBtn.setColor('#ffff00'));
  }
}
