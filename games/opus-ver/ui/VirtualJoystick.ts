// 가상 조이스틱 - 모바일 터치 입력

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';

export interface JoystickOutput {
  x: number; // -1 ~ 1
  y: number; // -1 ~ 1
  angle: number; // 라디안
  distance: number; // 0 ~ 1
  isActive: boolean;
}

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private baseX: number;
  private baseY: number;
  private radius: number;

  private baseGraphics: Phaser.GameObjects.Graphics;
  private stickGraphics: Phaser.GameObjects.Graphics;

  private isActive: boolean = false;
  private currentPointer: Phaser.Input.Pointer | null = null;

  private output: JoystickOutput = {
    x: 0,
    y: 0,
    angle: 0,
    distance: 0,
    isActive: false,
  };

  private fixedPosition: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    radius: number = 60,
    fixedPosition: boolean = true
  ) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;
    this.radius = radius;
    this.fixedPosition = fixedPosition;

    // 베이스 원 (반투명)
    this.baseGraphics = scene.add.graphics();
    this.baseGraphics.setScrollFactor(0);
    this.baseGraphics.setDepth(1000);
    this.drawBase();

    // 스틱 원
    this.stickGraphics = scene.add.graphics();
    this.stickGraphics.setScrollFactor(0);
    this.stickGraphics.setDepth(1001);
    this.drawStick(this.baseX, this.baseY);

    // 터치 이벤트 설정
    this.setupInput();

    // 초기에는 비활성
    this.setVisible(false);
  }

  private drawBase(): void {
    this.baseGraphics.clear();

    // 외곽 원
    this.baseGraphics.lineStyle(3, COLORS.UI_PRIMARY, 0.5);
    this.baseGraphics.strokeCircle(this.baseX, this.baseY, this.radius);

    // 내부 채움
    this.baseGraphics.fillStyle(COLORS.UI_BACKGROUND, 0.3);
    this.baseGraphics.fillCircle(this.baseX, this.baseY, this.radius);

    // 십자선
    this.baseGraphics.lineStyle(1, COLORS.UI_PRIMARY, 0.3);
    this.baseGraphics.lineBetween(
      this.baseX - this.radius * 0.5,
      this.baseY,
      this.baseX + this.radius * 0.5,
      this.baseY
    );
    this.baseGraphics.lineBetween(
      this.baseX,
      this.baseY - this.radius * 0.5,
      this.baseX,
      this.baseY + this.radius * 0.5
    );
  }

  private drawStick(x: number, y: number): void {
    this.stickGraphics.clear();

    // 스틱 원
    const stickRadius = this.radius * 0.4;

    this.stickGraphics.fillStyle(COLORS.UI_PRIMARY, 0.7);
    this.stickGraphics.fillCircle(x, y, stickRadius);

    this.stickGraphics.lineStyle(2, COLORS.UI_TEXT, 0.8);
    this.stickGraphics.strokeCircle(x, y, stickRadius);
  }

  private setupInput(): void {
    // 씬의 왼쪽 영역에서 터치 감지
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // 화면 왼쪽 절반에서만 조이스틱 활성화
    if (pointer.x > this.scene.cameras.main.width * 0.5) return;

    // 이미 활성화된 포인터가 있으면 무시
    if (this.currentPointer) return;

    this.currentPointer = pointer;
    this.isActive = true;

    // 고정 위치가 아니면 터치 위치로 이동
    if (!this.fixedPosition) {
      this.baseX = pointer.x;
      this.baseY = pointer.y;
      this.drawBase();
    }

    this.updateStickPosition(pointer.x, pointer.y);
    this.setVisible(true);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isActive || pointer !== this.currentPointer) return;

    this.updateStickPosition(pointer.x, pointer.y);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer !== this.currentPointer) return;

    this.isActive = false;
    this.currentPointer = null;

    // 스틱을 중앙으로
    this.drawStick(this.baseX, this.baseY);

    // 출력 리셋
    this.output = {
      x: 0,
      y: 0,
      angle: 0,
      distance: 0,
      isActive: false,
    };

    // 고정 위치가 아니면 숨김
    if (!this.fixedPosition) {
      this.setVisible(false);
    }
  }

  private updateStickPosition(pointerX: number, pointerY: number): void {
    const dx = pointerX - this.baseX;
    const dy = pointerY - this.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // 최대 거리 제한
    const clampedDistance = Math.min(distance, this.radius);
    const normalizedDistance = clampedDistance / this.radius;

    // 스틱 위치 계산
    const stickX = this.baseX + Math.cos(angle) * clampedDistance;
    const stickY = this.baseY + Math.sin(angle) * clampedDistance;

    this.drawStick(stickX, stickY);

    // 출력 업데이트
    this.output = {
      x: (dx / this.radius) * Math.min(1, distance / this.radius),
      y: (dy / this.radius) * Math.min(1, distance / this.radius),
      angle,
      distance: normalizedDistance,
      isActive: true,
    };

    // 정규화
    if (this.output.distance > 0) {
      const magnitude = Math.sqrt(this.output.x * this.output.x + this.output.y * this.output.y);
      if (magnitude > 1) {
        this.output.x /= magnitude;
        this.output.y /= magnitude;
      }
    }
  }

  // 조이스틱 출력 가져오기
  getOutput(): JoystickOutput {
    return { ...this.output };
  }

  // 조이스틱 이동 방향 (정규화된 벡터)
  getDirection(): { x: number; y: number } {
    return { x: this.output.x, y: this.output.y };
  }

  // 활성화 여부
  isJoystickActive(): boolean {
    return this.isActive;
  }

  // 표시/숨김
  setVisible(visible: boolean): void {
    this.baseGraphics.setVisible(visible);
    this.stickGraphics.setVisible(visible);
  }

  // 위치 변경
  setPosition(x: number, y: number): void {
    this.baseX = x;
    this.baseY = y;
    this.drawBase();
    if (!this.isActive) {
      this.drawStick(x, y);
    }
  }

  // 크기 변경
  setRadius(radius: number): void {
    this.radius = radius;
    this.drawBase();
    if (!this.isActive) {
      this.drawStick(this.baseX, this.baseY);
    }
  }

  // 고정 위치 모드 변경
  setFixedPosition(fixed: boolean): void {
    this.fixedPosition = fixed;
    if (fixed) {
      this.setVisible(true);
    }
  }

  // 정리
  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);

    this.baseGraphics.destroy();
    this.stickGraphics.destroy();
  }
}
