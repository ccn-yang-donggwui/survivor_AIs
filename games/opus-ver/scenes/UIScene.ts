// UI 씬 - 게임 HUD (GameScene과 병렬 실행)

import Phaser from 'phaser';
import { COLORS, DEPTH } from '../config/Constants';

export class UIScene extends Phaser.Scene {
  // HP 바
  private hpBarBg!: Phaser.GameObjects.Graphics;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;

  // 경험치 바
  private expBarBg!: Phaser.GameObjects.Graphics;
  private expBarFill!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;

  // 정보 텍스트
  private timeText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;

  // 캐시된 값
  private cachedHP: number = 0;
  private cachedMaxHP: number = 0;
  private cachedExp: number = 0;
  private cachedExpToNext: number = 0;
  private cachedLevel: number = 0;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // HP 바
    this.createHPBar(10, 10, 200, 20);

    // 경험치 바
    this.createExpBar(10, 35, 200, 12);

    // 레벨 텍스트
    this.levelText = this.add.text(215, 10, 'Lv.1', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    // 시간 (상단 중앙)
    this.timeText = this.add.text(width / 2, 15, '00:00', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.timeText.setOrigin(0.5, 0);

    // 웨이브 (시간 아래)
    this.waveText = this.add.text(width / 2, 42, 'Wave 1', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });
    this.waveText.setOrigin(0.5, 0);

    // 킬 카운트 (우상단)
    this.killText = this.add.text(width - 10, 10, 'Kills: 0', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.killText.setOrigin(1, 0);

    // 골드 (킬 아래)
    this.goldText = this.add.text(width - 10, 30, 'Gold: 0', {
      fontSize: '14px',
      color: '#ffcd75',
      fontFamily: 'monospace',
    });
    this.goldText.setOrigin(1, 0);
  }

  private createHPBar(x: number, y: number, width: number, height: number): void {
    // 배경
    this.hpBarBg = this.add.graphics();
    this.hpBarBg.fillStyle(0x333333, 1);
    this.hpBarBg.fillRoundedRect(x, y, width, height, 4);
    this.hpBarBg.lineStyle(2, 0x666666, 1);
    this.hpBarBg.strokeRoundedRect(x, y, width, height, 4);

    // 채움
    this.hpBarFill = this.add.graphics();

    // 텍스트
    this.hpText = this.add.text(x + width / 2, y + height / 2, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.hpText.setOrigin(0.5);
  }

  private createExpBar(x: number, y: number, width: number, height: number): void {
    // 배경
    this.expBarBg = this.add.graphics();
    this.expBarBg.fillStyle(0x333333, 1);
    this.expBarBg.fillRoundedRect(x, y, width, height, 3);

    // 채움
    this.expBarFill = this.add.graphics();
  }

  override update(): void {
    // 레지스트리에서 값 읽기
    const hp = this.registry.get('playerHP') || 0;
    const maxHP = this.registry.get('playerMaxHP') || 100;
    const exp = this.registry.get('playerExp') || 0;
    const expToNext = this.registry.get('playerExpToNext') || 100;
    const level = this.registry.get('playerLevel') || 1;
    const gameTime = this.registry.get('gameTime') || '00:00';
    const killCount = this.registry.get('killCount') || 0;
    const wave = this.registry.get('currentWave') || 1;
    const gold = this.registry.get('goldEarned') || 0;

    // HP 바 업데이트
    if (hp !== this.cachedHP || maxHP !== this.cachedMaxHP) {
      this.updateHPBar(hp, maxHP);
      this.cachedHP = hp;
      this.cachedMaxHP = maxHP;
    }

    // 경험치 바 업데이트
    if (exp !== this.cachedExp || expToNext !== this.cachedExpToNext) {
      this.updateExpBar(exp, expToNext);
      this.cachedExp = exp;
      this.cachedExpToNext = expToNext;
    }

    // 레벨 업데이트
    if (level !== this.cachedLevel) {
      this.levelText.setText(`Lv.${level}`);
      this.cachedLevel = level;
    }

    // 텍스트 업데이트
    this.timeText.setText(gameTime);
    this.killText.setText(`Kills: ${killCount}`);
    this.waveText.setText(`Wave ${wave}`);
    this.goldText.setText(`Gold: ${gold}`);
  }

  private updateHPBar(hp: number, maxHP: number): void {
    const x = 10;
    const y = 10;
    const width = 200;
    const height = 20;

    const ratio = Math.max(0, hp / maxHP);

    this.hpBarFill.clear();

    // HP 비율에 따른 색상
    let color = 0x38b764; // 녹색
    if (ratio < 0.3) color = 0xb13e53; // 빨강
    else if (ratio < 0.6) color = 0xef7d57; // 주황

    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRoundedRect(x + 2, y + 2, (width - 4) * ratio, height - 4, 2);

    this.hpText.setText(`${Math.floor(hp)} / ${Math.floor(maxHP)}`);
  }

  private updateExpBar(exp: number, expToNext: number): void {
    const x = 10;
    const y = 35;
    const width = 200;
    const height = 12;

    const ratio = Math.min(1, exp / expToNext);

    this.expBarFill.clear();
    this.expBarFill.fillStyle(0x41a6f6, 1);
    this.expBarFill.fillRoundedRect(x + 2, y + 2, (width - 4) * ratio, height - 4, 2);
  }

  shutdown(): void {
    // 정리 로직 (필요시 추가)
  }
}
