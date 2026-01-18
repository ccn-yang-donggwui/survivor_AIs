import Phaser from 'phaser';
import { UpgradeOption, UPGRADE_OPTIONS } from '../data/UpgradeData';

export class LevelUpScene extends Phaser.Scene {
    constructor() {
        super('LevelUpScene');
    }

    create() {
        // Pause the game scene
        this.scene.pause('GameScene');

        const { width, height } = this.cameras.main;

        // Dim background
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);

        this.add.text(width / 2, 100, 'LEVEL UP!', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get 3 random options
        const options = Phaser.Utils.Array.Shuffle([...UPGRADE_OPTIONS]).slice(0, 3);

        options.forEach((option, index) => {
            this.createUpgradeCard(option, index, width, height);
        });
    }

    private createUpgradeCard(option: UpgradeOption, index: number, width: number, height: number) {
        const cardWidth = 300;
        const cardHeight = 400;
        const spacing = 50;
        const totalWidth = (cardWidth * 3) + (spacing * 2);
        const startX = (width - totalWidth) / 2 + cardWidth / 2;
        const x = startX + (cardWidth + spacing) * index;
        const y = height / 2;

        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x444444);
        bg.setStrokeStyle(4, 0xffffff);
        bg.setInteractive({ useHandCursor: true });

        const nameText = this.add.text(0, -150, option.name, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const descText = this.add.text(0, 0, option.description, {
            fontSize: '18px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: cardWidth - 40 }
        }).setOrigin(0.5);

        container.add([bg, nameText, descText]);

        bg.on('pointerover', () => bg.setFillStyle(0x666666));
        bg.on('pointerout', () => bg.setFillStyle(0x444444));
        bg.on('pointerdown', () => this.selectUpgrade(option));
    }

    private selectUpgrade(option: UpgradeOption) {
        // Apply upgrade to player
        this.events.emit('upgrade-selected', option);
        
        // Resume game
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
