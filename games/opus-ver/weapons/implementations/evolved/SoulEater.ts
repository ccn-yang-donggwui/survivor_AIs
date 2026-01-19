// Soul Eater - 활 + 촛대 진화 (영혼 흡수)

import Phaser from 'phaser';
import { BaseWeapon } from '../../BaseWeapon';
import type { WeaponData } from '../../../types/DataTypes';
import { Player } from '../../../entities/Player';
import { Projectile } from '../../../entities/Projectile';
import { DEPTH } from '../../../config/Constants';
import { Enemy } from '../../../entities/Enemy';

export class SoulEater extends BaseWeapon {
  private player!: Player;

  constructor(scene: Phaser.Scene, data: WeaponData) {
    super(scene, data);
  }

  protected attack(player: Player): void {
    this.player = player;
    const count = this.getEffectiveProjectileCount(player);
    const damage = this.getEffectiveDamage(player) * 2; // 2배 데미지

    const target = this.findNearestEnemy(player);
    let baseAngle: number;

    if (target) {
      baseAngle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    } else {
      baseAngle = Math.atan2(player.lastDirection.y, player.lastDirection.x);
    }

    const spread = 0.15;

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spread;
      const angle = baseAngle + angleOffset;

      const projectile = new SoulEaterProjectile(
        this.scene,
        player.x,
        player.y,
        'projectile_arrow',
        {
          damage,
          speed: this.speed * 1.5,
          piercing: 999, // 무한 관통
          duration: this.duration * 2,
          area: 1,
          knockback: 0,
        },
        this.id,
        player
      );

      projectile.setData('weaponId', this.id);

      const projectiles = this.scene.data.get('projectiles') as Phaser.Physics.Arcade.Group;
      if (projectiles) {
        projectiles.add(projectile);
      }

      // 그룹 추가 후 velocity 설정
      projectile.setVelocityFromAngle(angle, this.speed * 1.5);
    }
  }
}

// 영혼 흡수 투사체
class SoulEaterProjectile extends Projectile {
  private ownerPlayer: Player;
  private lifestealPercent: number = 0.1; // 10% lifesteal
  private projectileDamage: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: any,
    weaponId: string,
    player: Player
  ) {
    super(scene, x, y, texture, config, weaponId);
    this.ownerPlayer = player;
    this.projectileDamage = config.damage;

    // 어두운 보라색 색조
    this.setTint(0x5d275d);
  }

  override onHitEnemy(enemyId: number): boolean {
    const canHit = super.onHitEnemy(enemyId);

    if (canHit) {
      // 플레이어 체력 회복 (10% lifesteal)
      const healAmount = this.projectileDamage * this.lifestealPercent;
      this.ownerPlayer.heal(healAmount);

      // 영혼 흡수 이펙트
      this.createSoulEffect();
    }

    return canHit;
  }

  private createSoulEffect(): void {
    // 영혼 파티클
    const soul = this.scene.add.graphics();
    soul.setDepth(DEPTH.EFFECTS);
    soul.fillStyle(0xa7f070, 0.8);
    soul.fillCircle(this.x, this.y, 6);

    // 플레이어 방향으로 이동
    this.scene.tweens.add({
      targets: soul,
      x: this.ownerPlayer.x,
      y: this.ownerPlayer.y,
      alpha: 0,
      scale: 0.3,
      duration: 300,
      ease: 'Power2',
      onComplete: () => soul.destroy(),
    });
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);

    // 트레일 이펙트
    if (Math.random() < 0.3) {
      const trail = this.scene.add.graphics();
      trail.setDepth(DEPTH.EFFECTS - 1);
      trail.fillStyle(0x5d275d, 0.4);
      trail.fillCircle(this.x, this.y, 3);

      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 150,
        onComplete: () => trail.destroy(),
      });
    }
  }
}
