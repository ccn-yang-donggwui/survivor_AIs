// 설정 씬 - 게임 설정 화면

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';
import { TouchButton } from '../ui/TouchButton';
import type { GameSettings } from '../systems/SettingsStore';
import { settingsStore } from '../systems/SettingsStore';
import { getSoundManager } from '../utils/SoundManager';

interface SettingItem {
  key: keyof GameSettings;
  label: string;
  type: 'slider' | 'toggle';
  min?: number;
  max?: number;
}

export class SettingsScene extends Phaser.Scene {
  private buttons: TouchButton[] = [];
  private sliders: Phaser.GameObjects.Graphics[] = [];
  private settings: GameSettings;

  constructor() {
    super({ key: 'SettingsScene' });
    this.settings = settingsStore.getSettings();
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // shutdown 이벤트 등록
    this.events.once('shutdown', this.shutdown, this);

    // 배경
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.cameras.main.fadeIn(200);

    // 타이틀
    const title = this.add.text(width / 2, 50, 'SETTINGS', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    title.setOrigin(0.5);

    // 설정 항목들
    const settingItems: SettingItem[] = [
      { key: 'masterVolume', label: 'Master Volume', type: 'slider', min: 0, max: 1 },
      { key: 'bgmVolume', label: 'BGM Volume', type: 'slider', min: 0, max: 1 },
      { key: 'sfxVolume', label: 'SFX Volume', type: 'slider', min: 0, max: 1 },
      { key: 'showDamageNumbers', label: 'Damage Numbers', type: 'toggle' },
      { key: 'screenShake', label: 'Screen Shake', type: 'toggle' },
      { key: 'showFPS', label: 'Show FPS', type: 'toggle' },
    ];

    let yPos = 120;

    settingItems.forEach(item => {
      this.createSettingRow(item, yPos, width);
      yPos += 60;
    });

    // 하단 버튼들
    const resetButton = new TouchButton(this, {
      x: width / 2 - 80,
      y: height - 80,
      width: 120,
      height: 40,
      label: 'Reset',
      fontSize: 16,
      backgroundColor: COLORS.UI_BACKGROUND,
      borderColor: 0xff6666,
    });
    resetButton.onRelease(() => {
      settingsStore.resetSettings();
      this.settings = settingsStore.getSettings();
      this.scene.restart();
      getSoundManager()?.playSfx('sfx_button');
    });
    this.buttons.push(resetButton);

    const backButton = new TouchButton(this, {
      x: width / 2 + 80,
      y: height - 80,
      width: 120,
      height: 40,
      label: 'Back',
      fontSize: 16,
      backgroundColor: COLORS.UI_BACKGROUND,
      borderColor: COLORS.UI_PRIMARY,
    });
    backButton.onRelease(() => {
      this.goBack();
    });
    this.buttons.push(backButton);

    // ESC로 돌아가기
    this.input.keyboard?.on('keydown-ESC', () => this.goBack());
  }

  private createSettingRow(item: SettingItem, y: number, width: number): void {
    const labelX = 60;
    const controlX = width - 180;

    // 라벨
    this.add.text(labelX, y, item.label, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    if (item.type === 'slider') {
      this.createSlider(item, controlX, y);
    } else {
      this.createToggle(item, controlX, y);
    }
  }

  private createSlider(item: SettingItem, x: number, y: number): void {
    const sliderWidth = 150;
    const sliderHeight = 20;
    const currentValue = this.settings[item.key] as number;

    // 슬라이더 배경
    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 1);
    bg.fillRoundedRect(x, y, sliderWidth, sliderHeight, 4);

    // 슬라이더 채움
    const fill = this.add.graphics();
    this.updateSliderFill(fill, x, y, sliderWidth, sliderHeight, currentValue);

    // 값 표시
    const valueText = this.add.text(x + sliderWidth + 15, y + 2, `${Math.round(currentValue * 100)}%`, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });

    // 인터랙티브 영역
    const hitArea = this.add.rectangle(x + sliderWidth / 2, y + sliderHeight / 2, sliderWidth, sliderHeight + 20, 0x000000, 0);
    hitArea.setInteractive();

    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleSliderInput(pointer, x, sliderWidth, item, fill, valueText);
    });

    hitArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.handleSliderInput(pointer, x, sliderWidth, item, fill, valueText);
      }
    });

    this.sliders.push(fill);
  }

  private handleSliderInput(
    pointer: Phaser.Input.Pointer,
    x: number,
    width: number,
    item: SettingItem,
    fill: Phaser.GameObjects.Graphics,
    valueText: Phaser.GameObjects.Text
  ): void {
    const relativeX = pointer.x - x;
    const value = Phaser.Math.Clamp(relativeX / width, 0, 1);

    // 설정 업데이트
    settingsStore.updateSettings({ [item.key]: value });
    this.settings[item.key] = value as never;

    // UI 업데이트
    this.updateSliderFill(fill, x, valueText.y - 2, width, 20, value);
    valueText.setText(`${Math.round(value * 100)}%`);
  }

  private updateSliderFill(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number
  ): void {
    graphics.clear();
    graphics.fillStyle(COLORS.UI_PRIMARY, 1);
    graphics.fillRoundedRect(x, y, width * value, height, 4);
  }

  private createToggle(item: SettingItem, x: number, y: number): void {
    const currentValue = this.settings[item.key] as boolean;

    const button = new TouchButton(this, {
      x: x + 40,
      y: y + 10,
      width: 80,
      height: 30,
      label: currentValue ? 'ON' : 'OFF',
      fontSize: 14,
      backgroundColor: currentValue ? 0x38b764 : 0x5d275d,
      borderColor: currentValue ? 0x38b764 : 0x5d275d,
    });

    button.onRelease(() => {
      const newValue = !this.settings[item.key];
      settingsStore.updateSettings({ [item.key]: newValue });
      this.settings[item.key] = newValue as never;

      button.setLabel(newValue ? 'ON' : 'OFF');
      button.setBackgroundColor(newValue ? 0x38b764 : 0x5d275d);
      button.setBorderColor(newValue ? 0x38b764 : 0x5d275d);

      getSoundManager()?.playSfx('sfx_button');
    });

    this.buttons.push(button);
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
    this.sliders.forEach(s => s.destroy());
    this.sliders = [];
  }
}
