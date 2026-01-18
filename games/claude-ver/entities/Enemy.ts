import Phaser from 'phaser';
import { ENEMY } from '../config/Constants';
import { GameScene } from '../scenes/GameScene';

interface EnemyConfig {
  hp: number;
  damage: number;
  speed: number;
  expValue: number;
  texture: string;
}

const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  slime: {
    hp: 5,
    damage: 5,
    speed: 60,
    expValue: 1,
    texture: 'enemy_slime'
  },
  zombie: {
    hp: 15,
    damage: 8,
    speed: 50,
    expValue: 2,
    texture: 'enemy_zombie'
  },
  bat: {
    hp: 8,
    damage: 10,
    speed: 120,
    expValue: 2,
    texture: 'enemy_bat'
  },
  skeleton: {
    hp: 25,
    damage: 12,
    speed: 80,
    expValue: 3,
    texture: 'enemy_skeleton'
  }
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public currentHP: number;
  public maxHP: number;
  public damage: number;
  public expValue: number;

  private moveSpeed: number;
  private gameScene: GameScene;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
    const config = ENEMY_CONFIGS[type] || ENEMY_CONFIGS.slime;
    super(scene, x, y, config.texture);

    this.gameScene = scene as GameScene;

    // 시간에 따른 HP 스케일링
    const minutes = this.gameScene.gameState.currentTime / 60000;
    const hpMultiplier = 1 + (minutes * 0.1);

    this.maxHP = Math.floor(config.hp * hpMultiplier);
    this.currentHP = this.maxHP;
    this.damage = config.damage;
    this.moveSpeed = config.speed;
    this.expValue = config.expValue;

    this.setOrigin(0.5);
  }

  public update(): void {
    if (!this.active || !this.body) return;

    // 플레이어 방향으로 이동
    const player = this.gameScene.player;
    if (!player || !player.active) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(
      Math.cos(angle) * this.moveSpeed,
      Math.sin(angle) * this.moveSpeed
    );

    // 스프라이트 방향 전환
    if (this.body && this.body.velocity.x < 0) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    // 플레이어와 너무 멀어지면 제거
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (distance > ENEMY.DESPAWN_DISTANCE) {
      this.destroy();
    }
  }

  public takeDamage(amount: number): void {
    this.currentHP -= amount;

    // 피격 효과 (빨간색 틴트)
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    // 사망 체크
    if (this.currentHP <= 0) {
      this.die();
    }
  }

  private die(): void {
    // 경험치 드롭
    this.gameScene.spawnExpGem(this.x, this.y, this.expValue);

    // 회복 아이템 드롭 (5% 확률)
    if (Math.random() < 0.05) {
      this.gameScene.spawnDropItem(this.x, this.y, 'heal');
    }

    // 보물상자 드롭 (1% 확률)
    if (Math.random() < 0.01) {
      this.gameScene.spawnDropItem(this.x, this.y, 'chest');
    }

    // 킬 카운트 증가
    this.gameScene.addKill();

    // 사망 이펙트
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
