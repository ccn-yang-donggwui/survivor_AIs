import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    private damage: number = 0;
    // private duration: number = 0; // Removed unused
    private pierce: number = 0;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'projectile');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.2);
    }
    
    fire(x: number, y: number, velocity: Phaser.Math.Vector2, damage: number, _duration: number, pierce: number = 1) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true);
        this.setVisible(true);
        
        this.damage = damage;
        // this.duration = duration;
        this.pierce = pierce;
        
        this.setVelocity(velocity.x, velocity.y);
    }
    
    update(_time: number, _delta: number) {
        if (!this.active) return;
        
        // Check if out of camera bounds (with some padding)
        const camera = this.scene.cameras.main;
        const padding = 100;
        
        if (this.x < camera.scrollX - padding || 
            this.x > camera.scrollX + camera.width + padding || 
            this.y < camera.scrollY - padding || 
            this.y > camera.scrollY + camera.height + padding) {
            this.disable();
        }
    }
    
    disable() {
        this.disableBody(true, true);
        this.setActive(false);
        this.setVisible(false);
    }
    
    public getDamage(): number {
        return this.damage;
    }
    
    public onHit() {
        this.pierce--;
        if (this.pierce <= 0) {
            this.disable();
        }
    }
}
