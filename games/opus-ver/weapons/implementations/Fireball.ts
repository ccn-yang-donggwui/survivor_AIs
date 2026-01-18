import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { Projectile } from '../../entities/Projectile';
import { DEPTH } from '../../config/Constants';
import { Enemy } from '../../entities/Enemy';

export class Fireball extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);

    // 적 밀집 지역 타겟팅
    const clusterCenter = this.findEnemyClusterCenter(player, 700);
    const nearestEnemy = this.findNearestEnemy(player);

    let baseAngle: number;

    if (clusterCenter) {
      // 밀집 지역이 있으면 그쪽으로
      baseAngle = Phaser.Math.Angle.Between(player.x, player.y, clusterCenter.x, clusterCenter.y);
    } else if (nearestEnemy) {
      // 없으면 가장 가까운 적으로
      baseAngle = Phaser.Math.Angle.Between(player.x, player.y, nearestEnemy.x, nearestEnemy.y);
    } else {
      // 적이 없으면 마지막 이동 방향
      baseAngle = Math.atan2(player.lastDirection.y, player.lastDirection.x);
    }

    const spread = 0.25;

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spread;
      const angle = baseAngle + angleOffset;

      const projectile = new FireballProjectile(
        this.scene,
        player.x,
        player.y,
        'projectile_fire',
        {
          damage,
          speed: this.speed,
          piercing: 0,
          duration: 2500,
          area: area * 1.5,
          knockback: 20,
        },
        this.id,
        damage * 0.5, // 폭발 데미지
        50 * area // 폭발 범위
      );

      projectile.setData('weaponId', this.id);

      const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
      if (projectiles) {
        projectiles.add(projectile);
      }

      // 그룹 추가 후 velocity 설정
      projectile.setVelocityFromAngle(angle, this.speed);
    }
  }
}

// 폭발하는 파이어볼 투사체
class FireballProjectile extends Projectile {
  private explosionDamage: number;
  private explosionRadius: number;
  private hasExploded: boolean = false;

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
  }

  override onHitEnemy(enemyId: number): boolean {
    if (this.hitEnemies.has(enemyId)) {
      return false;
    }

    // 폭발을 먼저 처리! (destroy 전에)
    if (!this.hasExploded && this.scene) {
      this.explode();
    }

    // 수동으로 hitEnemies 관리
    this.hitEnemies.add(enemyId);
    this.piercing--;

    if (this.piercing < 0) {
      this.destroy();
    }

    return true;
  }

  private explode(): void {
    if (this.hasExploded || !this.scene) return;
    this.hasExploded = true;

    const x = this.x;
    const y = this.y;
    const scene = this.scene;
    const radius = this.explosionRadius;

    // 화면 흔들기
    scene.cameras.main.shake(120, 0.008);

    // === 바닥 화염 영역 (파이어볼 투사체와 동일한 색상) ===
    // 팔레트 색상: 2=0xb13e53(짙은빨강), 3=0xef7d57(주황), 4=0xffcd75(크림노랑)
    const groundFire = scene.add.graphics();
    groundFire.setDepth(DEPTH.TILES + 5);
    groundFire.setPosition(x, y);

    // 화염 영역 그라데이션 효과 (파이어볼 색상과 동일)
    groundFire.fillStyle(0xb13e53, 0.6);  // 외곽: 짙은 빨강
    groundFire.fillCircle(0, 0, radius);
    groundFire.fillStyle(0xef7d57, 0.7);  // 중간: 주황
    groundFire.fillCircle(0, 0, radius * 0.7);
    groundFire.fillStyle(0xffcd75, 0.85); // 중심: 크림/노랑
    groundFire.fillCircle(0, 0, radius * 0.4);

    // 테두리 (짙은 빨강으로 데미지 영역 표시)
    groundFire.lineStyle(4, 0xb13e53, 1);
    groundFire.strokeCircle(0, 0, radius);

    // 바닥 화염 페이드아웃 (오래 지속)
    scene.tweens.add({
      targets: groundFire,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => groundFire.destroy(),
    });

    // === 폭발 이펙트 1: 중심 플래시 ===
    const flash = scene.add.graphics();
    flash.setDepth(DEPTH.EFFECTS + 2);
    flash.setPosition(x, y);
    flash.fillStyle(0xffffff, 1);
    flash.fillCircle(0, 0, radius * 0.3);

    scene.tweens.add({
      targets: flash,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 100,
      onComplete: () => flash.destroy(),
    });

    // === 폭발 이펙트 2: 내부 화염 (파이어볼 주황색) ===
    const innerFire = scene.add.graphics();
    innerFire.setDepth(DEPTH.EFFECTS + 1);
    innerFire.setPosition(x, y);
    innerFire.fillStyle(0xef7d57, 0.9);  // 주황
    innerFire.fillCircle(0, 0, radius * 0.6);

    scene.tweens.add({
      targets: innerFire,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 250,
      onComplete: () => innerFire.destroy(),
    });

    // === 폭발 이펙트 3: 외부 폭발 범위 ===
    const outerBlast = scene.add.graphics();
    outerBlast.setDepth(DEPTH.EFFECTS);
    outerBlast.setPosition(x, y);
    outerBlast.fillStyle(0xb13e53, 0.5);  // 짙은 빨강
    outerBlast.fillCircle(0, 0, radius);
    outerBlast.lineStyle(4, 0xffcd75, 1);  // 크림/노랑 테두리
    outerBlast.strokeCircle(0, 0, radius);

    scene.tweens.add({
      targets: outerBlast,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 300,
      onComplete: () => outerBlast.destroy(),
    });

    // === 폭발 이펙트 4: 펄싱 데미지 링 ===
    for (let i = 0; i < 2; i++) {
      scene.time.delayedCall(i * 150, () => {
        if (!scene || !scene.sys.isActive()) return;

        const damageRing = scene.add.graphics();
        damageRing.setDepth(DEPTH.EFFECTS);
        damageRing.setPosition(x, y);
        damageRing.lineStyle(4, 0xef7d57, 1);  // 주황
        damageRing.strokeCircle(0, 0, radius * 0.5);

        scene.tweens.add({
          targets: damageRing,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 400,
          onComplete: () => damageRing.destroy(),
        });
      });
    }

    // === 폭발 이펙트 5: 화염 파티클들 ===
    const particleCount = 16;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
      const distance = radius * (0.5 + Math.random() * 0.7);
      const particleSize = 6 + Math.random() * 8;

      const particle = scene.add.graphics();
      particle.setDepth(DEPTH.EFFECTS + 1);
      particle.setPosition(x, y);

      // 랜덤 화염 색상 (파이어볼 팔레트)
      const colors = [0xb13e53, 0xef7d57, 0xffcd75];  // 짙은빨강, 주황, 크림노랑
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, particleSize);

      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        scaleX: 0.3,
        scaleY: 0.3,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    // === 폭발 이펙트 6: 연기 효과 ===
    for (let i = 0; i < 5; i++) {
      const smokeAngle = Math.random() * Math.PI * 2;
      const smokeDistance = Math.random() * radius * 0.5;

      const smoke = scene.add.graphics();
      smoke.setDepth(DEPTH.EFFECTS - 1);
      smoke.setPosition(x + Math.cos(smokeAngle) * smokeDistance, y + Math.sin(smokeAngle) * smokeDistance);
      smoke.fillStyle(0x333333, 0.4);
      smoke.fillCircle(0, 0, 15 + Math.random() * 10);

      scene.tweens.add({
        targets: smoke,
        y: smoke.y - 30 - Math.random() * 20,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        onComplete: () => smoke.destroy(),
      });
    }

    // === 범위 내 적에게 데미지 ===
    const enemies = scene.children.getChildren()
      .filter(child => child.getData('isEnemy') && child.active) as Enemy[];

    enemies.forEach(enemy => {
      // 적이 유효한지 확인
      if (!enemy.active || !enemy.scene) return;

      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist <= radius) {
        // 거리에 따른 데미지 감소 (중심부 100%, 가장자리 50%)
        const damageMultiplier = 1 - (dist / radius) * 0.5;
        const finalDamage = Math.floor(this.explosionDamage * damageMultiplier);

        const isDead = enemy.takeDamage(finalDamage);
        if (isDead) {
          scene.events.emit('enemyKilled', enemy);
        }

        // 데미지 받은 적에게 불꽃 이펙트 (파이어볼 색상)
        const hitEffect = scene.add.graphics();
        hitEffect.setDepth(DEPTH.EFFECTS);
        hitEffect.setPosition(enemy.x, enemy.y);
        hitEffect.fillStyle(0xef7d57, 0.9);  // 주황
        hitEffect.fillCircle(0, 0, 8);

        scene.tweens.add({
          targets: hitEffect,
          y: enemy.y - 15,
          alpha: 0,
          duration: 200,
          onComplete: () => hitEffect.destroy(),
        });
      }
    });

    // destroy는 onHitEnemy에서 처리
  }
}
