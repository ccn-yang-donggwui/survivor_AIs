import Phaser from 'phaser';
import { SoundManager } from '../utils/SoundManager';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width * 0.5, height * 0.42, 'SURVIVOR LEGEND', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '46px',
        color: '#f4f6fb'
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, height * 0.58, 'Press Space or Tap to Start', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#c7d0e0'
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => this.start());
    this.input.once('pointerdown', () => this.start());
  }

  private start(): void {
    SoundManager.unlock();
    this.scene.start('MenuScene');
  }
}
