// 프리로드 씬 - 에셋 및 데이터 로드

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';
import { generateAllGameTextures } from '../assets/PixelArtGenerator';
import { SoundManager } from '../utils/SoundManager';

export class PreloadScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBarBg!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;

    // 배경
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // 로딩 UI
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'OPUS-VER', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.loadingText.setOrigin(0.5);

    this.statusText = this.add.text(width / 2, height / 2, 'Loading assets...', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });
    this.statusText.setOrigin(0.5);

    // 프로그레스 바
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x333333, 1);
    this.progressBarBg.fillRect(width / 2 - 150, height / 2 + 40, 300, 20);

    this.progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(COLORS.UI_PRIMARY, 1);
      this.progressBar.fillRect(width / 2 - 148, height / 2 + 42, 296 * value, 16);
    });

    // 오디오 로드 (더미 모드)
    SoundManager.preload(this);

    // JSON 데이터는 각 Factory에서 직접 import하므로 여기서 로드하지 않음
  }

  create(): void {
    this.statusText.setText('Generating pixel art...');

    // 픽셀 아트 텍스처 생성
    generateAllGameTextures(this, 2);

    this.statusText.setText('Ready!');

    // 잠시 대기 후 타이틀로
    this.time.delayedCall(500, () => {
      this.progressBar.destroy();
      this.progressBarBg.destroy();
      this.loadingText.destroy();
      this.statusText.destroy();

      this.scene.start('TitleScene');
    });
  }
}
