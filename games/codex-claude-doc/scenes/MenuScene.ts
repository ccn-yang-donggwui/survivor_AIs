import Phaser from 'phaser';
import { SoundManager } from '../utils/SoundManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width * 0.5, height * 0.32, 'Main Menu', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '32px',
        color: '#f4f6fb'
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width * 0.5, height * 0.5, 'Start Game', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '22px',
        color: '#7ee3ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const settingsText = this.add
      .text(width * 0.5, height * 0.58, 'Settings', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '20px',
        color: '#c7d0e0'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startText.on('pointerdown', () => this.startGame());
    settingsText.on('pointerdown', () => this.openSettings());
    startText.on('pointerover', () => startText.setColor('#f4f6fb'));
    startText.on('pointerout', () => startText.setColor('#7ee3ff'));
    settingsText.on('pointerover', () => settingsText.setColor('#f4f6fb'));
    settingsText.on('pointerout', () => settingsText.setColor('#c7d0e0'));

    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.once('keydown-S', () => this.openSettings());
  }

  private startGame(): void {
    SoundManager.unlock();
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  private openSettings(): void {
    this.scene.start('SettingsScene');
  }
}
