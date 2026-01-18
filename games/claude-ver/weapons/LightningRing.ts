import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';
import { DEPTH } from '../config/Constants';

export class LightningRing extends BaseWeapon {
  private strikeCount: number = 1;

  constructor(scene: GameScene) {
    super(scene, {
      id: 'lightning_ring',
      name: '번개 반지',
      icon: '💍',
      baseDamage: 30,
      baseCooldown: 2000,
      baseProjectileCount: 1
    });
  }

  protected attack(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const damage = this.getEffectiveDamage(player);
    const strikes = this.strikeCount + Math.floor((this.level - 1) / 2);

    // 화면 내 적 찾기
    const camera = this.scene.cameras.main;
    const screenEnemies: Phaser.Physics.Arcade.Sprite[] = [];

    enemies.getChildren().forEach((enemy) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      if (!e.active) return;

      // 화면 내에 있는지 확인
      if (e.x >= camera.worldView.x &&
          e.x <= camera.worldView.x + camera.width &&
          e.y >= camera.worldView.y &&
          e.y <= camera.worldView.y + camera.height) {
        screenEnemies.push(e);
      }
    });

    if (screenEnemies.length === 0) return;

    // 랜덤 적에게 번개
    for (let i = 0; i < Math.min(strikes, screenEnemies.length); i++) {
      const targetIndex = Math.floor(Math.random() * screenEnemies.length);
      const target = screenEnemies[targetIndex];

      this.scene.time.delayedCall(i * 100, () => {
        if (target.active) {
          this.strikeLightning(target, damage);
        }
      });

      // 같은 적을 다시 치지 않도록 제거
      screenEnemies.splice(targetIndex, 1);
    }
  }

  private strikeLightning(target: Phaser.Physics.Arcade.Sprite, damage: number): void {
    const x = target.x;
    const y = target.y;

    // 번개 시각 효과
    const graphics = this.scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    // 번개 라인 (위에서 아래로)
    const startY = y - 400;
    this.drawLightningBolt(graphics, x, startY, x, y);

    // 임팩트 원
    graphics.fillStyle(0xffff00, 0.8);
    graphics.fillCircle(x, y, 30);
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(x, y, 15);

    // 데미지
    (target as any).takeDamage(damage);
    this.showDamageNumber(x, y, damage);

    // 화면 흔들림
    this.scene.cameras.main.shake(50, 0.005);

    // 페이드 아웃
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 150,
      onComplete: () => graphics.destroy()
    });
  }

  private drawLightningBolt(graphics: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number): void {
    graphics.lineStyle(4, 0xffff00, 1);

    const segments = 8;
    let currentX = x1;
    let currentY = y1;

    graphics.beginPath();
    graphics.moveTo(currentX, currentY);

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const targetX = x1 + (x2 - x1) * t;
      const targetY = y1 + (y2 - y1) * t;

      // 지그재그 효과
      const offsetX = i < segments ? Phaser.Math.Between(-30, 30) : 0;

      currentX = targetX + offsetX;
      currentY = targetY;

      graphics.lineTo(currentX, currentY);
    }

    graphics.strokePath();

    // 밝은 중심선
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.beginPath();
    graphics.moveTo(x1, y1);

    currentX = x1;
    currentY = y1;

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const targetX = x1 + (x2 - x1) * t;
      const targetY = y1 + (y2 - y1) * t;

      const offsetX = i < segments ? Phaser.Math.Between(-20, 20) : 0;

      currentX = targetX + offsetX;
      currentY = targetY;

      graphics.lineTo(currentX, currentY);
    }

    graphics.strokePath();
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x, y - 30, damage.toString(), {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    text.setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: text,
      y: y - 70,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 800,
      onComplete: () => text.destroy()
    });
  }

  protected onLevelUp(): void {
    if (this.level === 4) this.strikeCount = 2;
    if (this.level === 7) this.strikeCount = 3;
  }
}
