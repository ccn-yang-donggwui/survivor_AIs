import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class DropItem extends Phaser.Physics.Arcade.Sprite {
    private dropType: string = '';
    private dropValue: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'meat'); // Default texture
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.2);
    }

    spawn(x: number, y: number, type: string, value: number) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true);
        this.setVisible(true);
        this.dropType = type;
        this.dropValue = value;
        
        // Set texture based on type
        if (type === 'meat') {
            this.setTexture('meat');
            this.clearTint();
        } else if (type === 'gold') {
            this.setTexture('gold');
            this.clearTint();
        }
    }

    collect(_player: Player) {
        // Implementation handled by GameScene collision for now
        this.disableBody(true, true);
        this.setActive(false);
        this.setVisible(false);
    }

    getDropType() { return this.dropType; }
    getDropValue() { return this.dropValue; }
}

export class DropSystem {
    private scene: Phaser.Scene;
    private dropItems: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.dropItems = scene.add.group({
            classType: DropItem,
            runChildUpdate: true
        });
    }

    public spawnDrop(x: number, y: number) {
        const rand = Math.random();
        if (rand < 0.1) { // 10% chance for meat
            this.createDrop(x, y, 'meat', 20);
        } else if (rand < 0.3) { // 20% chance for gold
            this.createDrop(x, y, 'gold', 1);
        }
    }

    private createDrop(x: number, y: number, type: string, value: number) {
        let item = this.dropItems.getFirstDead(false) as DropItem;
        if (!item) {
            item = new DropItem(this.scene, x, y);
            this.dropItems.add(item);
        }
        item.spawn(x, y, type, value);
    }

    public getDropItems() {
        return this.dropItems;
    }
}