// 타이틀 씬 - 게임 시작 화면

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';
import { initSoundManager, getSoundManager } from '../utils/SoundManager';

export class TitleScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private startText!: Phaser.GameObjects.Text;
  private versionText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // shutdown 이벤트 등록
    this.events.once('shutdown', this.shutdown, this);

    // 배경
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // 사운드 매니저 초기화
    const soundManager = initSoundManager(this);
    soundManager.playBgm('bgm_menu');

    // 타이틀
    this.titleText = this.add.text(width / 2, height / 3, 'SURVIVOR', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.titleText.setOrigin(0.5);
    this.titleText.setShadow(4, 4, '#000000', 8);

    // 서브타이틀
    this.subtitleText = this.add.text(width / 2, height / 3 + 60, 'OPUS VERSION', {
      fontSize: '24px',
      color: `#${COLORS.UI_PRIMARY.toString(16)}`,
      fontFamily: 'monospace',
    });
    this.subtitleText.setOrigin(0.5);

    // 시작 텍스트
    this.startText = this.add.text(width / 2, height * 0.7, 'Press SPACE or Tap to Start', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });
    this.startText.setOrigin(0.5);

    // 깜빡임 애니메이션
    this.tweens.add({
      targets: this.startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // 버전 텍스트
    this.versionText = this.add.text(width - 10, height - 10, 'v1.0.0', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'monospace',
    });
    this.versionText.setOrigin(1, 1);

    // 입력 처리
    this.input.keyboard?.once('keydown-SPACE', this.goToMenu, this);
    this.input.once('pointerdown', this.goToMenu, this);

    // 타이틀 애니메이션
    this.titleText.setScale(0.5);
    this.titleText.setAlpha(0);
    this.tweens.add({
      targets: this.titleText,
      scale: 1,
      alpha: 1,
      duration: 800,
      ease: 'Back.easeOut',
    });

    this.subtitleText.setAlpha(0);
    this.tweens.add({
      targets: this.subtitleText,
      alpha: 1,
      duration: 500,
      delay: 400,
    });
  }

  private goToMenu(): void {
    const soundManager = getSoundManager();
    soundManager?.playSfx('sfx_button');

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }

  shutdown(): void {
    // 애니메이션 정리
    this.tweens.killAll();
  }
}
