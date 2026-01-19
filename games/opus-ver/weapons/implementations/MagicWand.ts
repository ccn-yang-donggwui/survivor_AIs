import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { Projectile } from '../../entities/Projectile';
import { DEPTH } from '../../config/Constants';

export class MagicWand extends BaseWeapon {
  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    if (!this.scene) return;

    const scene = this.scene;
    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const speed = this.speed;
    const piercing = this.getEffectivePiercing(player);
    const knockback = this.knockback;
    const weaponId = this.id;

    // 레벨에 따라 분열 개수 증가 (레벨 1: 2개, 레벨 2: 2개, 레벨 3: 3개, 레벨 4: 3개, 레벨 5: 4개)
    const splitCount = Math.min(4, Math.floor((this.level + 1) / 2) + 1);

    // 발사할 대상 적들을 미리 선택
    const targets = this.findNearestEnemies(player, count, 800);

    // 동시에 여러 투사체 발사 (spread 방식)
    const spreadAngle = 0.3;

    for (let i = 0; i < count; i++) {
      const target = targets[i] || null;

      let baseAngle: number;
      if (target) {
        baseAngle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
      } else {
        baseAngle = Math.atan2(player.lastDirection.y, player.lastDirection.x);
      }

      const angleOffset = count > 1 ? (i - (count - 1) / 2) * spreadAngle : 0;
      const finalAngle = baseAngle + angleOffset;

      const projectile = new SplitMagicProjectile(
        scene,
        player.x,
        player.y,
        'projectile_magic',
        {
          damage,
          speed,
          piercing,
          duration: 3000,
          area,
          knockback,
        },
        weaponId,
        target,
        splitCount,
        finalAngle
      );

      projectile.setData('weaponId', weaponId);

      const projectiles = scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
      if (projectiles) {
        projectiles.add(projectile);
      }
    }
  }
}

// 분열하는 마법 투사체
class SplitMagicProjectile extends Projectile {
  private homingTarget: Phaser.GameObjects.Sprite | null;
  private homingStrength: number = 0.1;
  private currentAngle: number;
  private splitCount: number;
  private projectileSpeed: number;
  private hasSplit: boolean = false;
  private projectileDamage: number;
  private projectileArea: number;
  private projectileKnockback: number;
  private weaponIdStr: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: any,
    weaponId: string,
    target: Phaser.GameObjects.Sprite | null,
    splitCount: number,
    initialAngle: number
  ) {
    super(scene, x, y, texture, config, weaponId);
    this.homingTarget = target;
    this.splitCount = splitCount;
    this.projectileSpeed = config.speed;
    this.currentAngle = initialAngle;
    this.projectileDamage = config.damage;
    this.projectileArea = config.area;
    this.projectileKnockback = config.knockback;
    this.weaponIdStr = weaponId;

    // 밝은 라벤더 색상 적용
    this.setTint(0xd4a5ff);

    this.setVelocityFromAngle(this.currentAngle, config.speed);
  }

  override update(time: number, delta: number): void {
    if (!this.active || !this.body) return;
    super.update(time, delta);

    // 타겟이 유효하면 부드럽게 추적
    if (this.homingTarget && this.homingTarget.active && this.body) {
      const targetAngle = Phaser.Math.Angle.Between(
        this.x, this.y, this.homingTarget.x, this.homingTarget.y
      );

      let angleDiff = targetAngle - this.currentAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      this.currentAngle += angleDiff * this.homingStrength;

      this.setVelocity(
        Math.cos(this.currentAngle) * this.projectileSpeed,
        Math.sin(this.currentAngle) * this.projectileSpeed
      );

      this.setRotation(this.currentAngle);
    }
  }

  override onHitEnemy(enemyId: number): boolean {
    if (this.hitEnemies.has(enemyId)) {
      return false;
    }

    // 분열을 먼저 처리! (destroy 전에)
    if (!this.hasSplit && this.splitCount > 0 && this.scene) {
      this.split();
    }

    this.hitEnemies.add(enemyId);
    this.piercing--;

    if (this.piercing < 0) {
      this.destroy();
    }

    return true;
  }

  private split(): void {
    if (this.hasSplit || !this.scene) return;
    this.hasSplit = true;

    const scene = this.scene;
    const x = this.x;
    const y = this.y;

    // 분열 이펙트
    this.createSplitEffect(x, y);

    // 근처 적들 탐색
    const nearbyEnemies = scene.children.getChildren()
      .filter(child => {
        if (!child.getData('isEnemy')) return false;
        const sprite = child as Phaser.GameObjects.Sprite;
        if (!sprite.active) return false;
        const dist = Phaser.Math.Distance.Between(x, y, sprite.x, sprite.y);
        return dist < 350 && dist > 20;
      })
      .sort((a, b) => {
        const distA = Phaser.Math.Distance.Between(x, y, (a as Phaser.GameObjects.Sprite).x, (a as Phaser.GameObjects.Sprite).y);
        const distB = Phaser.Math.Distance.Between(x, y, (b as Phaser.GameObjects.Sprite).x, (b as Phaser.GameObjects.Sprite).y);
        return distA - distB;
      }) as Phaser.GameObjects.Sprite[];

    const projectiles = scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
    const angleStep = (Math.PI * 2) / this.splitCount;

    for (let i = 0; i < this.splitCount; i++) {
      const targetEnemy = nearbyEnemies.length > 0
        ? nearbyEnemies[i % nearbyEnemies.length]
        : null;

      let angle: number;
      if (targetEnemy) {
        angle = Phaser.Math.Angle.Between(x, y, targetEnemy.x, targetEnemy.y);
      } else {
        angle = angleStep * i;
      }

      scene.time.delayedCall(i * 30, () => {
        if (!scene || !scene.sys.isActive()) return;

        const splitProjectile = new SplitChildProjectile(
          scene,
          x,
          y,
          'projectile_magic',
          {
            damage: Math.floor(this.projectileDamage * 0.7),
            speed: this.projectileSpeed * 1.3,
            piercing: 0,
            duration: 2000,
            area: this.projectileArea * 0.8,
            knockback: this.projectileKnockback,
          },
          this.weaponIdStr,
          targetEnemy,
          angle
        );

        splitProjectile.setData('weaponId', this.weaponIdStr);
        splitProjectile.setScale(0.7);

        if (projectiles) {
          projectiles.add(splitProjectile);
        }
      });
    }
  }

  private createSplitEffect(x: number, y: number): void {
    if (!this.scene) return;

    // 빛나는 원
    const flash = this.scene.add.graphics();
    flash.setDepth(DEPTH.EFFECTS + 1);
    flash.setPosition(x, y);
    flash.fillStyle(0xffffff, 1);
    flash.fillCircle(0, 0, 10);

    this.scene.tweens.add({
      targets: flash,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy(),
    });

    // 마법 링 (밝은 라벤더)
    const ring = this.scene.add.graphics();
    ring.setDepth(DEPTH.EFFECTS);
    ring.setPosition(x, y);
    ring.lineStyle(3, 0xd4a5ff, 1);
    ring.strokeCircle(0, 0, 15);

    this.scene.tweens.add({
      targets: ring,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 250,
      onComplete: () => ring.destroy(),
    });

    // 파티클 (밝은 라벤더로 통일)
    for (let i = 0; i < this.splitCount; i++) {
      const particleAngle = (Math.PI * 2 / this.splitCount) * i;
      const particle = this.scene.add.graphics();
      particle.setDepth(DEPTH.EFFECTS);
      particle.setPosition(x, y);
      particle.fillStyle(0xd4a5ff, 1);
      particle.fillCircle(0, 0, 5);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(particleAngle) * 40,
        y: y + Math.sin(particleAngle) * 40,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 300,
        onComplete: () => particle.destroy(),
      });
    }
  }
}

// 분열된 자식 투사체 - 별 모양 마법 탄환
class SplitChildProjectile extends Projectile {
  private homingTarget: Phaser.GameObjects.Sprite | null;
  private homingStrength: number = 0.08;
  private currentAngle: number;
  private projectileSpeed: number;
  private spinSpeed: number = 8; // 회전 속도
  private trail: Phaser.GameObjects.Graphics | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: any,
    weaponId: string,
    target: Phaser.GameObjects.Sprite | null,
    initialAngle: number
  ) {
    super(scene, x, y, texture, config, weaponId);
    this.homingTarget = target;
    this.projectileSpeed = config.speed;
    this.currentAngle = initialAngle;

    this.setVelocityFromAngle(this.currentAngle, config.speed);

    // 밝은 라벤더/보라색 tint (exp 아이템과 구별, 마법스러운 느낌)
    this.setTint(0xd4a5ff);

    // 트레일 이펙트 생성
    this.trail = scene.add.graphics();
    this.trail.setDepth(DEPTH.PROJECTILES - 1);
  }

  override update(time: number, delta: number): void {
    if (!this.active || !this.body) return;
    super.update(time, delta);

    // 회전 애니메이션 (별처럼 반짝이는 효과)
    this.rotation += this.spinSpeed * (delta / 1000) * Math.PI;

    // 트레일 이펙트 업데이트
    if (this.trail && this.scene) {
      this.trail.clear();
      this.trail.fillStyle(0xd4a5ff, 0.4);
      this.trail.fillCircle(this.x, this.y, 6);
    }

    if (this.homingTarget && this.homingTarget.active && this.body) {
      const targetAngle = Phaser.Math.Angle.Between(
        this.x, this.y, this.homingTarget.x, this.homingTarget.y
      );

      let angleDiff = targetAngle - this.currentAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      this.currentAngle += angleDiff * this.homingStrength;

      this.setVelocity(
        Math.cos(this.currentAngle) * this.projectileSpeed,
        Math.sin(this.currentAngle) * this.projectileSpeed
      );
    }
  }

  override destroy(fromScene?: boolean): void {
    if (this.trail) {
      this.trail.destroy();
      this.trail = null;
    }
    super.destroy(fromScene);
  }
}
