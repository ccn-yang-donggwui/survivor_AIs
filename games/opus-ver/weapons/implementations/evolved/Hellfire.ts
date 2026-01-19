// Hellfire - 파이어볼 + 시금치 진화 (지옥의 화염)

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { Projectile } from '../../../entities/Projectile';
import { DEPTH } from '../../../config/Constants';
import { Enemy } from '../../../entities/Enemy';

export class Hellfire extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    const count = this.getEffectiveProjectileCount(player) * 2;
    const damage = this.getEffectiveDamage(player) * 2;
    const area = this.getEffectiveArea(player) * 2;

    const target = this.findNearestEnemy(player);
    let baseAngle: number;

    if (target) {
      baseAngle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    } else {
      baseAngle = Math.atan2(player.lastDirection.y, player.lastDirection.x);
    }

    const spread = 0.4;

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spread;
      const angle = baseAngle + angleOffset;

      this.scene.time.delayedCall(i * 50, () => {
        const projectile = new HellfireProjectile(
          this.scene,
          player.x,
          player.y,
          'projectile_fire',
          {
            damage,
            speed: this.speed * 1.2,
            piercing: 0,
            duration: 3000,
            area: area * 2,
            knockback: 30,
          },
          this.id,
          damage * 0.8,
          80 * area
        );

        projectile.setData('weaponId', this.id);

        const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
        if (projectiles) {
          projectiles.add(projectile);
        }

        // 그룹 추가 후 velocity 설정
        projectile.setVelocityFromAngle(angle, this.speed * 1.2);
      });
    }
  }
}

// 지옥불 투사체
class HellfireProjectile extends Projectile {
  private explosionDamage: number;
  private explosionRadius: number;
  private hasExploded: boolean = false;
  private trailTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: any,
    weaponId: string,
    explosionDamage: number,
    explosionRadius: number
  ) {
    super(scene, x, y, texture, config, weaponId);
    this.explosionDamage = explosionDamage;
    this.explosionRadius = explosionRadius;

    // 더 큰 크기와 색조
    this.setScale(1.5);
    this.setTint(0xef7d57);
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);

    // 이미 파괴되었으면 리턴
    if (!this.active || !this.scene) return;

    // 화염 트레일
    this.trailTimer += delta;
    if (this.trailTimer > 30) {
      this.trailTimer = 0;
      this.createFireTrail();
    }
  }

  private createFireTrail(): void {
    if (!this.scene) return;

    const trail = this.scene.add.graphics();
    trail.setDepth(DEPTH.EFFECTS - 1);

    // 여러 색상의 화염
    const colors = [0xef7d57, 0xffcd75, 0xb13e53];
    const color = Phaser.Utils.Array.GetRandom(colors);

    trail.fillStyle(color, 0.7);
    trail.fillCircle(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, 4 + Math.random() * 4);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => trail.destroy(),
    });
  }

  override onHitEnemy(enemyId: number): boolean {
    const canHit = super.onHitEnemy(enemyId);
    if (canHit && !this.hasExploded) {
      this.explode();
    }
    return canHit;
  }

  private explode(): void {
    if (this.hasExploded || !this.scene) return;
    this.hasExploded = true;

    const x = this.x;
    const y = this.y;

    // 거대한 폭발 그래픽
    const graphics = this.scene.add.graphics();
    graphics.setDepth(DEPTH.EFFECTS);
    graphics.setPosition(x, y);

    // 다중 폭발 원
    graphics.fillStyle(0xef7d57, 0.8);
    graphics.fillCircle(0, 0, this.explosionRadius);

    graphics.fillStyle(0xffcd75, 0.6);
    graphics.fillCircle(0, 0, this.explosionRadius * 0.7);

    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillCircle(0, 0, this.explosionRadius * 0.4);

    // 외곽 링
    graphics.lineStyle(5, 0xb13e53, 0.9);
    graphics.strokeCircle(0, 0, this.explosionRadius);

    // 화면 흔들기 (강하게)
    this.scene.cameras.main.shake(150, 0.015);

    // 화면 플래시
    this.scene.cameras.main.flash(100, 255, 100, 50);

    // 범위 내 적에게 데미지
    const enemies = this.scene.children.getChildren()
      .filter(child => child.getData('isEnemy')) as Enemy[];

    enemies.forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist <= this.explosionRadius) {
        // 중심에 가까울수록 더 큰 데미지
        const distanceFactor = 1 - (dist / this.explosionRadius) * 0.5;
        const actualDamage = this.explosionDamage * distanceFactor;

        const isDead = enemy.takeDamage(actualDamage);

        // 강한 넉백
        const knockbackAngle = Math.atan2(enemy.y - y, enemy.x - x);
        const knockbackForce = 40 * (1 - dist / this.explosionRadius);
        enemy.x += Math.cos(knockbackAngle) * knockbackForce;
        enemy.y += Math.sin(knockbackAngle) * knockbackForce;

        if (isDead) {
          this.scene.events.emit('enemyKilled', enemy);
        }
      }
    });

    // 폭발 잔해 파티클
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const dist = this.explosionRadius * 0.8;

      const particle = this.scene.add.graphics();
      particle.setDepth(DEPTH.EFFECTS);
      particle.fillStyle(Phaser.Utils.Array.GetRandom([0xef7d57, 0xffcd75, 0xb13e53]), 0.8);
      particle.fillCircle(0, 0, 6);
      particle.setPosition(x, y);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    // 폭발 페이드 아웃
    this.scene.tweens.add({
      targets: graphics,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => graphics.destroy(),
    });

    // 지면에 불 웅덩이 남기기
    this.createFirePool(x, y);

    this.destroy();
  }

  private createFirePool(x: number, y: number): void {
    if (!this.scene) return;

    const scene = this.scene; // scene 참조 저장
    const poolRadius = this.explosionRadius * 0.5;
    const poolDuration = 2000;
    const poolDamage = this.explosionDamage * 0.2;

    const poolGraphics = scene.add.graphics();
    poolGraphics.setDepth(DEPTH.EFFECTS - 1);
    poolGraphics.setPosition(x, y);

    // 주기적 데미지
    const damageTimer = scene.time.addEvent({
      delay: 200,
      repeat: poolDuration / 200 - 1,
      callback: () => {
        if (!poolGraphics.active) return;

        // 그래픽 업데이트
        poolGraphics.clear();
        poolGraphics.fillStyle(0xef7d57, 0.4);
        poolGraphics.fillCircle(0, 0, poolRadius);

        // 데미지
        const enemies = scene.children.getChildren()
          .filter(child => child.getData('isEnemy')) as Enemy[];

        enemies.forEach(enemy => {
          const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
          if (dist <= poolRadius) {
            const isDead = enemy.takeDamage(poolDamage);
            if (isDead) {
              scene.events.emit('enemyKilled', enemy);
            }
          }
        });
      },
    });

    // 종료
    scene.time.delayedCall(poolDuration, () => {
      damageTimer.destroy();
      if (!poolGraphics.active) return;
      scene.tweens.add({
        targets: poolGraphics,
        alpha: 0,
        duration: 300,
        onComplete: () => poolGraphics.destroy(),
      });
    });
  }
}
