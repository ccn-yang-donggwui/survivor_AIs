import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';

export abstract class BaseWeapon {
  public id: string;
  public name: string;
  public icon: string;
  public level: number = 1;
  public maxLevel: number = 8;

  protected scene: GameScene;
  protected baseDamage: number;
  protected baseCooldown: number;
  protected baseProjectileCount: number;

  protected currentCooldown: number = 0;

  constructor(scene: GameScene, config: {
    id: string;
    name: string;
    icon: string;
    baseDamage: number;
    baseCooldown: number;
    baseProjectileCount: number;
  }) {
    this.scene = scene;
    this.id = config.id;
    this.name = config.name;
    this.icon = config.icon;
    this.baseDamage = config.baseDamage;
    this.baseCooldown = config.baseCooldown;
    this.baseProjectileCount = config.baseProjectileCount;
  }

  public update(_time: number, delta: number, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    this.currentCooldown -= delta;

    if (this.currentCooldown <= 0) {
      this.attack(player, enemies);
      this.currentCooldown = this.getEffectiveCooldown(player);
    }
  }

  protected abstract attack(player: Player, enemies: Phaser.Physics.Arcade.Group): void;

  public levelUp(): void {
    if (this.level < this.maxLevel) {
      this.level++;
      this.onLevelUp();
    }
  }

  protected onLevelUp(): void {
    // 서브클래스에서 오버라이드
  }

  public getEffectiveDamage(player: Player): number {
    const baseMultiplier = 1 + (this.level - 1) * 0.2;
    return Math.floor(this.baseDamage * baseMultiplier * player.stats.damage);
  }

  public getEffectiveCooldown(player: Player): number {
    const cooldownReduction = 1 - (this.level - 1) * 0.05;
    return this.baseCooldown * cooldownReduction / player.stats.attackSpeed;
  }

  public getProjectileCount(player: Player): number {
    const bonusProjectiles = Math.floor((this.level - 1) / 2);
    return this.baseProjectileCount + bonusProjectiles + player.stats.projectileCount;
  }

  protected findNearestEnemy(player: Player, enemies: Phaser.Physics.Arcade.Group): Phaser.Physics.Arcade.Sprite | null {
    let nearest: Phaser.Physics.Arcade.Sprite | null = null;
    let minDistance = Infinity;

    enemies.getChildren().forEach((enemy) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      if (!e.active) return;

      const distance = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = e;
      }
    });

    return nearest;
  }

  protected findRandomEnemy(enemies: Phaser.Physics.Arcade.Group): Phaser.Physics.Arcade.Sprite | null {
    const activeEnemies = enemies.getChildren().filter(e => (e as Phaser.Physics.Arcade.Sprite).active);
    if (activeEnemies.length === 0) return null;
    return activeEnemies[Math.floor(Math.random() * activeEnemies.length)] as Phaser.Physics.Arcade.Sprite;
  }
}
