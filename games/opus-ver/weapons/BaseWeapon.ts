import Phaser from 'phaser';
import type { WeaponData } from '../types/DataTypes';
import { Player } from '../entities/Player';
import { WEAPONS } from '../config/Constants';

export abstract class BaseWeapon {
  public id: string;
  public name: string;
  public icon: string;
  public level: number = 1;
  public maxLevel: number;
  public isEvolved: boolean = false;

  protected scene: Phaser.Scene;
  protected data: WeaponData;
  protected currentCooldown: number = 0;

  // 계산된 스탯
  protected damage: number;
  protected cooldown: number;
  protected projectileCount: number;
  protected range: number;
  protected piercing: number;
  protected speed: number;
  protected area: number;
  protected duration: number;
  protected knockback: number;

  constructor(scene: Phaser.Scene, data: WeaponData) {
    this.scene = scene;
    this.data = data;
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.maxLevel = data.maxLevel;

    // 기본 스탯 초기화
    this.damage = data.baseDamage;
    this.cooldown = data.baseCooldown;
    this.projectileCount = data.baseProjectileCount;
    this.range = data.baseRange || 100;
    this.piercing = data.basePiercing || 0;
    this.speed = data.baseSpeed || 300;
    this.area = data.baseArea || 1;
    this.duration = data.baseDuration || 1000;
    this.knockback = data.baseKnockback || 0;
  }

  update(time: number, delta: number, player: Player): void {
    this.currentCooldown -= delta;

    if (this.currentCooldown <= 0) {
      this.attack(player);
      this.currentCooldown = this.getEffectiveCooldown(player);
    }
  }

  protected abstract attack(player: Player): void;

  levelUp(): boolean {
    if (this.level >= this.maxLevel) return false;

    this.level++;
    this.applyLevelUpBonus();
    return true;
  }

  private applyLevelUpBonus(): void {
    const levelData = this.data.levelUp.find(l => l.level === this.level);
    if (!levelData) return;

    if (levelData.damage) this.damage += levelData.damage;
    if (levelData.damagePercent) this.damage *= (1 + levelData.damagePercent / 100);
    if (levelData.cooldown) this.cooldown += levelData.cooldown;
    if (levelData.cooldownPercent) this.cooldown *= (1 - levelData.cooldownPercent / 100);
    if (levelData.projectiles) this.projectileCount += levelData.projectiles;
    if (levelData.range) this.range += levelData.range;
    if (levelData.piercing) this.piercing += levelData.piercing;
    if (levelData.area) this.area += levelData.area;
    if (levelData.duration) this.duration += levelData.duration;
  }

  getEffectiveDamage(player: Player): number {
    return Math.floor(this.damage * player.stats.damage);
  }

  getEffectiveCooldown(player: Player): number {
    return this.cooldown / player.stats.attackSpeed;
  }

  getEffectiveProjectileCount(player: Player): number {
    return this.projectileCount + player.stats.projectileCount;
  }

  getEffectiveArea(player: Player): number {
    return this.area * player.stats.area;
  }

  getEffectiveDuration(player: Player): number {
    return this.duration * player.stats.duration;
  }

  getEffectivePiercing(player: Player): number {
    return this.piercing + player.stats.piercing;
  }

  getDescription(): string {
    return this.data.description;
  }

  getLevelDescription(): string {
    const levelData = this.data.levelUp.find(l => l.level === this.level + 1);
    return levelData?.description || `레벨 ${this.level + 1}로 강화`;
  }

  isMaxLevel(): boolean {
    return this.level >= this.maxLevel;
  }

  canEvolve(): boolean {
    return this.isMaxLevel() && !this.isEvolved && !!this.data.evolutionId;
  }

  getEvolutionId(): string | undefined {
    return this.data.evolutionId;
  }

  // =====================================================
  // 오토타게팅 시스템
  // =====================================================

  // 모든 활성 적 가져오기
  protected getAllEnemies(): Phaser.GameObjects.Sprite[] {
    return this.scene.children.getChildren().filter(
      child => child.getData('isEnemy') && (child as Phaser.GameObjects.Sprite).active
    ) as Phaser.GameObjects.Sprite[];
  }

  // 가장 가까운 적 찾기
  protected findNearestEnemy(player: Player, maxDistance: number = 1000): Phaser.GameObjects.Sprite | null {
    const enemies = this.getAllEnemies();
    let nearest: Phaser.GameObjects.Sprite | null = null;
    let nearestDist = maxDistance;

    enemies.forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  // 가장 가까운 N개 적 찾기
  protected findNearestEnemies(player: Player, count: number, maxDistance: number = 1000): Phaser.GameObjects.Sprite[] {
    const enemies = this.getAllEnemies();

    return enemies
      .map(enemy => ({
        enemy,
        dist: Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y)
      }))
      .filter(e => e.dist < maxDistance)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, count)
      .map(e => e.enemy);
  }

  // 체력이 가장 낮은 적 찾기 (마무리용)
  protected findLowestHealthEnemy(player: Player, maxDistance: number = 800): Phaser.GameObjects.Sprite | null {
    const enemies = this.getAllEnemies();
    let target: Phaser.GameObjects.Sprite | null = null;
    let lowestHp = Infinity;

    enemies.forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      const hp = enemy.getData('currentHp') || enemy.getData('hp') || Infinity;

      if (dist < maxDistance && hp < lowestHp) {
        lowestHp = hp;
        target = enemy;
      }
    });

    return target;
  }

  // 적 밀집 지역 중심 찾기 (폭발 무기용)
  protected findEnemyClusterCenter(player: Player, maxDistance: number = 600): { x: number; y: number } | null {
    const enemies = this.getAllEnemies().filter(enemy => {
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      return dist < maxDistance;
    });

    if (enemies.length === 0) return null;
    if (enemies.length === 1) return { x: enemies[0].x, y: enemies[0].y };

    // 각 적 주변의 적 수를 계산하여 가장 밀집된 지역 찾기
    let bestEnemy: Phaser.GameObjects.Sprite | null = null;
    let maxNearby = 0;
    const clusterRadius = 100;

    enemies.forEach(enemy => {
      const nearbyCount = enemies.filter(other => {
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y);
        return dist < clusterRadius;
      }).length;

      if (nearbyCount > maxNearby) {
        maxNearby = nearbyCount;
        bestEnemy = enemy;
      }
    });

    if (bestEnemy) {
      // 클러스터 중심 계산
      const nearbyEnemies = enemies.filter(other => {
        const dist = Phaser.Math.Distance.Between(bestEnemy!.x, bestEnemy!.y, other.x, other.y);
        return dist < clusterRadius;
      });

      const centerX = nearbyEnemies.reduce((sum, e) => sum + e.x, 0) / nearbyEnemies.length;
      const centerY = nearbyEnemies.reduce((sum, e) => sum + e.y, 0) / nearbyEnemies.length;

      return { x: centerX, y: centerY };
    }

    return null;
  }

  // 랜덤 적 찾기
  protected findRandomEnemy(): Phaser.GameObjects.Sprite | null {
    const enemies = this.getAllEnemies();
    if (enemies.length === 0) return null;
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  // 화면 내 랜덤 적 찾기
  protected findRandomEnemyInView(player: Player): Phaser.GameObjects.Sprite | null {
    const enemies = this.findEnemiesInView(player);
    if (enemies.length === 0) return null;
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  // 화면 내 적들 찾기
  protected findEnemiesInView(player: Player): Phaser.GameObjects.Sprite[] {
    const camera = this.scene.cameras.main;
    const bounds = {
      left: camera.scrollX,
      right: camera.scrollX + camera.width,
      top: camera.scrollY,
      bottom: camera.scrollY + camera.height
    };

    return this.getAllEnemies().filter(sprite => {
      return sprite.x >= bounds.left && sprite.x <= bounds.right &&
        sprite.y >= bounds.top && sprite.y <= bounds.bottom;
    });
  }

  // 이동 예측 위치 계산 (선딜 무기용)
  protected predictTargetPosition(
    player: Player,
    target: Phaser.GameObjects.Sprite,
    projectileSpeed: number
  ): { x: number; y: number } {
    const dist = Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y);
    const travelTime = dist / projectileSpeed;

    // 적의 속도 데이터 가져오기
    const enemyVelX = target.getData('velocityX') || 0;
    const enemyVelY = target.getData('velocityY') || 0;

    // 예측 위치
    const predictedX = target.x + enemyVelX * travelTime;
    const predictedY = target.y + enemyVelY * travelTime;

    return { x: predictedX, y: predictedY };
  }

  // 타겟 방향으로의 각도 계산
  protected getAngleToTarget(player: Player, target: { x: number; y: number }): number {
    return Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
  }

  // 방사형 방향 계산 (8방향 등)
  protected getRadialDirections(count: number): number[] {
    const angles: number[] = [];
    const step = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      angles.push(i * step);
    }

    return angles;
  }

  // 부채꼴 방향 계산
  protected getSpreadDirections(
    baseAngle: number,
    count: number,
    spreadAngle: number = Math.PI / 4
  ): number[] {
    const angles: number[] = [];

    if (count === 1) {
      return [baseAngle];
    }

    const step = spreadAngle / (count - 1);
    const startAngle = baseAngle - spreadAngle / 2;

    for (let i = 0; i < count; i++) {
      angles.push(startAngle + step * i);
    }

    return angles;
  }

  // 자동 타겟 선택 (무기 타입에 따라)
  protected autoSelectTarget(player: Player): { x: number; y: number } | null {
    const targeting = this.data.targeting || 'nearest';

    switch (targeting) {
      case 'nearest': {
        const enemy = this.findNearestEnemy(player);
        return enemy ? { x: enemy.x, y: enemy.y } : null;
      }
      case 'homing': {
        const enemy = this.findRandomEnemyInView(player);
        return enemy ? { x: enemy.x, y: enemy.y } : null;
      }
      case 'cluster': {
        return this.findEnemyClusterCenter(player);
      }
      case 'lowest_hp': {
        const enemy = this.findLowestHealthEnemy(player);
        return enemy ? { x: enemy.x, y: enemy.y } : null;
      }
      case 'random':
      case 'random_screen': {
        const enemy = this.findRandomEnemyInView(player);
        return enemy ? { x: enemy.x, y: enemy.y } : null;
      }
      default:
        return null;
    }
  }
}
