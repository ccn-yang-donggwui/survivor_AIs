// 터치 버튼 - 모바일 UI 버튼

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';

export interface TouchButtonConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  label?: string;
  icon?: string;
  fontSize?: number;
  backgroundColor?: number;
  textColor?: number;
  borderColor?: number;
  alpha?: number;
}

export class TouchButton {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text | null = null;
  private iconSprite: Phaser.GameObjects.Sprite | null = null;

  private config: Required<TouchButtonConfig>;
  private isPressed: boolean = false;
  private isEnabled: boolean = true;

  private onPressCallback: (() => void) | null = null;
  private onReleaseCallback: (() => void) | null = null;

  constructor(scene: Phaser.Scene, config: TouchButtonConfig) {
    this.scene = scene;

    // 기본값 설정
    this.config = {
      x: config.x,
      y: config.y,
      width: config.width || 80,
      height: config.height || 40,
      radius: config.radius || 8,
      label: config.label || '',
      icon: config.icon || '',
      fontSize: config.fontSize || 16,
      backgroundColor: config.backgroundColor ?? COLORS.UI_BACKGROUND,
      textColor: config.textColor ?? COLORS.UI_TEXT,
      borderColor: config.borderColor ?? COLORS.UI_PRIMARY,
      alpha: config.alpha ?? 0.8,
    };

    // 컨테이너 생성
    this.container = scene.add.container(this.config.x, this.config.y);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    // 배경 생성
    this.background = scene.add.graphics();
    this.container.add(this.background);
    this.drawBackground();

    // 라벨 또는 아이콘
    if (this.config.label) {
      this.labelText = scene.add.text(0, 0, this.config.label, {
        fontSize: `${this.config.fontSize}px`,
        color: `#${this.config.textColor.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace',
      });
      this.labelText.setOrigin(0.5);
      this.container.add(this.labelText);
    }

    if (this.config.icon) {
      this.iconSprite = scene.add.sprite(0, 0, this.config.icon);
      this.iconSprite.setOrigin(0.5);
      this.container.add(this.iconSprite);
    }

    // 터치 영역 설정
    this.setupInput();
  }

  private drawBackground(pressed: boolean = false): void {
    this.background.clear();

    const { width, height, radius, backgroundColor, borderColor, alpha } = this.config;
    const halfW = width / 2;
    const halfH = height / 2;

    // 배경색 (눌렸을 때 밝게)
    const bgColor = pressed ? this.lightenColor(backgroundColor, 0.2) : backgroundColor;
    const bgAlpha = pressed ? alpha + 0.1 : alpha;

    this.background.fillStyle(bgColor, bgAlpha);
    this.background.fillRoundedRect(-halfW, -halfH, width, height, radius);

    // 테두리
    this.background.lineStyle(2, borderColor, pressed ? 1 : 0.7);
    this.background.strokeRoundedRect(-halfW, -halfH, width, height, radius);

    // 눌렸을 때 내부 글로우 효과
    if (pressed) {
      this.background.fillStyle(borderColor, 0.2);
      this.background.fillRoundedRect(
        -halfW + 4,
        -halfH + 4,
        width - 8,
        height - 8,
        radius - 2
      );
    }
  }

  private lightenColor(color: number, amount: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) + Math.floor(255 * amount));
    const g = Math.min(255, ((color >> 8) & 0xff) + Math.floor(255 * amount));
    const b = Math.min(255, (color & 0xff) + Math.floor(255 * amount));
    return (r << 16) | (g << 8) | b;
  }

  private setupInput(): void {
    const { width, height } = this.config;

    // 히트 영역 설정
    const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.container.on('pointerdown', this.onPointerDown, this);
    this.container.on('pointerup', this.onPointerUp, this);
    this.container.on('pointerout', this.onPointerOut, this);
  }

  private onPointerDown(): void {
    if (!this.isEnabled) return;

    this.isPressed = true;
    this.drawBackground(true);

    // 축소 애니메이션
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
    });

    if (this.onPressCallback) {
      this.onPressCallback();
    }
  }

  private onPointerUp(): void {
    if (!this.isPressed) return;

    this.isPressed = false;
    this.drawBackground(false);

    // 원래 크기로 복원
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      duration: 50,
    });

    if (this.onReleaseCallback) {
      this.onReleaseCallback();
    }
  }

  private onPointerOut(): void {
    if (this.isPressed) {
      this.isPressed = false;
      this.drawBackground(false);

      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 50,
      });
    }
  }

  // 콜백 설정
  onPress(callback: () => void): this {
    this.onPressCallback = callback;
    return this;
  }

  onRelease(callback: () => void): this {
    this.onReleaseCallback = callback;
    return this;
  }

  // 상태 확인
  isPressedNow(): boolean {
    return this.isPressed;
  }

  // 활성화/비활성화
  setEnabled(enabled: boolean): this {
    this.isEnabled = enabled;
    this.container.setAlpha(enabled ? 1 : 0.5);
    return this;
  }

  isButtonEnabled(): boolean {
    return this.isEnabled;
  }

  // 표시/숨김
  setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  // 위치 변경
  setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }

  // 라벨 변경
  setLabel(label: string): this {
    if (this.labelText) {
      this.labelText.setText(label);
    }
    return this;
  }

  // 색상 변경
  setBackgroundColor(color: number): this {
    this.config.backgroundColor = color;
    this.drawBackground(this.isPressed);
    return this;
  }

  setBorderColor(color: number): this {
    this.config.borderColor = color;
    this.drawBackground(this.isPressed);
    return this;
  }

  // 크기 변경
  setSize(width: number, height: number): this {
    this.config.width = width;
    this.config.height = height;

    // 히트 영역 업데이트
    const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
    this.container.input!.hitArea = hitArea;

    this.drawBackground(this.isPressed);
    return this;
  }

  // 깊이 설정
  setDepth(depth: number): this {
    this.container.setDepth(depth);
    return this;
  }

  // 정리
  destroy(): void {
    this.container.off('pointerdown', this.onPointerDown, this);
    this.container.off('pointerup', this.onPointerUp, this);
    this.container.off('pointerout', this.onPointerOut, this);
    this.container.destroy();
  }
}
