import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.setBaseURL('/games/gemini-claude-doc');
        this.load.image('player', 'assets/images/player.svg');
        this.load.image('enemy', 'assets/images/enemy.svg');
        this.load.image('projectile', 'assets/images/projectile.svg');
        this.load.image('exp_gem', 'assets/images/exp_gem.svg');
        this.load.image('meat', 'assets/images/meat.svg');
        this.load.image('gold', 'assets/images/gold.svg');
    }

    create() {
        this.scene.start('GameScene');
    }
}
