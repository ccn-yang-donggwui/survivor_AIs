import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config/Constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private baseSpeed: number;
  private speed: number;
  private speedMultiplier: number;
  private maxHP: number;
  private currentHP: number;
  private lastDamageTime: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.baseSpeed = PLAYER_SPEED;
    this.speedMultiplier = 1;
    this.speed = this.baseSpeed;
    this.maxHP = 100;
    this.currentHP = this.maxHP;
    this.lastDamageTime = 0;
    this.setDepth(1);
    this.setCollideWorldBounds(true);
  }

  move(direction: Phaser.Math.Vector2): void {
    if (!this.active) {
      return;
    }
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      return;
    }

    if (direction.lengthSq() > 0) {
      const normalized = direction.normalize();
      body.setVelocity(normalized.x * this.speed, normalized.y * this.speed);
    } else {
      body.setVelocity(0, 0);
    }
  }

  takeDamage(amount: number, cooldownMs = 500): boolean {
    const now = this.scene.time.now;
    if (now - this.lastDamageTime < cooldownMs || this.currentHP <= 0) {
      return false;
    }

    this.lastDamageTime = now;
    this.currentHP = Math.max(0, this.currentHP - amount);

    this.setTintFill(0xff5b5b);
    this.scene.time.delayedCall(120, () => {
      if (!this.active) {
        return;
      }
      this.clearTint();
    });

    return true;
  }

  heal(amount: number): void {
    if (this.currentHP <= 0) {
      return;
    }
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }

  addMaxHP(amount: number): void {
    this.maxHP += amount;
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }

  applySpeedMultiplier(multiplier: number): void {
    this.speedMultiplier *= multiplier;
    this.speed = this.baseSpeed * this.speedMultiplier;
  }

  isDead(): boolean {
    return this.currentHP <= 0;
  }

  getCurrentHP(): number {
    return this.currentHP;
  }

  getMaxHP(): number {
    return this.maxHP;
  }
}
