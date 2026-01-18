import Phaser from 'phaser';
import { SoundManager } from '../utils/SoundManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    SoundManager.init();
    if (SoundManager.isBgmEnabled()) {
      SoundManager.startBgm();
    }
    this.scene.start('PreloadScene');
  }
}
