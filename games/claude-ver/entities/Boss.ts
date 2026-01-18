import Phaser from 'phaser';
import { DEPTH } from '../config/Constants';
import { GameScene } from '../scenes/GameScene';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public currentHP: number;
  public maxHP: number;
  public damage: number;
  public expValue: number;

  private gameScene: GameScene;
  private moveSpeed: number = 80;
  private attackTimer: number = 0;
  private attackCooldown: number = 3000;
  private currentPattern: number = 0;
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpBarBg!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');

    this.gameScene = scene as GameScene;

    // 시간에 따른 스케일링
    const minutes = this.gameScene.gameState.currentTime / 60000;
    const hpMultiplier = 1 + (minutes * 0.1);

    this.maxHP = Math.floor(5000 * hpMultiplier);
    this.currentHP = this.maxHP;
    this.damage = 30;
    this.expValue = 500;

    this.setOrigin(0.5);
    this.setScale(1);
    this.setDepth(DEPTH.ENEMIES + 1);

    this.createHealthBar();
  }

  private createHealthBar(): void {
    this.hpBarBg = this.scene.add.graphics();
    this.hpBarBg.setDepth(DEPTH.UI);

    this.hpBar = this.scene.add.graphics();
    this.hpBar.setDepth(DEPTH.UI);
  }

  public update(_time: number, delta: number): void {
    if (!this.active || !this.body) return;

    const player = this.gameScene.player;
    if (!player || !player.active) return;

    // 플레이어 방향으로 이동
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(
      Math.cos(angle) * this.moveSpeed,
      Math.sin(angle) * this.moveSpeed
    );

    // 공격 패턴
    this.attackTimer += delta;
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0;
      this.executeAttackPattern();
    }

    // HP 바 업데이트
    this.updateHealthBar();
  }

  private executeAttackPattern(): void {
    const patterns = [
      () => this.dashAttack(),
      () => this.shockwaveAttack(),
      () => this.summonMinions()
    ];

    patterns[this.currentPattern]();
    this.currentPattern = (this.currentPattern + 1) % patterns.length;
  }

  private dashAttack(): void {
    const player = this.gameScene.player;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    // 대쉬 준비 이펙트
    this.setTint(0xff0000);

    this.scene.time.delayedCall(500, () => {
      if (!this.active || !this.body) return;

      // 빠른 대쉬
      const dashSpeed = 600;
      this.setVelocity(
        Math.cos(angle) * dashSpeed,
        Math.sin(angle) * dashSpeed
      );

      // 대쉬 중 잔상 효과
      for (let i = 0; i < 5; i++) {
        this.scene.time.delayedCall(i * 50, () => {
          if (!this.active) return;
          const afterImage = this.scene.add.sprite(this.x, this.y, 'boss');
          afterImage.setAlpha(0.3);
          afterImage.setTint(0xff0000);
          afterImage.setDepth(DEPTH.ENEMIES);
          this.scene.tweens.add({
            targets: afterImage,
            alpha: 0,
            duration: 300,
            onComplete: () => afterImage.destroy()
          });
        });
      }

      this.scene.time.delayedCall(500, () => {
        if (!this.active) return;
        this.clearTint();
      });
    });
  }

  private shockwaveAttack(): void {
    // 충격파 준비
    this.setTint(0xffff00);

    this.scene.time.delayedCall(800, () => {
      if (!this.active) return;

      // 충격파 생성
      const wave = this.scene.add.graphics();
      wave.setDepth(DEPTH.EFFECTS);

      let radius = 0;
      const maxRadius = 300;
      const damage = this.damage;
      const player = this.gameScene.player;
      let hasHitPlayer = false;

      const expandEvent = this.scene.time.addEvent({
        delay: 16,
        callback: () => {
          radius += 15;
          wave.clear();
          wave.lineStyle(8, 0xffff00, 1 - radius / maxRadius);
          wave.strokeCircle(this.x, this.y, radius);

          // 플레이어 피격 체크
          if (!hasHitPlayer) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            if (Math.abs(dist - radius) < 30) {
              player.takeDamage(damage);
              hasHitPlayer = true;
            }
          }

          if (radius >= maxRadius) {
            wave.destroy();
            expandEvent.destroy();
          }
        },
        loop: true
      });

      this.clearTint();
    });
  }

  private summonMinions(): void {
    this.setTint(0x8800ff);

    this.scene.time.delayedCall(500, () => {
      if (!this.active) return;

      // 주변에 적 소환
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 100;
        const x = this.x + Math.cos(angle) * distance;
        const y = this.y + Math.sin(angle) * distance;

        // 소환 이펙트
        const summonEffect = this.scene.add.circle(x, y, 20, 0x8800ff, 0.8);
        summonEffect.setDepth(DEPTH.EFFECTS);

        this.scene.tweens.add({
          targets: summonEffect,
          scaleX: 0,
          scaleY: 0,
          duration: 300,
          onComplete: () => {
            summonEffect.destroy();
            if (this.active) {
              this.gameScene.spawnEnemy(x, y, 'slime');
            }
          }
        });
      }

      this.clearTint();
    });
  }

  private updateHealthBar(): void {
    const barWidth = 200;
    const barHeight = 10;
    const x = this.x - barWidth / 2;
    const y = this.y - 80;

    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x333333);
    this.hpBarBg.fillRect(x, y, barWidth, barHeight);

    const hpPercent = this.currentHP / this.maxHP;
    this.hpBar.clear();
    this.hpBar.fillStyle(0xff0000);
    this.hpBar.fillRect(x, y, barWidth * hpPercent, barHeight);
  }

  public takeDamage(amount: number): void {
    this.currentHP -= amount;

    // 피격 효과
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.clearTint();
    });

    // 사망 체크
    if (this.currentHP <= 0) {
      this.die();
    }
  }

  private die(): void {
    // 보스 처치 보상
    this.gameScene.addKill();

    // 대량의 경험치 드롭
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100;
      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      this.gameScene.spawnExpGem(x, y, 25);
    }

    // HP 바 제거
    this.hpBar.destroy();
    this.hpBarBg.destroy();

    // 사망 이펙트
    this.scene.cameras.main.shake(500, 0.02);

    // 여러 폭발 이펙트
    for (let i = 0; i < 10; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const offsetX = Phaser.Math.Between(-50, 50);
        const offsetY = Phaser.Math.Between(-50, 50);
        const explosion = this.scene.add.circle(
          this.x + offsetX,
          this.y + offsetY,
          30,
          0xffff00,
          1
        );
        explosion.setDepth(DEPTH.EFFECTS);

        this.scene.tweens.add({
          targets: explosion,
          scaleX: 3,
          scaleY: 3,
          alpha: 0,
          duration: 300,
          onComplete: () => explosion.destroy()
        });
      });
    }

    // 보스 페이드 아웃
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 500,
      onComplete: () => {
        this.destroy();
        this.gameScene.onBossDefeated();
      }
    });
  }
}
