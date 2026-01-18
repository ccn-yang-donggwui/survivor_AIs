import Phaser from 'phaser';

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base: Phaser.GameObjects.Graphics;
  private thumb: Phaser.GameObjects.Graphics;
  private radius: number;
  private thumbRadius: number;
  private center: Phaser.Math.Vector2;
  private direction: Phaser.Math.Vector2;
  private activePointerId: number | null;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
    this.scene = scene;
    this.radius = radius;
    this.thumbRadius = Math.max(12, radius * 0.35);
    this.center = new Phaser.Math.Vector2(x, y);
    this.direction = new Phaser.Math.Vector2(0, 0);
    this.activePointerId = null;

    this.base = scene.add.graphics({ x: 0, y: 0 });
    this.thumb = scene.add.graphics({ x: 0, y: 0 });

    this.base.setScrollFactor(0).setDepth(10);
    this.thumb.setScrollFactor(0).setDepth(11);

    this.drawBase();
    this.drawThumb(this.center.x, this.center.y);

    scene.input.on('pointerdown', this.handleDown, this);
    scene.input.on('pointermove', this.handleMove, this);
    scene.input.on('pointerup', this.handleUp, this);
    scene.input.on('pointerupoutside', this.handleUp, this);
  }

  getDirection(): Phaser.Math.Vector2 {
    return this.direction.clone();
  }

  setPosition(x: number, y: number): void {
    this.center.set(x, y);
    this.drawBase();
    this.drawThumb(this.center.x, this.center.y);
  }

  destroy(): void {
    this.base.destroy();
    this.thumb.destroy();
    this.scene.input.off('pointerdown', this.handleDown, this);
    this.scene.input.off('pointermove', this.handleMove, this);
    this.scene.input.off('pointerup', this.handleUp, this);
    this.scene.input.off('pointerupoutside', this.handleUp, this);
  }

  private handleDown(pointer: Phaser.Input.Pointer): void {
    if (this.activePointerId !== null) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.center.x, this.center.y);
    if (distance > this.radius) {
      return;
    }

    this.activePointerId = pointer.id;
    this.updateThumb(pointer.x, pointer.y);
  }

  private handleMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.activePointerId) {
      return;
    }

    this.updateThumb(pointer.x, pointer.y);
  }

  private handleUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.activePointerId) {
      return;
    }

    this.activePointerId = null;
    this.direction.set(0, 0);
    this.drawThumb(this.center.x, this.center.y);
  }

  private updateThumb(x: number, y: number): void {
    const offset = new Phaser.Math.Vector2(x - this.center.x, y - this.center.y);
    const distance = offset.length();

    if (distance > this.radius) {
      offset.normalize().scale(this.radius);
    }

    this.direction.set(offset.x / this.radius, offset.y / this.radius);
    this.drawThumb(this.center.x + offset.x, this.center.y + offset.y);
  }

  private drawBase(): void {
    this.base.clear();
    this.base.fillStyle(0x0f141d, 0.6);
    this.base.fillCircle(this.center.x, this.center.y, this.radius);
    this.base.lineStyle(2, 0x3c4a62, 0.9);
    this.base.strokeCircle(this.center.x, this.center.y, this.radius);
  }

  private drawThumb(x: number, y: number): void {
    this.thumb.clear();
    this.thumb.fillStyle(0x7ee3ff, 0.75);
    this.thumb.fillCircle(x, y, this.thumbRadius);
    this.thumb.lineStyle(2, 0xb6efff, 0.9);
    this.thumb.strokeCircle(x, y, this.thumbRadius);
  }
}
