// 부트 씬 - 초기화 및 PreloadScene으로 전환

import Phaser from 'phaser';
import { GAME, COLORS } from '../config/Constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 최소한의 로딩 표시
    const { width, height } = this.cameras.main;

    // 배경
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // 로딩 텍스트
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    loadingText.setOrigin(0.5);

    // 로딩 프로그레스 바 테두리
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x333333, 1);
    progressBarBg.fillRect(width / 2 - 150, height / 2 + 40, 300, 20);

    // 로딩 프로그레스 바
    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.UI_PRIMARY, 1);
      progressBar.fillRect(width / 2 - 148, height / 2 + 42, 296 * value, 16);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBarBg.destroy();
      loadingText.destroy();
    });
  }

  create(): void {
    // 씬 키 등록
    this.registry.set('gameVersion', 'opus-ver');
    this.registry.set('initialized', true);

    // PreloadScene으로 전환
    this.scene.start('PreloadScene');
  }
}
