import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';
import { DEPTH } from '../config/Constants';

export class Whip extends BaseWeapon {
  private baseRange: number = 150;
  private baseWidth: number = 60;

  constructor(scene: GameScene) {
    super(scene, {
      id: 'whip',
      name: '채찍',
      icon: '⚡',
      baseDamage: 15,
      baseCooldown: 1500,
      baseProjectileCount: 1
    });
  }

  protected attack(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const damage = this.getEffectiveDamage(player);
    const range = this.baseRange * player.stats.area;
    const width = this.baseWidth * player.stats.area;

    // 플레이어가 바라보는 방향
    const dir = player.getLastDirection();
    const isLeft = dir.x < 0;

    // 시각 효과
    this.createWhipEffect(player.x, player.y, range, width, isLeft);

    // 범위 내 적 데미지
    enemies.getChildren().forEach((enemy) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      if (!e.active) return;

      // 사각형 범위 체크
      const inRangeX = isLeft
        ? (e.x >= player.x - range && e.x <= player.x)
        : (e.x >= player.x && e.x <= player.x + range);
      const inRangeY = Math.abs(e.y - player.y) <= width / 2;

      if (inRangeX && inRangeY) {
        (e as any).takeDamage(damage);
        this.showDamageNumber(e.x, e.y, damage);

        // 넉백 효과
        const knockbackDir = isLeft ? -1 : 1;
        e.x += knockbackDir * 20;
      }
    });
  }

  private createWhipEffect(playerX: number, playerY: number, range: number, width: number, isLeft: boolean): void {
    const graphics = this.scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    const startX = playerX;
    const endX = isLeft ? playerX - range : playerX + range;

    // 채찍 라인
    graphics.lineStyle(4, 0xffff00, 1);
    graphics.beginPath();
    graphics.moveTo(startX, playerY);

    // 웨이브 형태로 그리기
    const segments = 10;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t;
      const waveY = playerY + Math.sin(t * Math.PI * 3) * (width / 4) * (1 - t);
      graphics.lineTo(x, waveY);
    }

    graphics.strokePath();

    // 끝부분 이펙트
    const tipX = endX;
    graphics.fillStyle(0xffff00, 0.8);
    graphics.fillCircle(tipX, playerY, 15);

    // 페이드 아웃
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 200,
      onComplete: () => graphics.destroy()
    });
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x, y - 20, damage.toString(), {
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    text.setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    });
  }

  protected override onLevelUp(): void {
    if (this.level === 3) this.baseRange = 180;
    if (this.level === 5) this.baseWidth = 80;
    if (this.level === 7) this.baseRange = 220;
  }
}
