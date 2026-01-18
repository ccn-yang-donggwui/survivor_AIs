import Phaser from 'phaser';

export class ExpGem extends Phaser.Physics.Arcade.Sprite {
    private value: number = 0;
    private isFollowing: boolean = false;
    private followSpeed: number = 400;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'exp_gem');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.2);
    }

    spawn(x: number, y: number, value: number) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true);
        this.setVisible(true);
        this.value = value;
        this.isFollowing = false;
        
        if (this.body) {
            this.body.enable = true;
        }
    }

    startFollow() {
        this.isFollowing = true;
    }

    updateMagnetism(playerX: number, playerY: number) {
        if (!this.body) return;

        if (this.isFollowing) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
            this.setVelocity(
                Math.cos(angle) * this.followSpeed,
                Math.sin(angle) * this.followSpeed
            );
        }
    }

    collect(): number {
        this.disableBody(true, true);
        this.setActive(false);
        this.setVisible(false);
        return this.value;
    }
}
