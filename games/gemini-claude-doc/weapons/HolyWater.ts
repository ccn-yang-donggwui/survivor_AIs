import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class HolyWater extends BaseWeapon {
    private pools: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player, 'holy_water');
        this.cooldown = 3000;
        this.damage = 8;
        
        this.pools = scene.physics.add.group();
    }

    protected attack(_enemies: Phaser.GameObjects.Group): void {
        const radius = 100 * this.player.getStats().area;
        const duration = 3000 * this.player.getStats().duration;
        
        // Pick random location around player
        const angle = Phaser.Math.Between(0, 360);
        const distance = Phaser.Math.Between(50, 200);
        const x = this.player.x + Math.cos(Phaser.Math.DegToRad(angle)) * distance;
        const y = this.player.y + Math.sin(Phaser.Math.DegToRad(angle)) * distance;
        
        this.createPool(x, y, radius, duration);
    }

    private createPool(x: number, y: number, radius: number, duration: number) {
        const pool = this.scene.add.circle(x, y, radius, 0x0000ff, 0.3);
        this.scene.physics.add.existing(pool);
        (pool.body as Phaser.Physics.Arcade.Body).setCircle(radius);
        
        this.pools.add(pool);
        
        this.scene.time.delayedCall(duration, () => {
            if (pool.active) {
                pool.destroy();
            }
        });
    }

    public handlePoolEnemyCollision(obj1: any, obj2: any) {
        // Identify which is the enemy (has takeDamage)
        let enemy: Enemy | null = null;
        if (typeof obj1.takeDamage === 'function') {
            enemy = obj1 as Enemy;
        } else if (typeof obj2.takeDamage === 'function') {
            enemy = obj2 as Enemy;
        }

        if (!enemy || !enemy.active) return;
        
        const now = this.scene.time.now;
        if (!(enemy as any).lastHolyWaterDamage || now - (enemy as any).lastHolyWaterDamage > 500) {
            enemy.takeDamage(this.damage * this.player.getStats().might);
            (enemy as any).lastHolyWaterDamage = now;
        }
    }

    public getDamageObjects(): Phaser.GameObjects.Group[] {
        return [this.pools];
    }

    protected applyLevelEffect(): void {
        if (this.level === 2) this.damage *= 1.2;
        if (this.level === 3) this.cooldown *= 0.9;
    }
}
