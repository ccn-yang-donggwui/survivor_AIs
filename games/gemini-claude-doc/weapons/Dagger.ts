import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Projectile } from '../entities/Projectile';
import { Player } from '../entities/Player';

export class Dagger extends BaseWeapon {
    private projectiles: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player, 'dagger');
        this.cooldown = 500;
        this.damage = 10;
        
        this.projectiles = scene.physics.add.group({
            classType: Projectile,
            runChildUpdate: true
        });
    }

    protected attack(enemies: Phaser.GameObjects.Group): void {
        const target = this.getClosestEnemy(enemies);
        
        // Even if no target, we might want to fire in facing direction (not implemented yet), 
        // or just return for now.
        if (!target) return;
        
        // Get projectile from pool
        let projectile = this.projectiles.getFirstDead(false);
        if (!projectile) {
            projectile = new Projectile(this.scene, 0, 0);
            this.projectiles.add(projectile);
        }
        
        const speed = 400;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(speed);
        
        // Apply player might
        const damage = this.damage * this.player.getStats().might;
        
        projectile.fire(this.player.x, this.player.y, velocity, damage, 1000, 1);
    }
    
    public getDamageObjects(): Phaser.GameObjects.Group[] {
        return [this.projectiles];
    }

    protected applyLevelEffect(): void {
        // Example: Lv.2: Damage +20%, Lv.3: Cooldown -10%
        if (this.level === 2) this.damage *= 1.2;
        if (this.level === 3) this.cooldown *= 0.9;
    }
}
