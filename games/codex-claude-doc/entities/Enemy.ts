import Phaser from 'phaser';
import { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private baseSpeed: number;
  private baseDamage: number;
  private baseMaxHP: number;
  private baseExpValue: number;
  private speed: number;
  private damage: number;
  private maxHP: number;
  private currentHP: number;
  private expValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey = 'enemy') {
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.baseSpeed = Phaser.Math.Between(70, 100);
    this.baseDamage = 10;
    this.baseMaxHP = 20;
    this.baseExpValue = Phaser.Math.Between(5, 8);
    this.speed = this.baseSpeed;
    this.damage = this.baseDamage;
    this.maxHP = this.baseMaxHP;
    this.currentHP = this.maxHP;
    this.expValue = this.baseExpValue;

    this.setDepth(1);
    this.setCollideWorldBounds(true);
  }

  override update(player: Player): void {
    if (!this.active) {
      return;
    }
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      return;
    }
    const direction = new Phaser.Math.Vector2(player.x - this.x, player.y - this.y);

    if (direction.lengthSq() > 0) {
      direction.normalize();
      body.setVelocity(direction.x * this.speed, direction.y * this.speed);
    } else {
      body.setVelocity(0, 0);
    }
  }

  getDamage(): number {
    return this.damage;
  }

  getExpValue(): number {
    return this.expValue;
  }

  applyDifficulty(multiplier: { speed: number; hp: number; damage: number; exp: number }): void {
    this.speed = Math.max(40, Math.round(this.baseSpeed * multiplier.speed));
    this.damage = Math.max(4, Math.round(this.baseDamage * multiplier.damage));
    this.maxHP = Math.max(8, Math.round(this.baseMaxHP * multiplier.hp));
    this.expValue = Math.max(3, Math.round(this.baseExpValue * multiplier.exp));
    this.currentHP = this.maxHP;
  }

  takeDamage(amount: number): boolean {
    this.currentHP = Math.max(0, this.currentHP - amount);
    return this.currentHP <= 0;
  }
}
