import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/Constants';
import { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;

  private hpBar!: Phaser.GameObjects.Graphics;
  private hpBarBg!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private expBarBg!: Phaser.GameObjects.Graphics;

  private levelText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;

  private weaponIcons: Phaser.GameObjects.Container[] = [];
  private passiveIcons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.gameScene = this.scene.get('GameScene') as GameScene;

    this.createHealthBar();
    this.createExpBar();
    this.createInfoTexts();
    this.createWeaponSlots();
    this.createPassiveSlots();
  }

  private createHealthBar(): void {
    const barWidth = 300;
    const barHeight = 20;
    const x = 20;
    const y = 20;

    // 배경
    this.hpBarBg = this.add.graphics();
    this.hpBarBg.fillStyle(0x333333);
    this.hpBarBg.fillRoundedRect(x, y, barWidth, barHeight, 4);

    // HP 바
    this.hpBar = this.add.graphics();

    // HP 텍스트
    this.hpText = this.add.text(x + barWidth / 2, y + barHeight / 2, '100/100', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.hpText.setOrigin(0.5);
  }

  private createExpBar(): void {
    const barWidth = 300;
    const barHeight = 12;
    const x = 20;
    const y = 48;

    // 배경
    this.expBarBg = this.add.graphics();
    this.expBarBg.fillStyle(0x333333);
    this.expBarBg.fillRoundedRect(x, y, barWidth, barHeight, 3);

    // EXP 바
    this.expBar = this.add.graphics();
  }

  private createInfoTexts(): void {
    // 레벨 텍스트
    this.levelText = this.add.text(20, 68, 'Lv. 1', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 시간 텍스트
    this.timeText = this.add.text(GAME_WIDTH - 20, 20, '00:00', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.timeText.setOrigin(1, 0);

    // 처치 수 텍스트
    this.killText = this.add.text(GAME_WIDTH - 20, 50, 'Kills: 0', {
      fontSize: '16px',
      color: '#aaaaaa'
    });
    this.killText.setOrigin(1, 0);
  }

  private createWeaponSlots(): void {
    const startX = 20;
    const y = GAME_HEIGHT - 60;
    const slotSize = 48;
    const gap = 8;

    // 무기 라벨
    this.add.text(startX, y - 20, '무기', {
      fontSize: '12px',
      color: '#ff6666'
    });

    for (let i = 0; i < 6; i++) {
      const x = startX + i * (slotSize + gap);

      const container = this.add.container(x, y);

      // 슬롯 배경
      const bg = this.add.graphics();
      bg.fillStyle(0x222222, 0.8);
      bg.fillRoundedRect(0, 0, slotSize, slotSize, 6);
      bg.lineStyle(2, 0x663333);
      bg.strokeRoundedRect(0, 0, slotSize, slotSize, 6);
      container.add(bg);

      this.weaponIcons.push(container);
    }
  }

  private createPassiveSlots(): void {
    const startX = GAME_WIDTH - 20 - (6 * 48 + 5 * 8);
    const y = GAME_HEIGHT - 60;
    const slotSize = 48;
    const gap = 8;

    // 패시브 라벨
    this.add.text(startX, y - 20, '패시브', {
      fontSize: '12px',
      color: '#6666ff'
    });

    for (let i = 0; i < 6; i++) {
      const x = startX + i * (slotSize + gap);

      const container = this.add.container(x, y);

      // 슬롯 배경
      const bg = this.add.graphics();
      bg.fillStyle(0x222222, 0.8);
      bg.fillRoundedRect(0, 0, slotSize, slotSize, 6);
      bg.lineStyle(2, 0x333366);
      bg.strokeRoundedRect(0, 0, slotSize, slotSize, 6);
      container.add(bg);

      this.passiveIcons.push(container);
    }
  }

  override update(): void {
    if (!this.gameScene || !this.gameScene.player) return;

    this.updateHealthBar();
    this.updateExpBar();
    this.updateTexts();
    this.updateWeaponSlots();
    this.updatePassiveSlots();
  }

  private updateHealthBar(): void {
    const player = this.gameScene.player;
    const barWidth = 300;
    const barHeight = 20;
    const x = 20;
    const y = 20;

    const hpPercent = player.stats.currentHP / player.stats.maxHP;

    this.hpBar.clear();
    this.hpBar.fillStyle(COLORS.HEALTH);
    this.hpBar.fillRoundedRect(x, y, barWidth * hpPercent, barHeight, 4);

    this.hpText.setText(`${Math.ceil(player.stats.currentHP)}/${player.stats.maxHP}`);
  }

  private updateExpBar(): void {
    const state = this.gameScene.gameState;
    const barWidth = 300;
    const barHeight = 12;
    const x = 20;
    const y = 48;

    const expPercent = state.exp / state.expToNextLevel;

    this.expBar.clear();
    this.expBar.fillStyle(COLORS.EXP);
    this.expBar.fillRoundedRect(x, y, barWidth * expPercent, barHeight, 3);
  }

  private updateTexts(): void {
    const state = this.gameScene.gameState;

    this.levelText.setText(`Lv. ${state.level}`);
    this.timeText.setText(this.formatTime(state.currentTime));
    this.killText.setText(`Kills: ${state.kills}`);
  }

  private updateWeaponSlots(): void {
    const weapons = this.gameScene.player.weapons;

    for (let i = 0; i < 6; i++) {
      const container = this.weaponIcons[i];

      // 기존 아이콘 제거
      while (container.length > 1) {
        container.removeAt(1, true);
      }

      if (weapons[i]) {
        const weapon = weapons[i];

        // 무기 아이콘
        const icon = this.add.text(24, 16, weapon.icon, {
          fontSize: '20px'
        });
        icon.setOrigin(0.5);
        container.add(icon);

        // 레벨 표시
        const levelBadge = this.add.text(44, 44, `${weapon.level}`, {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#663333',
          padding: { x: 3, y: 1 }
        });
        levelBadge.setOrigin(1, 1);
        container.add(levelBadge);
      }
    }
  }

  private updatePassiveSlots(): void {
    const passives = this.gameScene.player.passives;

    for (let i = 0; i < 6; i++) {
      const container = this.passiveIcons[i];

      // 기존 아이콘 제거
      while (container.length > 1) {
        container.removeAt(1, true);
      }

      if (passives[i]) {
        const passive = passives[i];

        // 패시브 아이콘
        const icon = this.add.text(24, 16, passive.icon, {
          fontSize: '20px'
        });
        icon.setOrigin(0.5);
        container.add(icon);

        // 레벨 표시
        const levelBadge = this.add.text(44, 44, `${passive.level}`, {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#333366',
          padding: { x: 3, y: 1 }
        });
        levelBadge.setOrigin(1, 1);
        container.add(levelBadge);
      }
    }
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
