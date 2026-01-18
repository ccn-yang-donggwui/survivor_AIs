import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class WaveSystem {
    private scene: Phaser.Scene;
    private player: Player;
    private spawnTimer: number = 0;
    private enemies: Phaser.GameObjects.Group;
    private onEnemyDie: (enemy: Enemy) => void;
    
    // Wave config (Simple version)
    private spawnInterval: number = 1000; // ms
    
    constructor(scene: Phaser.Scene, player: Player, onEnemyDie: (enemy: Enemy) => void) {
        this.scene = scene;
        this.player = player;
        this.onEnemyDie = onEnemyDie;
        
        this.enemies = this.scene.physics.add.group({
            runChildUpdate: true
        });
    }
    
    update(_time: number, delta: number) {
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }
    
    private spawnEnemy() {
        // Spawn around player just outside camera view
        // 1280x720, so 800-900 radius is safe
        const angle = Phaser.Math.Between(0, 360);
        const distance = Phaser.Math.Between(700, 900);
        const x = this.player.x + Math.cos(Phaser.Math.DegToRad(angle)) * distance;
        const y = this.player.y + Math.sin(Phaser.Math.DegToRad(angle)) * distance;
        
        // Ensure within world bounds (simple clamp)
        // Actually, enemies can spawn outside but should walk in.
        // Let's just create it.
        
        const enemy = new Enemy(this.scene, x, y, 'enemy', this.player, this.onEnemyDie);
        this.enemies.add(enemy);
    }
    
    public getEnemies(): Phaser.GameObjects.Group {
        return this.enemies;
    }
}
