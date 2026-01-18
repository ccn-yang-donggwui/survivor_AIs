// 메뉴 씬 - 메인 메뉴

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';
import { TouchButton } from '../ui/TouchButton';
import { metaStore } from '../systems/MetaStore';
import { getSoundManager } from '../utils/SoundManager';

interface MenuItem {
  label: string;
  action: () => void;
}

export class MenuScene extends Phaser.Scene {
  private buttons: TouchButton[] = [];
  private goldText!: Phaser.GameObjects.Text;

  // 오버레이 관련 요소들
  private overlayElements: Phaser.GameObjects.GameObject[] = [];
  private overlayButtons: TouchButton[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // shutdown 이벤트 등록
    this.events.once('shutdown', this.shutdown, this);

    // 배경
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.cameras.main.fadeIn(300);

    // 타이틀
    const title = this.add.text(width / 2, 80, 'MENU', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    title.setOrigin(0.5);

    // 골드 표시
    this.goldText = this.add.text(width - 20, 20, `Gold: ${metaStore.getGold()}`, {
      fontSize: '18px',
      color: '#ffcd75',
      fontFamily: 'monospace',
    });
    this.goldText.setOrigin(1, 0);

    // 메뉴 아이템
    const menuItems: MenuItem[] = [
      { label: 'Start Game', action: () => this.startGame() },
      { label: 'Character Select', action: () => this.showCharacterSelect() },
      { label: 'Upgrades', action: () => this.showUpgrades() },
      { label: 'Settings', action: () => this.showSettings() },
      { label: 'Stats', action: () => this.showStats() },
    ];

    // 버튼 생성
    const startY = height / 2 - (menuItems.length * 60) / 2;
    menuItems.forEach((item, index) => {
      const button = new TouchButton(this, {
        x: width / 2,
        y: startY + index * 60,
        width: 200,
        height: 45,
        label: item.label,
        fontSize: 18,
        backgroundColor: COLORS.UI_BACKGROUND,
        borderColor: COLORS.UI_PRIMARY,
      });

      button.onRelease(() => {
        getSoundManager()?.playSfx('sfx_button');
        item.action();
      });

      this.buttons.push(button);
    });

    // 키보드 단축키
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.on('keydown-S', () => this.showSettings());
  }

  private startGame(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // 게임 상태 초기화
      this.registry.set('selectedCharacter', this.registry.get('selectedCharacter') || 'knight');
      this.registry.set('selectedStage', this.registry.get('selectedStage') || 'forest');

      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });
  }

  private showCharacterSelect(): void {
    // 캐릭터 선택 오버레이 표시
    this.showOverlay('Character Select', [
      { id: 'knight', name: 'Knight', desc: 'Balanced fighter' },
      { id: 'mage', name: 'Mage', desc: 'Magic specialist' },
      { id: 'rogue', name: 'Rogue', desc: 'Speed specialist' },
    ], (selected) => {
      this.registry.set('selectedCharacter', selected);
      getSoundManager()?.playSfx('sfx_button');
    });
  }

  private showUpgrades(): void {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('UpgradeScene');
    });
  }

  private showSettings(): void {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('SettingsScene');
    });
  }

  private showStats(): void {
    // 기존 오버레이 정리
    this.closeOverlay();

    const stats = metaStore.getStats();
    const { width, height } = this.cameras.main;

    // 오버레이 배경 (depth 2000 - TouchButton 기본 depth 1000보다 높게)
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(2000);
    this.overlayElements.push(overlay);

    // 통계 텍스트
    const statsText = this.add.text(width / 2, height / 2 - 100, [
      'STATISTICS',
      '',
      `Games Played: ${stats.totalGamesPlayed}`,
      `Total Play Time: ${Math.floor(stats.totalPlayTime / 60000)} min`,
      `Total Kills: ${stats.totalKills}`,
      `Best Survival: ${Math.floor(stats.bestSurvivalTime / 1000)} sec`,
      '',
      'Tap or press ESC to close',
    ].join('\n'), {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
    });
    statsText.setOrigin(0.5);
    statsText.setDepth(2001);
    this.overlayElements.push(statsText);

    // 닫기
    const closeHandler = () => {
      this.closeOverlay();
      this.input.off('pointerdown', closeHandler);
      this.input.keyboard?.off('keydown-ESC', closeHandler);
    };

    this.input.once('pointerdown', closeHandler);
    this.input.keyboard?.once('keydown-ESC', closeHandler);
  }

  private showOverlay(
    title: string,
    items: { id: string; name: string; desc: string }[],
    onSelect: (id: string) => void
  ): void {
    // 기존 오버레이 정리
    this.closeOverlay();

    const { width, height } = this.cameras.main;

    // 오버레이 배경 (depth 2000 - TouchButton 기본 depth 1000보다 높게)
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(2000);
    this.overlayElements.push(overlay);

    // 타이틀
    const titleText = this.add.text(width / 2, 100, title, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(2001);
    this.overlayElements.push(titleText);

    // 아이템 버튼
    items.forEach((item, index) => {
      const y = 180 + index * 80;

      const button = new TouchButton(this, {
        x: width / 2,
        y,
        width: 250,
        height: 70,
        label: item.name,
        fontSize: 20,
        backgroundColor: COLORS.UI_BACKGROUND,
        borderColor: COLORS.UI_PRIMARY,
      });
      button.setDepth(2001);

      // 설명 텍스트를 버튼 내부에 추가
      const descText = this.add.text(0, 18, item.desc, {
        fontSize: '12px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      });
      descText.setOrigin(0.5);

      // 버튼 컨테이너에 설명 추가
      const container = (button as unknown as { container: Phaser.GameObjects.Container }).container;
      container.add(descText);

      // 라벨을 위로 이동
      const labelText = container.list.find(
        (obj): obj is Phaser.GameObjects.Text => obj instanceof Phaser.GameObjects.Text && obj !== descText
      );
      if (labelText) {
        labelText.setY(-10);
      }

      button.onRelease(() => {
        onSelect(item.id);
        this.closeOverlay();
      });

      this.overlayButtons.push(button);
    });

    // 닫기 버튼
    const closeButton = new TouchButton(this, {
      x: width / 2,
      y: height - 80,
      width: 120,
      height: 40,
      label: 'Close',
      fontSize: 16,
      backgroundColor: COLORS.UI_BACKGROUND,
      borderColor: 0xff6666,
    });
    closeButton.setDepth(2001);
    closeButton.onRelease(() => this.closeOverlay());
    this.overlayButtons.push(closeButton);

    this.input.keyboard?.once('keydown-ESC', () => this.closeOverlay());
  }

  private closeOverlay(): void {
    // 오버레이 요소들 정리
    this.overlayElements.forEach(el => el.destroy());
    this.overlayElements = [];

    // 오버레이 버튼들 정리
    this.overlayButtons.forEach(b => b.destroy());
    this.overlayButtons = [];
  }

  shutdown(): void {
    // 키보드 이벤트 리스너 제거
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-S');
    this.input.keyboard?.off('keydown-ESC');

    // 오버레이 정리
    this.closeOverlay();

    // 버튼 정리
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];
  }
}
