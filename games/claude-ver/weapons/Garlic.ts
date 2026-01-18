import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';
import { DEPTH } from '../config/Constants';

export class Garlic extends BaseWeapon {
  private baseRadius: number = 80;
  private auraGraphics: Phaser.GameObjects.Graphics | null = null;
  private damageTimer: number = 0;
  private damageInterval: number = 500;

  constructor(scene: GameScene) {
    super(scene, {
      id: 'garlic',
      name: '마늘',
      icon: '🧄',
      baseDamage: 5,
      baseCooldown: 100, // 오라는 항상 활성화
      baseProjectileCount: 1
    });
  }

  public update(_time: number, delta: number, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    // 오라 그래픽 업데이트
    this.updateAura(player);

    // 데미지 타이머
    this.damageTimer += delta;

    if (this.damageTimer >= this.damageInterval) {
      this.damageTimer = 0;
      this.dealAuraDamage(player, enemies);
    }
  }

  protected attack(_player: Player, _enemies: Phaser.Physics.Arcade.Group): void {
    // 오라 무기는 update에서 처리
  }

  private updateAura(player: Player): void {
    const radius = this.baseRadius * player.stats.area;

    if (!this.auraGraphics) {
      this.auraGraphics = this.scene.add.graphics();
      this.auraGraphics.setDepth(DEPTH.EFFECTS - 1);
    }

    this.auraGraphics.clear();

    // 외곽 원
    this.auraGraphics.lineStyle(2, 0x88ff88, 0.6);
    this.auraGraphics.strokeCircle(player.x, player.y, radius);

    // 내부 원 (펄스 효과)
    const pulseRadius = radius * (0.8 + Math.sin(Date.now() / 200) * 0.1);
    this.auraGraphics.fillStyle(0x88ff88, 0.15);
    this.auraGraphics.fillCircle(player.x, player.y, pulseRadius);
  }

  private dealAuraDamage(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const damage = this.getEffectiveDamage(player);
    const radius = this.baseRadius * player.stats.area;

    enemies.getChildren().forEach((enemy) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      if (!e.active) return;

      const distance = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);

      if (distance <= radius) {
        (e as any).takeDamage(damage);
        this.showDamageNumber(e.x, e.y, damage);

        // 약간의 넉백
        const angle = Phaser.Math.Angle.Between(player.x, player.y, e.x, e.y);
        e.x += Math.cos(angle) * 10;
        e.y += Math.sin(angle) * 10;
      }
    });
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x + Phaser.Math.Between(-15, 15), y - 10, damage.toString(), {
      fontSize: '12px',
      color: '#88ff88'
    });
    text.setOrigin(0.5);
    text.setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 500,
      onComplete: () => text.destroy()
    });
  }

  protected onLevelUp(): void {
    if (this.level === 3) this.baseRadius = 100;
    if (this.level === 5) {
      this.baseRadius = 120;
      this.damageInterval = 400;
    }
    if (this.level === 7) this.baseRadius = 150;
  }
}
