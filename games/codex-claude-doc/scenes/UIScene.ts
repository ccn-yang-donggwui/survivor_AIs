import Phaser from 'phaser';
import { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  private timerText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private elapsed = 0;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.timerText = this.add
      .text(20, 18, 'Time 00:00', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#f4f6fb'
      })
      .setScrollFactor(0);

    this.healthText = this.add
      .text(20, 42, 'HP 100/100', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '16px',
        color: '#ffd2d2'
      })
      .setScrollFactor(0);

    this.levelText = this.add
      .text(20, 64, 'Lv 1 XP 0/40', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '16px',
        color: '#c7f5d8'
      })
      .setScrollFactor(0);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.elapsed = 0;
    });
  }

  update(_: number, delta: number): void {
    const gameScene = this.scene.get('GameScene') as GameScene;
    const elapsedMs = gameScene ? gameScene.getElapsedMs() : (this.elapsed += delta);

    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;

    this.timerText.setText(`Time ${formatted}`);

    if (gameScene) {
      const { current, max } = gameScene.getPlayerHealth();
      this.healthText.setText(`HP ${current}/${max}`);

      const { level, xp, xpToNext } = gameScene.getLevelProgress();
      this.levelText.setText(`Lv ${level} XP ${xp}/${xpToNext}`);
    }
  }
}
