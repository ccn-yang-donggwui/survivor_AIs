import Phaser from 'phaser';
import { BaseWeapon } from '../BaseWeapon';
import type { WeaponData } from '../../types/DataTypes';
import { Player } from '../../entities/Player';
import { Projectile } from '../../entities/Projectile';

export class Bible extends BaseWeapon {
  private orbitProjectiles: Projectile[] = [];
  private lastSpawnTime: number = 0;

  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  override update(time: number, delta: number, player: Player): void {
    if (!this.scene) return;

    const count = this.getEffectiveProjectileCount(player);
    const duration = this.getEffectiveDuration(player);

    // 활성 궤도 투사체 업데이트 및 제거
    this.orbitProjectiles = this.orbitProjectiles.filter(p => p.active);

    // 새 투사체 스폰 체크
    if (time - this.lastSpawnTime > duration) {
      // 기존 것들 제거
      this.orbitProjectiles.forEach(p => p.destroy());
      this.orbitProjectiles = [];

      // 새로 생성
      this.spawnOrbitProjectiles(player, count);
      this.lastSpawnTime = time;
    }

    // 궤도 투사체 위치 업데이트
    this.orbitProjectiles.forEach(p => p.update(time, delta));
  }

  protected attack(player: Player): void {
    // Bible은 궤도 방식이라 별도 attack 없음
  }

  private spawnOrbitProjectiles(player: Player, count: number): void {
    if (!this.scene) return;

    const damage = this.getEffectiveDamage(player);
    const area = this.getEffectiveArea(player);
    const duration = this.getEffectiveDuration(player);
    const radius = 80 * area;

    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const startAngle = i * angleStep;

      const projectile = new Projectile(
        this.scene,
        player.x + Math.cos(startAngle) * radius,
        player.y + Math.sin(startAngle) * radius,
        'weapon_bible',
        {
          damage,
          speed: 0,
          piercing: 999, // 무한 관통
          duration: duration,
          area,
          knockback: 5,
        },
        this.id
      );

      projectile.setOrbit(player, radius, startAngle, 0.003);
      projectile.setData('weaponId', this.id);

      const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
      if (projectiles) {
        projectiles.add(projectile);
      }

      this.orbitProjectiles.push(projectile);
    }
  }
}
