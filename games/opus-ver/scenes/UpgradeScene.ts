// 업그레이드 씬 - 메타 업그레이드 구매 화면

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';
import { TouchButton } from '../ui/TouchButton';
import type { MetaUpgrade } from '../systems/MetaStore';
import { metaStore } from '../systems/MetaStore';
import { getSoundManager } from '../utils/SoundManager';

export class UpgradeScene extends Phaser.Scene {
  private buttons: TouchButton[] = [];
  private upgradeCards: Phaser.GameObjects.Container[] = [];
  private goldText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UpgradeScene' });
  }

  async create(): Promise<void> {
    const { width, height } = this.cameras.main;

    // shutdown 이벤트 등록
    this.events.once('shutdown', this.shutdown, this);

    // 배경
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.cameras.main.fadeIn(200);

    // 데이터 로드
    await metaStore.loadUpgradeData();

    // 타이틀
    const title = this.add.text(width / 2, 40, 'UPGRADES', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    title.setOrigin(0.5);

    // 골드 표시
    this.goldText = this.add.text(width / 2, 75, `Gold: ${metaStore.getGold()}`, {
      fontSize: '20px',
      color: '#ffcd75',
      fontFamily: 'monospace',
    });
    this.goldText.setOrigin(0.5);

    // 업그레이드 카드 생성
    this.createUpgradeCards();

    // 뒤로가기 버튼
    const backButton = new TouchButton(this, {
      x: width / 2,
      y: height - 50,
      width: 150,
      height: 45,
      label: 'Back',
      fontSize: 18,
      backgroundColor: COLORS.UI_BACKGROUND,
      borderColor: COLORS.UI_PRIMARY,
    });
    backButton.onRelease(() => this.goBack());
    this.buttons.push(backButton);

    // ESC로 돌아가기
    this.input.keyboard?.on('keydown-ESC', () => this.goBack());
  }

  private createUpgradeCards(): void {
    const { width, height } = this.cameras.main;
    const upgrades = metaStore.getAllUpgrades();

    const cardWidth = 140;
    const cardHeight = 160;
    const cols = 4;
    const rows = Math.ceil(upgrades.length / cols);
    const spacingX = 15;
    const spacingY = 15;

    const totalWidth = cols * cardWidth + (cols - 1) * spacingX;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    // 타이틀(40) + 골드(75) 아래 충분한 여백 확보
    const startY = 110 + cardHeight / 2;

    upgrades.forEach((upgrade, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + spacingX);
      const y = startY + row * (cardHeight + spacingY);

      this.createUpgradeCard(upgrade, x, y, cardWidth, cardHeight);
    });
  }

  private createUpgradeCard(
    upgrade: MetaUpgrade,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const container = this.add.container(x, y);

    const currentLevel = metaStore.getUpgradeLevel(upgrade.id);
    const isMaxed = currentLevel >= upgrade.maxLevel;
    const price = metaStore.getUpgradePrice(upgrade.id);
    const canAfford = metaStore.getGold() >= price;

    // 카드 배경
    const bg = this.add.graphics();
    const bgColor = isMaxed ? 0x38b764 : COLORS.UI_BACKGROUND;
    bg.fillStyle(bgColor, 0.9);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);

    const borderColor = isMaxed ? 0x38b764 : (canAfford ? COLORS.UI_PRIMARY : 0x666666);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

    container.add(bg);

    // 이름
    const nameText = this.add.text(0, -height / 2 + 20, upgrade.name, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    nameText.setOrigin(0.5);
    container.add(nameText);

    // 레벨
    const levelText = this.add.text(0, -height / 2 + 40, `Lv. ${currentLevel} / ${upgrade.maxLevel}`, {
      fontSize: '12px',
      color: isMaxed ? '#38b764' : '#aaaaaa',
      fontFamily: 'monospace',
    });
    levelText.setOrigin(0.5);
    container.add(levelText);

    // 설명
    const descText = this.add.text(0, 0, upgrade.description, {
      fontSize: '11px',
      color: '#cccccc',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: width - 20 },
    });
    descText.setOrigin(0.5);
    container.add(descText);

    // 현재 효과
    const effectValue = upgrade.valuePerLevel * currentLevel;
    const effectText = this.add.text(0, 30, this.formatEffect(upgrade, effectValue), {
      fontSize: '12px',
      color: '#41a6f6',
      fontFamily: 'monospace',
    });
    effectText.setOrigin(0.5);
    container.add(effectText);

    // 구매 버튼 (최대 레벨이 아닌 경우)
    if (!isMaxed) {
      const button = new TouchButton(this, {
        x: 0,
        y: height / 2 - 25,
        width: width - 20,
        height: 30,
        label: `${price} G`,
        fontSize: 12,
        backgroundColor: canAfford ? 0x38b764 : 0x5d275d,
        borderColor: canAfford ? 0x38b764 : 0x5d275d,
      });

      button.onRelease(() => {
        if (metaStore.purchaseUpgrade(upgrade.id)) {
          getSoundManager()?.playSfx('sfx_button');
          this.refreshUI();
        }
      });

      button.setEnabled(canAfford);

      // 버튼을 컨테이너의 위치에 맞게 조정
      container.add(button['container']);
      this.buttons.push(button);
    } else {
      const maxedText = this.add.text(0, height / 2 - 25, 'MAX', {
        fontSize: '14px',
        color: '#38b764',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      maxedText.setOrigin(0.5);
      container.add(maxedText);
    }

    this.upgradeCards.push(container);
  }

  private formatEffect(upgrade: MetaUpgrade, value: number): string {
    if (value === 0) return '-';

    const stat = upgrade.stat;
    const sign = value >= 0 ? '+' : '';

    if (['damage', 'cooldown', 'moveSpeed', 'luck', 'expMultiplier'].includes(stat)) {
      return `${sign}${Math.round(value * 100)}%`;
    }

    return `${sign}${value}`;
  }

  private refreshUI(): void {
    // 골드 업데이트
    this.goldText.setText(`Gold: ${metaStore.getGold()}`);

    // 카드 재생성
    this.upgradeCards.forEach(card => card.destroy());
    this.upgradeCards = [];
    this.buttons = this.buttons.filter(b => {
      // 뒤로가기 버튼만 유지
      return b['config']?.label === 'Back';
    });

    this.createUpgradeCards();
  }

  private goBack(): void {
    getSoundManager()?.playSfx('sfx_button');
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }

  shutdown(): void {
    // 키보드 이벤트 리스너 제거
    this.input.keyboard?.off('keydown-ESC');

    // UI 정리
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];
    this.upgradeCards.forEach(card => card.destroy());
    this.upgradeCards = [];
  }
}
