import Phaser from 'phaser';
import { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    protected hp: number;
    protected damage: number;
    protected speed: number;
    protected expValue: number;
    protected player: Player;
    private onDieCallback?: (enemy: Enemy) => void;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, player: Player, onDie?: (enemy: Enemy) => void) {
        super(scene, x, y, texture);
        this.player = player;
        this.onDieCallback = onDie;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.2);
        
        // Default stats (Slime)
        this.hp = 5;
        this.damage = 5;
        this.speed = 50;
        this.expValue = 1;
    }
    
    override update(_time: number, _delta: number) {
        if (!this.active) return;

        this.moveTowardsPlayer();
        
        // Despawn if too far
        if (Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y) > 1500) {
            this.destroy();
        }
    }
    
    protected moveTowardsPlayer() {
        if (!this.player || !this.body) return;
        
        this.scene.physics.moveToObject(this, this.player, this.speed);
    }
    
    public takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        } else {
             // Hit flash
             this.setTint(0xffffff);
             this.scene.time.delayedCall(100, () => {
                 if (!this.active) return;
                 this.clearTint();
             });
        }
    }
    
    public die() {
        if (this.onDieCallback) {
            this.onDieCallback(this);
        }
        this.destroy();
    }

    public getExpValue(): number {
        return this.expValue;
    }
    
    public getDamage(): number {
        return this.damage;
    }
}
