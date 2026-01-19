// Bloody Tear - 채찍 + 빈심장 진화 (흡혈 + 360도 회전 채찍)

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { DEPTH } from '../../../config/Constants';
import { Enemy } from '../../../entities/Enemy';

export class BloodyTear extends BaseWeapon {
  private player!: Player;
  private hitCount: number = 6;
  private lifesteal: number = 0.15;
  private critChance: number = 0.30;

  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);

    // 데이터에서 값 읽기
    this.hitCount = (data as any).baseHitCount || 6;
    this.lifesteal = (data as any).lifesteal || 0.15;
    this.critChance = (data as any).critChance || 0.30;
  }

  protected attack(player: Player): void {
    this.player = player;
    this.perform360Attack(player);
  }

  // 360도 회전 공격
  private perform360Attack(player: Player): void {
    const scene = this.scene;
    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const effectiveRange = this.range * area;

    // 회전 시각 효과
    const graphics = scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    // 빨간색 피의 눈물 효과
    const startAngle = Math.random() * Math.PI * 2;
    let currentAngle = startAngle;
    const rotationSpeed = 0.18; // 빠른 회전
    const totalRotation = Math.PI * 2; // 1회전
    let rotated = 0;

    // 트레일 효과를 위한 이전 위치 저장
    const trailPoints: { x: number; y: number; alpha: number }[] = [];

    // 이미 타격한 적 추적
    const hitEnemies = new Set<number>();
    let hitCountPerEnemy = new Map<number, number>();

    const rotateEvent = scene.time.addEvent({
      delay: 16,
      callback: () => {
        if (!this.scene || !player.active) {
          rotateEvent.destroy();
          graphics.destroy();
          return;
        }

        currentAngle += rotationSpeed;
        rotated += rotationSpeed;

        // 트레일 포인트 추가
        const tipX = player.x + Math.cos(currentAngle) * effectiveRange;
        const tipY = player.y + Math.sin(currentAngle) * effectiveRange;
        trailPoints.push({ x: tipX, y: tipY, alpha: 1 });

        // 오래된 트레일 페이드
        trailPoints.forEach(p => p.alpha -= 0.08);
        while (trailPoints.length > 0 && trailPoints[0].alpha <= 0) {
          trailPoints.shift();
        }

        graphics.clear();

        // 트레일 그리기
        trailPoints.forEach((point, i) => {
          if (point.alpha > 0) {
            graphics.fillStyle(0x8b0000, point.alpha * 0.5);
            graphics.fillCircle(point.x, point.y, 6);
          }
        });

        // 메인 채찍 그리기
        graphics.lineStyle(7, 0xb13e53, 0.95);
        graphics.beginPath();
        graphics.moveTo(player.x, player.y);

        const segments = 12;
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const waveAmp = 10 * (1 - t * 0.5); // 끝으로 갈수록 웨이브 감소
          const px = player.x + Math.cos(currentAngle) * effectiveRange * t;
          const py = player.y + Math.sin(currentAngle) * effectiveRange * t +
            Math.sin(t * Math.PI * 5 + rotated * 2) * waveAmp;
          graphics.lineTo(px, py);
        }
        graphics.strokePath();

        // 내부 밝은 선
        graphics.lineStyle(3, 0xff6666, 0.8);
        graphics.beginPath();
        graphics.moveTo(player.x, player.y);
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const waveAmp = 8 * (1 - t * 0.5);
          const px = player.x + Math.cos(currentAngle) * effectiveRange * t;
          const py = player.y + Math.sin(currentAngle) * effectiveRange * t +
            Math.sin(t * Math.PI * 5 + rotated * 2) * waveAmp;
          graphics.lineTo(px, py);
        }
        graphics.strokePath();

        // 끝점 이펙트 (피방울)
        graphics.fillStyle(0xff0000, 0.9);
        graphics.fillCircle(tipX, tipY, 10);
        graphics.fillStyle(0xffffff, 0.5);
        graphics.fillCircle(tipX - 3, tipY - 3, 3);

        // 피 튀김
        if (Math.random() < 0.4) {
          this.createBloodSplatter(tipX, tipY);
        }

        // 회전 중 적 타격
        this.hitEnemiesInArc(player, currentAngle, damage, effectiveRange, hitEnemies, hitCountPerEnemy);

        // 회전 완료
        if (rotated >= totalRotation) {
          rotateEvent.destroy();

          // 화려한 종료 이펙트
          this.createFinishEffect(player.x, player.y, effectiveRange);

          // 페이드 아웃
          scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 200,
            onComplete: () => graphics.destroy(),
          });
        }
      },
      loop: true,
    });
  }

  // 호 범위 내 적 타격
  private hitEnemiesInArc(
    player: Player,
    angle: number,
    damage: number,
    range: number,
    hitEnemies: Set<number>,
    hitCountPerEnemy: Map<number, number>
  ): void {
    if (!this.scene) return;

    const arcWidth = 0.5; // 넓은 호

    const enemies = this.scene.children.getChildren()
      .filter(child => child.getData('isEnemy')) as Enemy[];

    enemies.forEach(enemy => {
      if (!enemy.active) return;

      const enemyId = enemy.getData('enemyId');

      // 같은 적은 최대 hitCount번까지
      const currentHits = hitCountPerEnemy.get(enemyId) || 0;
      if (currentHits >= this.hitCount) return;

      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (dist > range) return;

      const enemyAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
      let angleDiff = Math.abs(enemyAngle - angle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

      if (angleDiff <= arcWidth) {
        hitCountPerEnemy.set(enemyId, currentHits + 1);

        // 크리티컬 계산
        const isCritical = Math.random() < this.critChance;
        const finalDamage = isCritical ? damage * 2 : damage;

        const isDead = enemy.takeDamage(finalDamage);

        // 크리티컬 이펙트
        if (isCritical) {
          this.createCriticalEffect(enemy.x, enemy.y);
        }

        // 흡혈 효과
        const healAmount = Math.floor(finalDamage * this.lifesteal);
        if (healAmount > 0) {
          player.heal(healAmount);
          this.createBloodDrainEffect(enemy.x, enemy.y, player.x, player.y);
        }

        // 넉백
        if (!isDead && this.knockback > 0) {
          const knockAngle = enemyAngle;
          enemy.x += Math.cos(knockAngle) * this.knockback * 0.4;
          enemy.y += Math.sin(knockAngle) * this.knockback * 0.4;
        }

        if (isDead) {
          this.scene.events.emit('enemyKilled', enemy);
          // 처치 시 추가 피 이펙트
          this.createDeathBloodEffect(enemy.x, enemy.y);
        }
      }
    });
  }

  private createBloodSplatter(x: number, y: number): void {
    if (!this.scene) return;

    const splatter = this.scene.add.graphics();
    splatter.setDepth(DEPTH.EFFECTS - 1);
    splatter.fillStyle(0xb13e53, 0.7);

    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 25;
      const offsetY = (Math.random() - 0.5) * 25;
      const size = 2 + Math.random() * 5;
      splatter.fillCircle(x + offsetX, y + offsetY, size);
    }

    this.scene.tweens.add({
      targets: splatter,
      alpha: 0,
      duration: 400,
      onComplete: () => splatter.destroy(),
    });
  }

  private createBloodDrainEffect(fromX: number, fromY: number, toX: number, toY: number): void {
    if (!this.scene) return;

    // 여러 개의 피방울이 플레이어로 날아감
    for (let i = 0; i < 2; i++) {
      const blood = this.scene.add.graphics();
      blood.setDepth(DEPTH.EFFECTS);
      blood.fillStyle(0xff0000, 0.9);
      blood.fillCircle(0, 0, 3 + Math.random() * 2);
      blood.setPosition(fromX + (Math.random() - 0.5) * 10, fromY + (Math.random() - 0.5) * 10);

      this.scene.tweens.add({
        targets: blood,
        x: toX,
        y: toY,
        alpha: 0,
        scale: 0.3,
        duration: 250 + i * 50,
        delay: i * 30,
        ease: 'Power2',
        onComplete: () => blood.destroy(),
      });
    }
  }

  private createCriticalEffect(x: number, y: number): void {
    if (!this.scene) return;

    // 크리티컬 텍스트
    const critText = this.scene.add.text(x, y - 20, 'CRIT!', {
      fontSize: '18px',
      color: '#ff2222',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    critText.setDepth(DEPTH.UI);
    critText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: critText,
      y: y - 55,
      alpha: 0,
      scale: 1.8,
      duration: 600,
      onComplete: () => critText.destroy(),
    });

    // 피 폭발 이펙트
    const bloodBurst = this.scene.add.graphics();
    bloodBurst.setDepth(DEPTH.EFFECTS);
    bloodBurst.setPosition(x, y);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      bloodBurst.lineStyle(3, 0xb13e53, 1);
      bloodBurst.beginPath();
      bloodBurst.moveTo(Math.cos(angle) * 5, Math.sin(angle) * 5);
      bloodBurst.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
      bloodBurst.strokePath();
    }

    this.scene.tweens.add({
      targets: bloodBurst,
      scale: 2,
      alpha: 0,
      duration: 250,
      onComplete: () => bloodBurst.destroy(),
    });
  }

  private createDeathBloodEffect(x: number, y: number): void {
    if (!this.scene) return;

    // 처치 시 큰 피 이펙트
    for (let i = 0; i < 6; i++) {
      const blood = this.scene.add.graphics();
      blood.setDepth(DEPTH.EFFECTS);
      blood.fillStyle(0x8b0000, 0.8);
      blood.fillCircle(0, 0, 4 + Math.random() * 4);
      blood.setPosition(x, y);

      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;

      this.scene.tweens.add({
        targets: blood,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => blood.destroy(),
      });
    }
  }

  private createFinishEffect(x: number, y: number, range: number): void {
    if (!this.scene) return;

    // 회전 완료 시 원형 파동
    const wave = this.scene.add.graphics();
    wave.setDepth(DEPTH.EFFECTS);
    wave.setPosition(x, y);
    wave.lineStyle(4, 0xb13e53, 0.8);
    wave.strokeCircle(0, 0, range * 0.3);

    this.scene.tweens.add({
      targets: wave,
      scale: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => wave.destroy(),
    });
  }
}
