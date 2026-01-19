// 결과 씬 - 게임 종료 후 결과 표시

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';
import { TouchButton } from '../ui/TouchButton';
import { metaStore } from '../systems/MetaStore';
import { getSoundManager } from '../utils/SoundManager';

interface ResultsData {
  survivalTime: number;
  killCount: number;
  goldEarned: number;
  maxLevel: number;
}

export class ResultsScene extends Phaser.Scene {
  private results!: ResultsData;
  private buttons: TouchButton[] = [];

  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data: ResultsData): void {
    this.results = data;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 배경
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.cameras.main.fadeIn(500);

    // BGM
    getSoundManager()?.playBgm('bgm_menu');

    // 타이틀
    const title = this.add.text(width / 2, 60, 'GAME OVER', {
      fontSize: '42px',
      color: '#b13e53',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // 결과 표시
    this.createResultsDisplay(width, height);

    // 통계 업데이트
    this.showBestRecords(width, height);

    // 버튼
    this.createButtons(width, height);

    // 키보드 단축키
    this.input.keyboard?.on('keydown-SPACE', () => this.retry());
    this.input.keyboard?.on('keydown-ESC', () => this.goToMenu());
  }

  private createResultsDisplay(width: number, height: number): void {
    const startY = 140;
    const lineHeight = 45;
    const centerX = width / 2;

    // 결과 항목들
    const results = [
      {
        label: 'Survival Time',
        value: this.formatTime(this.results.survivalTime),
        color: '#ffffff',
      },
      {
        label: 'Enemies Killed',
        value: this.results.killCount.toString(),
        color: '#ef7d57',
      },
      {
        label: 'Max Level',
        value: `Lv.${this.results.maxLevel}`,
        color: '#41a6f6',
      },
      {
        label: 'Gold Earned',
        value: `+${this.results.goldEarned}`,
        color: '#ffcd75',
      },
    ];

    results.forEach((item, index) => {
      const y = startY + index * lineHeight;

      // 라벨
      const labelText = this.add.text(centerX - 100, y, item.label, {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      });
      labelText.setOrigin(0, 0.5);

      // 값 (애니메이션)
      const valueText = this.add.text(centerX + 100, y, '0', {
        fontSize: '20px',
        color: item.color,
        fontFamily: 'monospace',
      });
      valueText.setOrigin(1, 0.5);
      valueText.setAlpha(0);

      // 카운트업 애니메이션
      this.time.delayedCall(index * 200 + 300, () => {
        valueText.setAlpha(1);

        if (typeof item.value === 'string' && !item.value.match(/^\d+$/)) {
          // 숫자가 아니면 바로 표시
          valueText.setText(item.value);
        } else {
          // 숫자면 카운트업
          const targetValue = parseInt(item.value.replace(/[^0-9]/g, '')) || 0;
          const prefix = item.value.match(/^[^\d]*/)?.[0] || '';

          this.tweens.addCounter({
            from: 0,
            to: targetValue,
            duration: 800,
            ease: 'Power2',
            onUpdate: (tween) => {
              valueText.setText(prefix + Math.floor(tween.getValue() ?? 0).toString());
            },
          });
        }
      });
    });

    // 구분선
    const divider = this.add.graphics();
    divider.lineStyle(2, 0x666666, 0.5);
    divider.lineBetween(centerX - 150, startY + results.length * lineHeight + 10, centerX + 150, startY + results.length * lineHeight + 10);

    // 총 골드
    const totalGoldY = startY + results.length * lineHeight + 40;
    this.add.text(centerX - 100, totalGoldY, 'Total Gold', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'monospace',
    }).setOrigin(0, 0.5);

    this.add.text(centerX + 100, totalGoldY, metaStore.getGold().toString(), {
      fontSize: '18px',
      color: '#ffcd75',
      fontFamily: 'monospace',
    }).setOrigin(1, 0.5);
  }

  private showBestRecords(width: number, height: number): void {
    const stats = metaStore.getStats();
    const y = height - 180;

    // 최고 기록 비교
    const isBestTime = this.results.survivalTime >= stats.bestSurvivalTime;

    if (isBestTime && this.results.survivalTime > 0) {
      const newRecordText = this.add.text(width / 2, y - 20, 'NEW BEST TIME!', {
        fontSize: '24px',
        color: '#ffcd75',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      newRecordText.setOrigin(0.5);

      // 반짝임 효과
      this.tweens.add({
        targets: newRecordText,
        alpha: { from: 0.5, to: 1 },
        scale: { from: 1, to: 1.1 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    // 이전 기록
    const bestTimeText = this.add.text(width / 2, y + 20, `Best: ${this.formatTime(stats.bestSurvivalTime)}`, {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    bestTimeText.setOrigin(0.5);
  }

  private createButtons(width: number, height: number): void {
    // 재시도 버튼
    const retryButton = new TouchButton(this, {
      x: width / 2 - 90,
      y: height - 80,
      width: 150,
      height: 50,
      label: 'Retry',
      fontSize: 20,
      backgroundColor: 0x38b764,
      borderColor: 0x38b764,
    });

    retryButton.onRelease(() => this.retry());
    this.buttons.push(retryButton);

    // 메뉴 버튼
    const menuButton = new TouchButton(this, {
      x: width / 2 + 90,
      y: height - 80,
      width: 150,
      height: 50,
      label: 'Menu',
      fontSize: 20,
      backgroundColor: COLORS.UI_BACKGROUND,
      borderColor: COLORS.UI_PRIMARY,
    });

    menuButton.onRelease(() => this.goToMenu());
    this.buttons.push(menuButton);

    // 키 힌트
    this.add.text(width / 2, height - 25, 'SPACE: Retry | ESC: Menu', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private retry(): void {
    getSoundManager()?.playSfx('sfx_button');

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });
  }

  private goToMenu(): void {
    getSoundManager()?.playSfx('sfx_button');

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }

  shutdown(): void {
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];
  }
}
