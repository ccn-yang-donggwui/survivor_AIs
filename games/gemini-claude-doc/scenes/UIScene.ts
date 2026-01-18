import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class UIScene extends Phaser.Scene {
    private player!: Player;
    private hpBar!: Phaser.GameObjects.Graphics;
    private expBar!: Phaser.GameObjects.Graphics;
    private levelText!: Phaser.GameObjects.Text;
    private timeText!: Phaser.GameObjects.Text;
    private startTime: number = 0;
    private weaponSlots: Phaser.GameObjects.Graphics[] = [];
    private passiveSlots: Phaser.GameObjects.Graphics[] = [];

    constructor() {
        super('UIScene');
    }

    create(data: { player: Player }) {
        this.player = data.player;
        this.startTime = this.time.now;

        // HUD background/container could go here
        
        // HP Bar
        this.add.text(20, 20, 'HP', { fontSize: '16px', color: '#ffffff' });
        this.hpBar = this.add.graphics();
        
        // Exp Bar
        this.add.text(20, 50, 'EXP', { fontSize: '16px', color: '#ffffff' });
        this.expBar = this.add.graphics();
        
        // Level Text
        this.levelText = this.add.text(20, 80, `Lv. ${this.player.getExpSystem().getLevel()}`, {
            fontSize: '20px',
            color: '#ffffff'
        });

        // Time Text
        this.timeText = this.add.text(this.cameras.main.width / 2, 30, '00:00', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.createSlots();

        // Listen for level up
        this.player.scene.events.on('player-level-up', (level: number) => {
            this.levelText.setText(`Lv. ${level}`);
        });

        // Listen for game over
        this.player.scene.events.on('game-over', () => {
            this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', {
                fontSize: '64px',
                color: '#ff0000',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        });
    }

    private createSlots() {
        const slotSize = 40;
        const spacing = 5;
        
        // Weapon Slots (Top Left)
        for (let i = 0; i < 6; i++) {
            const x = 20 + i * (slotSize + spacing);
            const y = 110;
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0x888888);
            graphics.strokeRect(x, y, slotSize, slotSize);
            this.weaponSlots.push(graphics);
        }

        // Passive Slots (Below weapons)
        for (let i = 0; i < 6; i++) {
            const x = 20 + i * (slotSize + spacing);
            const y = 110 + slotSize + spacing;
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0x888888);
            graphics.strokeRect(x, y, slotSize, slotSize);
            this.passiveSlots.push(graphics);
        }
    }

    update() {
        if (!this.player) return;

        this.drawHPBar();
        this.drawExpBar();
        this.updateTime();
        this.updateSlots();
    }

    private updateSlots() {
        const weapons = this.player.getWeapons();
        weapons.forEach((_weapon, index) => {
            if (index < 6) {
                const graphics = this.weaponSlots[index];
                graphics.fillStyle(0x00ff00, 0.5); // Placeholder color
                const slotSize = 40;
                const x = 20 + index * (slotSize + 5);
                const y = 110;
                graphics.fillRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
            }
        });
    }

    private drawHPBar() {
        this.hpBar.clear();
        const x = 60;
        const y = 20;
        const width = 200;
        const height = 20;

        // Background
        this.hpBar.fillStyle(0x333333);
        this.hpBar.fillRect(x, y, width, height);

        // Fill
        const healthPercent = Math.max(0, this.player.getCurrentHP() / this.player.getStats().maxHP);
        this.hpBar.fillStyle(0xff0000);
        this.hpBar.fillRect(x, y, width * healthPercent, height);
    }

    private drawExpBar() {
        this.expBar.clear();
        const x = 60;
        const y = 50;
        const width = this.cameras.main.width - 100;
        const height = 15;

        // Background
        this.expBar.fillStyle(0x333333);
        this.expBar.fillRect(x, y, width, height);

        // Fill
        const expPercent = this.player.getExpSystem().getProgress();
        this.expBar.fillStyle(0x00ffff);
        this.expBar.fillRect(x, y, width * expPercent, height);
    }

    private updateTime() {
        const elapsed = this.time.now - this.startTime;
        const totalSeconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.timeText.setText(
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
    }
}
