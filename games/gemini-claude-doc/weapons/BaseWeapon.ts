import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export abstract class BaseWeapon {
    protected scene: Phaser.Scene;
    protected player: Player;
    
    protected id: string;
    protected level: number = 1;
    protected cooldown: number; // ms
    protected nextAttackTime: number = 0;
    protected damage: number;
    
    constructor(scene: Phaser.Scene, player: Player, id: string) {
        this.scene = scene;
        this.player = player;
        this.id = id;
        this.cooldown = 1000;
        this.damage = 10;
    }

    public upgrade() {
        this.level++;
        this.applyLevelEffect();
    }

    protected abstract applyLevelEffect(): void;

    public update(time: number, _delta: number, enemies: Phaser.GameObjects.Group) {
        if (time >= this.nextAttackTime) {
            this.attack(enemies);
            // Apply cooldown reduction from player stats
            const cd = this.cooldown * this.player.getStats().cooldown;
            this.nextAttackTime = time + cd;
        }
    }
    
    protected abstract attack(enemies: Phaser.GameObjects.Group): void;
    
    protected getClosestEnemy(enemies: Phaser.GameObjects.Group): Enemy | null {
        let closest: Enemy | null = null;
        let minDist = Infinity;
        
        enemies.getChildren().forEach((go) => {
            const enemy = go as Enemy;
            if (!enemy.active) return;
            
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        });
        
        return closest;
    }
    
    public getLevel(): number {
        return this.level;
    }

    public getId(): string {
        return this.id;
    }

    public abstract getDamageObjects(): Phaser.GameObjects.Group[];
}
