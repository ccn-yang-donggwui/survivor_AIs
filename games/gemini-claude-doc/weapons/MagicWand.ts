import Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Projectile } from '../entities/Projectile';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class MagicWand extends BaseWeapon {
    private projectiles: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player, 'magic_wand');
        this.cooldown = 1000;
        this.damage = 15;
        
        this.projectiles = scene.physics.add.group({
            classType: Projectile,
            runChildUpdate: true
        });
    }

    protected attack(enemies: Phaser.GameObjects.Group): void {
        const target = this.getRandomEnemy(enemies);
        
        if (!target) return;
        
        let projectile = this.projectiles.getFirstDead(false);
        if (!projectile) {
            projectile = new Projectile(this.scene, 0, 0);
            this.projectiles.add(projectile);
        }
        
        const speed = 300;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(speed);
        
        // Apply player might
        const damage = this.damage * this.player.getStats().might;
        
        projectile.setTint(0x00ffff);
        projectile.fire(this.player.x, this.player.y, velocity, damage, 1500, 1);
    }
    
    private getRandomEnemy(enemies: Phaser.GameObjects.Group): Enemy | null {
        const activeEnemies = enemies.getChildren().filter((go) => go.active) as Enemy[];
        if (activeEnemies.length === 0) return null;
        return Phaser.Utils.Array.GetRandom(activeEnemies);
    }
    
    public getDamageObjects(): Phaser.GameObjects.Group[] {
        return [this.projectiles];
    }

    protected applyLevelEffect(): void {
        if (this.level === 2) this.damage *= 1.2;
        if (this.level === 3) this.cooldown *= 0.9;
    }
}
