import Phaser from 'phaser';
import { PlayerStats } from '../types/EntityTypes';
import { BaseWeapon } from '../weapons/BaseWeapon';
import { ExperienceSystem } from '../systems/ExperienceSystem';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private stats: PlayerStats;
    private currentHP: number;
    private weapons: BaseWeapon[] = [];
    private isInvincible: boolean = false;
    private invincibilityDuration: number = 500; // ms
    private expSystem: ExperienceSystem;
    
    // Input keys
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.2);
        
        this.setCollideWorldBounds(true);
        
        // Default stats (Character 1: Swordsman)
        this.stats = {
            maxHP: 100,
            hpRecovery: 0.1,
            moveSpeed: 200, 
            might: 1.1, // +10% Might
            cooldown: 1,
            area: 1,
            duration: 1,
            amount: 0,
            growth: 1,
            magnet: 50,
            luck: 1
        };
        
        this.currentHP = this.stats.maxHP;
        this.expSystem = new ExperienceSystem();
        
        this.initInput();
    }

    private initInput() {
        if (this.scene.input.keyboard) {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
            this.wasd = this.scene.input.keyboard.addKeys('W,A,S,D') as any;
        }
    }

    update(time: number, delta: number, enemies?: Phaser.GameObjects.Group) {
        this.handleMovement();
        
        if (enemies) {
            this.weapons.forEach(weapon => weapon.update(time, delta, enemies));
        }
    }

    public addWeapon(weapon: BaseWeapon) {
        this.weapons.push(weapon);
    }
    
    public getWeapons(): BaseWeapon[] {
        return this.weapons;
    }

    private handleMovement() {
        if (!this.cursors || !this.wasd) return;

        const speed = this.stats.moveSpeed;
        this.setVelocity(0);

        let velocityX = 0;
        let velocityY = 0;

        // Horizontal
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = speed;
        }

        // Vertical
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = speed;
        }
        
        // Normalize
        if (velocityX !== 0 || velocityY !== 0) {
             const vec = new Phaser.Math.Vector2(velocityX, velocityY).normalize().scale(speed);
             this.setVelocity(vec.x, vec.y);
        }
    }

    public gainExperience(amount: number) {
        const leveledUp = this.expSystem.addExperience(amount * this.stats.growth);
        if (leveledUp) {
            this.handleLevelUp();
        }
    }

    private handleLevelUp() {
        console.log(`Level Up! Current Level: ${this.expSystem.getLevel()}`);
        this.scene.events.emit('player-level-up', this.expSystem.getLevel());
    }

    public getExpSystem(): ExperienceSystem {
        return this.expSystem;
    }

    public heal(amount: number) {
        this.currentHP = Math.min(this.stats.maxHP, this.currentHP + amount);
    }

    public getStats(): PlayerStats {
        return this.stats;
    }

    public getCurrentHP(): number {
        return this.currentHP;
    }
    
    public takeDamage(amount: number) {
        if (this.isInvincible) return;

        this.currentHP -= amount;
        this.setTint(0xff0000);
        
        this.isInvincible = true;
        this.scene.time.delayedCall(this.invincibilityDuration, () => {
            if (!this.active) return;
            this.isInvincible = false;
            this.clearTint();
        });

        if (this.currentHP <= 0) {
            console.log('Game Over');
            this.setVelocity(0);
            this.scene.events.emit('game-over');
        }
    }
}