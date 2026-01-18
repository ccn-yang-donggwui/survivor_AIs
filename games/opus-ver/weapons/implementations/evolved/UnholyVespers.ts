// Unholy Vespers - 성경 + 주술서 진화 (악마의 힘을 받은 성경)

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { Projectile } from '../../../entities/Projectile';
import { DEPTH } from '../../../config/Constants';

export class UnholyVespers extends BaseWeapon {
  private orbitProjectiles: Projectile[] = [];
  private lastSpawnTime: number = 0;
  private darkAura: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  update(time: number, delta: number, player: Player): void {
    const count = this.getEffectiveProjectileCount(player) * 2; // 2배 투사체
    const duration = this.getEffectiveDuration(player) * 1.5;

    // 어두운 오라 효과
    this.updateDarkAura(player, time);

    // 활성 궤도 투사체 업데이트 및 제거
    this.orbitProjectiles = this.orbitProjectiles.filter(p => p.active);

    // 새 투사체 스폰 체크
    if (time - this.lastSpawnTime > duration) {
      this.orbitProjectiles.forEach(p => p.destroy());
      this.orbitProjectiles = [];

      this.spawnUnholyProjectiles(player, count);
      this.lastSpawnTime = time;
    }

    // 궤도 투사체 위치 업데이트
    this.orbitProjectiles.forEach(p => p.update(time, delta));
  }

  private updateDarkAura(player: Player, time: number): void {
    const area = this.getEffectiveArea(player);
    const radius = 100 * area;

    if (!this.darkAura) {
      this.darkAura = this.scene.add.graphics();
      this.darkAura.setDepth(DEPTH.EFFECTS - 3);
    }

    this.darkAura.clear();
    this.darkAura.setPosition(player.x, player.y);

    // 어두운 오라
    const pulse = 1 + Math.sin(time * 0.004) * 0.1;
    this.darkAura.fillStyle(0x5d275d, 0.2);
    this.darkAura.fillCircle(0, 0, radius * pulse);

    // 악마적인 링
    this.darkAura.lineStyle(2, 0xb13e53, 0.4);
    this.darkAura.strokeCircle(0, 0, radius * 0.8);
    this.darkAura.strokeCircle(0, 0, radius * 0.5);
  }

  private spawnUnholyProjectiles(player: Player, count: number): void {
    const damage = this.getEffectiveDamage(player) * 2; // 2배 데미지
    const area = this.getEffectiveArea(player);
    const duration = this.getEffectiveDuration(player) * 1.5;
    const radius = 100 * area;

    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const startAngle = i * angleStep;

      const projectile = new UnholyProjectile(
        this.scene,
        player.x + Math.cos(startAngle) * radius,
        player.y + Math.sin(startAngle) * radius,
        'weapon_bible',
        {
          damage,
          speed: 0,
          piercing: 999,
          duration,
          area: area * 1.5,
          knockback: 10,
        },
        this.id
      );

      projectile.setOrbit(player, radius, startAngle, 0.005); // 더 빠른 회전
      projectile.setData('weaponId', this.id);

      const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
      if (projectiles) {
        projectiles.add(projectile);
      }

      this.orbitProjectiles.push(projectile);
    }
  }

  protected attack(player: Player): void {
    // Unholy Vespers는 궤도 방식
  }

  destroy(): void {
    if (this.darkAura) {
      this.darkAura.destroy();
      this.darkAura = null;
    }
    this.orbitProjectiles.forEach(p => p.destroy());
    this.orbitProjectiles = [];
  }
}

// 악마의 성경 투사체
class UnholyProjectile extends Projectile {
  private trailTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: any,
    weaponId: string
  ) {
    super(scene, x, y, texture, config, weaponId);

    // 붉은 어두운 색조
    this.setTint(0xb13e53);
    this.setScale(1.5);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    // 트레일 이펙트
    this.trailTimer += delta;
    if (this.trailTimer > 80) {
      this.trailTimer = 0;
      this.createTrail();
    }
  }

  private createTrail(): void {
    const trail = this.scene.add.graphics();
    trail.setDepth(DEPTH.EFFECTS - 1);
    trail.fillStyle(0xb13e53, 0.5);
    trail.fillCircle(this.x, this.y, 6);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.3,
      duration: 200,
      onComplete: () => trail.destroy(),
    });
  }
}
