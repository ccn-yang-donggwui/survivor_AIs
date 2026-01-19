// 보스 엔티티 - 특수 능력을 가진 강력한 적

import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { DEPTH, COLORS } from '../config/Constants';

export interface BossConfig {
  hp: number;
  damage: number;
  speed: number;
  exp: number;
  abilities: BossAbility[];
}

export type BossAbility = 'charge' | 'summon' | 'projectile' | 'aoe' | 'enrage';

export class Boss extends Enemy {
  private abilities: BossAbility[];
  private abilityCooldowns: Map<BossAbility, number> = new Map();
  private isEnraged: boolean = false;
  private hpBar: Phaser.GameObjects.Graphics | null = null;
  private nameText: Phaser.GameObjects.Text | null = null;
  private bossName: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: BossConfig,
    bossName: string = 'BOSS'
  ) {
    super(scene, x, y, {
      id: 'boss',
      name: bossName,
      sprite: texture,
      hp: config.hp,
      damage: config.damage,
      speed: config.speed,
      expValue: config.exp,
      scale: 2,
      behavior: 'boss',
    });

    this.abilities = config.abilities;
    this.bossName = bossName;

    // 보스 표시
    this.setData('isBoss', true);
    this.setDepth(DEPTH.ENEMIES + 1);

    // 초기 쿨다운 설정
    this.abilities.forEach(ability => {
      this.abilityCooldowns.set(ability, 0);
    });

    // HP 바 생성
    this.createHPBar();

    // 이름 표시
    this.createNameText();

    // 스폰 효과
    this.playSpawnEffect();
  }

  private createHPBar(): void {
    this.hpBar = this.scene.add.graphics();
    this.hpBar.setDepth(DEPTH.UI - 1);
  }

  private createNameText(): void {
    this.nameText = this.scene.add.text(this.x, this.y - 50, this.bossName, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(DEPTH.UI - 1);
  }

  private playSpawnEffect(): void {
    // 스케일 애니메이션
    this.setScale(0);
    this.scene.tweens.add({
      targets: this,
      scale: 2,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // 충격파 효과
    const shockwave = this.scene.add.graphics();
    shockwave.setDepth(DEPTH.EFFECTS);
    shockwave.lineStyle(4, 0xffcd75, 1);
    shockwave.strokeCircle(this.x, this.y, 10);

    this.scene.tweens.add({
      targets: shockwave,
      scaleX: 10,
      scaleY: 10,
      alpha: 0,
      duration: 500,
      onComplete: () => shockwave.destroy(),
    });

    // 화면 효과
    this.scene.cameras.main.shake(500, 0.02);
    this.scene.cameras.main.flash(300, 255, 200, 100);
  }

  override update(time: number, delta: number): void {
    if (!this.active) return;

    super.update(time, delta);

    // HP 바 업데이트
    this.updateHPBar();

    // 이름 텍스트 위치 업데이트
    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - 60);
    }

    // 격노 체크 (HP 30% 이하)
    if (!this.isEnraged && this.currentHP < this.maxHP * 0.3) {
      this.triggerEnrage();
    }

    // 능력 쿨다운 업데이트
    this.abilities.forEach(ability => {
      const cooldown = this.abilityCooldowns.get(ability) || 0;
      if (cooldown > 0) {
        this.abilityCooldowns.set(ability, cooldown - delta);
      }
    });

    // 능력 사용 체크
    this.checkAbilities();
  }

  private updateHPBar(): void {
    if (!this.hpBar) return;

    this.hpBar.clear();

    const barWidth = 80;
    const barHeight = 8;
    const x = this.x - barWidth / 2;
    const y = this.y - 45;

    // 배경
    this.hpBar.fillStyle(0x333333, 1);
    this.hpBar.fillRect(x, y, barWidth, barHeight);

    // HP 채움
    const hpRatio = this.currentHP / this.maxHP;
    let color = 0xb13e53; // 빨강

    if (this.isEnraged) {
      // 격노 상태일 때 깜빡임
      color = Math.floor(Date.now() / 100) % 2 === 0 ? 0xef7d57 : 0xb13e53;
    }

    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(x, y, barWidth * hpRatio, barHeight);

    // 테두리
    this.hpBar.lineStyle(2, 0xffffff, 0.5);
    this.hpBar.strokeRect(x, y, barWidth, barHeight);
  }

  private triggerEnrage(): void {
    this.isEnraged = true;

    // 스탯 증가
    this.damage *= 1.5;
    this.speed *= 1.3;

    // 시각 효과
    this.setTint(0xef7d57);

    // 격노 이펙트
    const enrageText = this.scene.add.text(this.x, this.y - 80, 'ENRAGED!', {
      fontSize: '18px',
      color: '#ef7d57',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    enrageText.setOrigin(0.5);
    enrageText.setDepth(DEPTH.UI);

    this.scene.tweens.add({
      targets: enrageText,
      y: this.y - 120,
      alpha: 0,
      duration: 1000,
      onComplete: () => enrageText.destroy(),
    });

    // 충격파
    const wave = this.scene.add.graphics();
    wave.setDepth(DEPTH.EFFECTS);
    wave.lineStyle(3, 0xef7d57, 1);
    wave.strokeCircle(this.x, this.y, 20);

    this.scene.tweens.add({
      targets: wave,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 400,
      onComplete: () => wave.destroy(),
    });

    this.scene.cameras.main.shake(300, 0.01);
  }

  private checkAbilities(): void {
    const player = this.scene.data.get('player');
    if (!player) return;

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    this.abilities.forEach(ability => {
      const cooldown = this.abilityCooldowns.get(ability) || 0;
      if (cooldown > 0) return;

      switch (ability) {
        case 'charge':
          if (distToPlayer < 300 && distToPlayer > 100) {
            this.useChargeAbility(player);
            this.abilityCooldowns.set(ability, 4000);
          }
          break;

        case 'summon':
          if (Math.random() < 0.01) {
            this.useSummonAbility();
            this.abilityCooldowns.set(ability, 8000);
          }
          break;

        case 'projectile':
          if (distToPlayer < 400) {
            this.useProjectileAbility(player);
            this.abilityCooldowns.set(ability, 2000);
          }
          break;

        case 'aoe':
          if (distToPlayer < 150) {
            this.useAOEAbility();
            this.abilityCooldowns.set(ability, 5000);
          }
          break;
      }
    });
  }

  private useChargeAbility(player: any): void {
    // 돌진 준비 표시
    const indicator = this.scene.add.graphics();
    indicator.setDepth(DEPTH.EFFECTS);
    indicator.lineStyle(3, 0xef7d57, 0.8);

    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const dist = 200;

    indicator.lineBetween(
      this.x,
      this.y,
      this.x + Math.cos(angle) * dist,
      this.y + Math.sin(angle) * dist
    );

    // 잠시 멈춤 후 돌진
    this.setVelocity(0, 0);

    this.scene.time.delayedCall(500, () => {
      indicator.destroy();

      // 빠른 돌진
      this.setVelocity(
        Math.cos(angle) * this.speed * 4,
        Math.sin(angle) * this.speed * 4
      );

      // 1초 후 속도 복원
      this.scene.time.delayedCall(1000, () => {
        this.setVelocity(0, 0);
      });
    });
  }

  private useSummonAbility(): void {
    // 미니언 소환 (이벤트로 WaveManager에 전달)
    this.scene.events.emit('bossSummon', {
      x: this.x,
      y: this.y,
      count: this.isEnraged ? 5 : 3,
    });

    // 소환 이펙트
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i;
      const dist = 50;

      const summonEffect = this.scene.add.graphics();
      summonEffect.setDepth(DEPTH.EFFECTS);
      summonEffect.fillStyle(0x5d275d, 0.8);
      summonEffect.fillCircle(0, 0, 15);
      summonEffect.setPosition(
        this.x + Math.cos(angle) * dist,
        this.y + Math.sin(angle) * dist
      );

      this.scene.tweens.add({
        targets: summonEffect,
        alpha: 0,
        scale: 2,
        duration: 500,
        onComplete: () => summonEffect.destroy(),
      });
    }
  }

  private useProjectileAbility(player: any): void {
    const count = this.isEnraged ? 8 : 5;
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const angle = angleStep * i;

      // 투사체 이벤트 발생
      this.scene.events.emit('bossProjectile', {
        x: this.x,
        y: this.y,
        angle,
        damage: this.damage * 0.5,
        speed: 200,
      });

      // 시각 효과
      const proj = this.scene.add.graphics();
      proj.setDepth(DEPTH.EFFECTS);
      proj.fillStyle(0xb13e53, 1);
      proj.fillCircle(0, 0, 8);
      proj.setPosition(this.x, this.y);

      this.scene.tweens.add({
        targets: proj,
        x: this.x + Math.cos(angle) * 300,
        y: this.y + Math.sin(angle) * 300,
        alpha: 0,
        duration: 1000,
        onComplete: () => proj.destroy(),
      });
    }
  }

  private useAOEAbility(): void {
    const radius = this.isEnraged ? 150 : 100;

    // 경고 표시
    const warning = this.scene.add.graphics();
    warning.setDepth(DEPTH.EFFECTS);
    warning.lineStyle(3, 0xef7d57, 0.5);
    warning.strokeCircle(this.x, this.y, radius);

    // 잠시 후 AOE 폭발
    this.scene.time.delayedCall(500, () => {
      warning.destroy();

      // 폭발 효과
      const explosion = this.scene.add.graphics();
      explosion.setDepth(DEPTH.EFFECTS);
      explosion.fillStyle(0xef7d57, 0.6);
      explosion.fillCircle(this.x, this.y, radius);

      // AOE 데미지 이벤트
      this.scene.events.emit('bossAOE', {
        x: this.x,
        y: this.y,
        radius,
        damage: this.damage,
      });

      this.scene.tweens.add({
        targets: explosion,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: () => explosion.destroy(),
      });

      this.scene.cameras.main.shake(100, 0.01);
    });
  }

  override takeDamage(amount: number): boolean {
    const isDead = super.takeDamage(amount);

    // 피격 효과
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
    });

    if (isDead) {
      this.playDeathEffect();
    }

    return isDead;
  }

  private playDeathEffect(): void {
    // HP 바 제거
    this.hpBar?.destroy();
    this.nameText?.destroy();

    // 사망 효과
    const deathEffect = this.scene.add.graphics();
    deathEffect.setDepth(DEPTH.EFFECTS);
    deathEffect.fillStyle(0xffcd75, 0.8);
    deathEffect.fillCircle(this.x, this.y, 50);

    this.scene.tweens.add({
      targets: deathEffect,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => deathEffect.destroy(),
    });

    // 다중 파티클
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 100;

      const particle = this.scene.add.graphics();
      particle.setDepth(DEPTH.EFFECTS);
      particle.fillStyle(
        Phaser.Utils.Array.GetRandom([0xffcd75, 0xef7d57, 0xffffff]),
        1
      );
      particle.fillCircle(0, 0, 5 + Math.random() * 5);
      particle.setPosition(this.x, this.y);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        onComplete: () => particle.destroy(),
      });
    }

    // 화면 효과
    this.scene.cameras.main.shake(500, 0.02);
    this.scene.cameras.main.flash(300, 255, 205, 117);
  }

  override destroy(fromScene?: boolean): void {
    this.hpBar?.destroy();
    this.nameText?.destroy();
    super.destroy(fromScene);
  }
}
