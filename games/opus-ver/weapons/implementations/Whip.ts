import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { DEPTH } from '../../config/Constants';
import { Enemy } from '../../entities/Enemy';

export class Whip extends BaseWeapon {
  // 채찍 전용 스탯
  private hitCount: number;
  private dualDirection: boolean = false;
  private critChance: number = 0;
  private lifesteal: number = 0;
  private isRadialAttack: boolean = false; // 360도 공격 (진화용)

  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);

    // 채찍 전용 스탯 초기화
    this.hitCount = (data as any).baseHitCount || 2;
    this.lifesteal = (data as any).lifesteal || 0;
    this.critChance = (data as any).critChance || 0;
    this.isRadialAttack = data.targeting === 'radial';
  }

  override levelUp(): boolean {
    if (this.level >= this.maxLevel) return false;

    this.level++;
    this.applyWhipLevelUpBonus();
    return true;
  }

  private applyWhipLevelUpBonus(): void {
    const levelData = this.data.levelUp?.find(l => l.level === this.level);
    if (!levelData) return;

    // 기본 스탯 적용
    if ((levelData as any).damage) this.damage += (levelData as any).damage;
    if ((levelData as any).damagePercent) this.damage *= (1 + (levelData as any).damagePercent / 100);
    if ((levelData as any).cooldownPercent) this.cooldown *= (1 - (levelData as any).cooldownPercent / 100);
    if ((levelData as any).range) this.range += (levelData as any).range;
    if ((levelData as any).area) this.area += (levelData as any).area;

    // 채찍 전용 스탯
    if ((levelData as any).hitCount) this.hitCount += (levelData as any).hitCount;
    if ((levelData as any).dualDirection) this.dualDirection = true;
    if ((levelData as any).critChance) this.critChance = (levelData as any).critChance;
  }

  protected attack(player: Player): void {
    if (!this.scene) return;

    if (this.isRadialAttack) {
      // 진화 무기: 360도 회전 공격
      this.radialAttack(player);
    } else if (this.dualDirection) {
      // Lv3+: 양방향 공격
      this.dualDirectionAttack(player);
    } else {
      // 기본: 단방향 공격
      this.singleDirectionAttack(player);
    }
  }

  // 단방향 공격
  private singleDirectionAttack(player: Player): void {
    const direction = player.lastDirection;
    const angle = Math.atan2(direction.y, direction.x);
    this.performWhipAttack(player, angle);
  }

  // 양방향 공격 (전방 + 후방)
  private dualDirectionAttack(player: Player): void {
    const direction = player.lastDirection;
    const forwardAngle = Math.atan2(direction.y, direction.x);
    const backwardAngle = forwardAngle + Math.PI;

    // 전방 공격
    this.performWhipAttack(player, forwardAngle);

    // 후방 공격 (약간의 딜레이)
    this.scene.time.delayedCall(80, () => {
      if (this.scene && player.active) {
        this.performWhipAttack(player, backwardAngle);
      }
    });
  }

  // 360도 회전 공격 (진화 무기)
  private radialAttack(player: Player): void {
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
    const rotationSpeed = 0.15; // 회전 속도
    const totalRotation = Math.PI * 2; // 1회전
    let rotated = 0;

    // 이미 타격한 적 추적 (회전당)
    const hitEnemiesThisRotation = new Set<number>();

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

        // 채찍 그리기
        graphics.clear();
        graphics.lineStyle(6, 0xff3333, 0.9);
        graphics.beginPath();
        graphics.moveTo(player.x, player.y);

        const segments = 10;
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const px = player.x + Math.cos(currentAngle) * effectiveRange * t;
          const py = player.y + Math.sin(currentAngle) * effectiveRange * t +
            Math.sin(t * Math.PI * 4) * 8;
          graphics.lineTo(px, py);
        }
        graphics.strokePath();

        // 끝점 이펙트
        const endX = player.x + Math.cos(currentAngle) * effectiveRange;
        const endY = player.y + Math.sin(currentAngle) * effectiveRange;
        graphics.fillStyle(0xff0000, 0.8);
        graphics.fillCircle(endX, endY, 8);

        // 회전 중 적 타격
        this.hitEnemiesInArc(player, currentAngle, damage, effectiveRange, hitEnemiesThisRotation);

        // 회전 완료
        if (rotated >= totalRotation) {
          rotateEvent.destroy();

          // 페이드 아웃
          scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 150,
            onComplete: () => graphics.destroy(),
          });
        }
      },
      loop: true,
    });
  }

  // 채찍 공격 수행 (연속 타격 포함)
  private performWhipAttack(player: Player, angle: number): void {
    const scene = this.scene;
    const baseDamage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const effectiveRange = this.range * area;
    const effectiveWidth = 70 * area;

    // 공격 범위 중심점
    const centerX = player.x + Math.cos(angle) * (effectiveRange / 2);
    const centerY = player.y + Math.sin(angle) * (effectiveRange / 2);

    // 이미 타격한 적 추적 (같은 적 여러 번 타격 방지 - 한 히트 내에서)
    const hitEnemiesPerHit = new Map<number, number>(); // enemyId -> hitCount

    // 연속 타격 실행
    for (let hit = 0; hit < this.hitCount; hit++) {
      const hitDelay = hit * 80; // 80ms 간격으로 타격

      scene.time.delayedCall(hitDelay, () => {
        if (!this.scene || !player.active) return;

        // 시각 효과 (각 타격마다)
        this.createWhipVisual(player, angle, effectiveRange, hit);

        // 범위 내 적에게 데미지
        const enemies = scene.children.getChildren()
          .filter(child => child.getData('isEnemy')) as Enemy[];

        enemies.forEach(enemy => {
          if (!enemy.active) return;

          // 사각형 범위 체크
          const dx = enemy.x - centerX;
          const dy = enemy.y - centerY;

          // 방향 벡터로 회전된 좌표
          const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
          const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle);

          if (Math.abs(rotatedX) <= effectiveRange / 2 &&
              Math.abs(rotatedY) <= effectiveWidth / 2) {

            const enemyId = enemy.getData('enemyId');
            const currentHits = hitEnemiesPerHit.get(enemyId) || 0;

            // 같은 적은 최대 hitCount번까지만 타격
            if (currentHits < this.hitCount) {
              hitEnemiesPerHit.set(enemyId, currentHits + 1);

              // 크리티컬 계산
              const isCritical = Math.random() < this.critChance;
              const finalDamage = isCritical ? baseDamage * 2 : baseDamage;

              const isDead = enemy.takeDamage(finalDamage);

              // 크리티컬 이펙트
              if (isCritical) {
                this.createCriticalEffect(enemy.x, enemy.y);
              }

              // 흡혈
              if (this.lifesteal > 0 && !isDead) {
                const healAmount = Math.floor(finalDamage * this.lifesteal);
                if (healAmount > 0) {
                  player.heal(healAmount);
                  this.createLifestealEffect(player.x, player.y);
                }
              }

              // 넉백
              if (!isDead && this.knockback > 0) {
                const knockAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                enemy.x += Math.cos(knockAngle) * this.knockback;
                enemy.y += Math.sin(knockAngle) * this.knockback;
              }

              if (isDead) {
                scene.events.emit('enemyKilled', enemy);
              }
            }
          }
        });
      });
    }
  }

  // 호 범위 내 적 타격 (360도 회전용)
  private hitEnemiesInArc(
    player: Player,
    angle: number,
    damage: number,
    range: number,
    hitEnemies: Set<number>
  ): void {
    const arcWidth = 0.4; // 호의 각도 너비 (라디안)

    const enemies = this.scene.children.getChildren()
      .filter(child => child.getData('isEnemy')) as Enemy[];

    enemies.forEach(enemy => {
      if (!enemy.active) return;

      const enemyId = enemy.getData('enemyId');
      if (hitEnemies.has(enemyId)) return; // 이미 타격함

      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (dist > range) return;

      const enemyAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
      let angleDiff = Math.abs(enemyAngle - angle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

      if (angleDiff <= arcWidth) {
        hitEnemies.add(enemyId);

        // 크리티컬 계산
        const isCritical = Math.random() < this.critChance;
        const finalDamage = isCritical ? damage * 2 : damage;

        const isDead = enemy.takeDamage(finalDamage);

        if (isCritical) {
          this.createCriticalEffect(enemy.x, enemy.y);
        }

        // 흡혈
        if (this.lifesteal > 0 && !isDead) {
          const healAmount = Math.floor(finalDamage * this.lifesteal);
          if (healAmount > 0) {
            player.heal(healAmount);
            this.createLifestealEffect(player.x, player.y);
          }
        }

        // 넉백
        if (!isDead && this.knockback > 0) {
          const knockAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
          enemy.x += Math.cos(knockAngle) * this.knockback * 0.5;
          enemy.y += Math.sin(knockAngle) * this.knockback * 0.5;
        }

        if (isDead) {
          this.scene.events.emit('enemyKilled', enemy);
        }
      }
    });
  }

  // 채찍 시각 효과
  private createWhipVisual(player: Player, angle: number, range: number, hitIndex: number): void {
    const graphics = this.scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);

    // 히트 인덱스에 따라 약간 다른 색상
    const colors = [0xffcd75, 0xffd700, 0xffa500];
    const color = colors[hitIndex % colors.length];
    const alpha = 1 - (hitIndex * 0.15);

    // 채찍 곡선
    graphics.lineStyle(4 - hitIndex * 0.5, color, alpha);
    graphics.beginPath();
    graphics.moveTo(player.x, player.y);

    const segments = 8;
    const waveOffset = hitIndex * 0.5; // 각 타격마다 웨이브 오프셋

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const px = player.x + Math.cos(angle) * range * t;
      const py = player.y + Math.sin(angle) * range * t +
        Math.sin((t * Math.PI * 3) + waveOffset) * (12 - hitIndex * 2);
      graphics.lineTo(px, py);
    }
    graphics.strokePath();

    // 끝점 이펙트
    const endX = player.x + Math.cos(angle) * range;
    const endY = player.y + Math.sin(angle) * range;
    graphics.fillStyle(color, alpha);
    graphics.fillCircle(endX, endY, 6 - hitIndex);

    // 페이드 아웃
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 150,
      onComplete: () => graphics.destroy(),
    });
  }

  // 크리티컬 이펙트
  private createCriticalEffect(x: number, y: number): void {
    // 크리티컬 텍스트
    const critText = this.scene.add.text(x, y - 20, 'CRIT!', {
      fontSize: '16px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    critText.setDepth(DEPTH.UI);
    critText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: critText,
      y: y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      onComplete: () => critText.destroy(),
    });

    // 스파크 이펙트
    const spark = this.scene.add.graphics();
    spark.setDepth(DEPTH.EFFECTS);
    spark.setPosition(x, y);
    spark.fillStyle(0xffff00, 1);

    for (let i = 0; i < 6; i++) {
      const sparkAngle = (i / 6) * Math.PI * 2;
      const innerR = 5;
      const outerR = 15;
      spark.beginPath();
      spark.moveTo(Math.cos(sparkAngle) * innerR, Math.sin(sparkAngle) * innerR);
      spark.lineTo(Math.cos(sparkAngle) * outerR, Math.sin(sparkAngle) * outerR);
      spark.strokePath();
    }

    this.scene.tweens.add({
      targets: spark,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => spark.destroy(),
    });
  }

  // 흡혈 이펙트
  private createLifestealEffect(x: number, y: number): void {
    const heart = this.scene.add.graphics();
    heart.setDepth(DEPTH.EFFECTS);
    heart.setPosition(x + (Math.random() - 0.5) * 20, y);
    heart.fillStyle(0xff0000, 0.8);
    heart.fillCircle(0, 0, 4);

    this.scene.tweens.add({
      targets: heart,
      y: y - 30,
      alpha: 0,
      duration: 400,
      onComplete: () => heart.destroy(),
    });
  }
}
