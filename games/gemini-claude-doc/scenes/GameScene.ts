import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { WaveSystem } from '../systems/WaveSystem';
import { Enemy } from '../entities/Enemy';
import { Dagger } from '../weapons/Dagger';
import { MagicWand } from '../weapons/MagicWand';
import { HolyWater } from '../weapons/HolyWater';
import { Projectile } from '../entities/Projectile';
import { ExpGem } from '../entities/ExpGem';
import { DropSystem, DropItem } from '../systems/DropSystem';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private waveSystem!: WaveSystem;
    private expGems!: Phaser.GameObjects.Group;
    private dropSystem!: DropSystem;

    constructor() {
        super('GameScene');
    }

    create() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, 2000, 2000);

        // Add background (grid)
        this.add.grid(1000, 1000, 2000, 2000, 64, 64, 0x333333, 0.2, 0x444444);

        // Add player
        this.player = new Player(this, 1000, 1000);
        
        // Add Exp Gems group
        this.expGems = this.add.group({
            classType: ExpGem,
            runChildUpdate: false
        });

        this.dropSystem = new DropSystem(this);

        // Setup Wave System
        this.waveSystem = new WaveSystem(this, this.player, (enemy) => {
            this.spawnExpGem(enemy.x, enemy.y, enemy.getExpValue());
            this.dropSystem.spawnDrop(enemy.x, enemy.y);
        });

        // Add Weapons
        const dagger = new Dagger(this, this.player);
        this.player.addWeapon(dagger);
        this.registerWeaponCollisions(dagger);
        
        const wand = new MagicWand(this, this.player);
        this.player.addWeapon(wand);
        this.registerWeaponCollisions(wand);

        // Launch UI Scene
        this.scene.launch('UIScene', { player: this.player });

        // Handle Level Up
        this.events.on('player-level-up', () => {
            this.scene.launch('LevelUpScene');
            // We need to pass the selected upgrade back to GameScene
            const levelUpScene = this.scene.get('LevelUpScene');
            levelUpScene.events.once('upgrade-selected', (option: any) => {
                this.handleUpgradeSelection(option);
            });
        });

        // Setup camera
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        this.cameras.main.startFollow(this.player);
        
        // Collision: Player vs Enemy
        this.physics.add.overlap(this.player, this.waveSystem.getEnemies(), this.handlePlayerEnemyCollision, undefined, this);
        
        // Collision: Player vs Exp Gem
        this.physics.add.overlap(this.player, this.expGems, this.handlePlayerExpGemCollision, undefined, this);

        // Collision: Player vs Drop Item
        this.physics.add.overlap(this.player, this.dropSystem.getDropItems(), this.handlePlayerDropCollision, undefined, this);
    }

    private handlePlayerDropCollision(playerGO: any, dropGO: any) {
        const player = playerGO as Player;
        const drop = dropGO as DropItem;
        
        if (drop.getDropType() === 'meat') {
            player.heal(drop.getDropValue());
        }
        
        drop.collect(player);
    }

    private registerWeaponCollisions(weapon: any) {
        const damageObjects = weapon.getDamageObjects();
        damageObjects.forEach((group: Phaser.GameObjects.Group) => {
            if (weapon instanceof HolyWater) {
                this.physics.add.overlap(group, this.waveSystem.getEnemies(), weapon.handlePoolEnemyCollision, undefined, weapon);
            } else {
                this.physics.add.overlap(group, this.waveSystem.getEnemies(), this.handleProjectileEnemyCollision, undefined, this);
            }
        });
    }

    private spawnExpGem(x: number, y: number, value: number) {
        let gem = this.expGems.getFirstDead(false) as ExpGem;
        if (!gem) {
            gem = new ExpGem(this, x, y);
            this.expGems.add(gem);
        }
        gem.spawn(x, y, value);
    }

    private handlePlayerExpGemCollision(playerGO: any, gemGO: any) {
        const player = playerGO as Player;
        const gem = gemGO as ExpGem;
        
        player.gainExperience(gem.collect());
    }

    private handleUpgradeSelection(option: any) {
        console.log('Selected upgrade:', option);
        
        if (option.type === 'passive') {
            if (option.id === 'might') {
                this.player.getStats().might += 0.1;
            } else if (option.id === 'speed') {
                this.player.getStats().moveSpeed += 20;
            } else if (option.id === 'area') {
                this.player.getStats().area += 0.1;
            } else if (option.id === 'cooldown') {
                this.player.getStats().cooldown *= 0.95;
            } else if (option.id === 'magnet') {
                this.player.getStats().magnet += 50;
            }
        } else if (option.type === 'weapon') {
            const existingWeapon = this.player.getWeapons().find(w => w.getId() === option.id);
            if (existingWeapon) {
                existingWeapon.upgrade();
            } else {
                let newWeapon;
                if (option.id === 'holy_water') {
                    newWeapon = new HolyWater(this, this.player);
                } else if (option.id === 'dagger') {
                    newWeapon = new Dagger(this, this.player);
                } else if (option.id === 'magic_wand') {
                    newWeapon = new MagicWand(this, this.player);
                }
                
                if (newWeapon) {
                    this.player.addWeapon(newWeapon);
                    this.registerWeaponCollisions(newWeapon);
                }
            }
        }
    }

    override update(time: number, delta: number) {
        if (this.player) {
            this.player.update(time, delta, this.waveSystem?.getEnemies());
        }
        if (this.waveSystem) {
            this.waveSystem.update(time, delta);
        }

        // Handle Exp Gem Magnetism
        const magnetRange = this.player.getStats().magnet;
        this.expGems.getChildren().forEach((go) => {
            const gem = go as ExpGem;
            if (!gem.active) return;

            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, gem.x, gem.y);
            if (dist < magnetRange) {
                gem.startFollow();
            }
            gem.updateMagnetism(this.player.x, this.player.y);
        });
    }
    
    private handlePlayerEnemyCollision(playerGO: any, enemyGO: any) {
        const player = playerGO as Player;
        const enemy = enemyGO as Enemy;
        
        player.takeDamage(enemy.getDamage());
        
        // Push back enemy slightly
        const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
        enemy.setPosition(enemy.x + Math.cos(angle) * 10, enemy.y + Math.sin(angle) * 10);
    }

    private handleProjectileEnemyCollision(obj1: any, obj2: any) {
        let projectile: Projectile;
        let enemy: Enemy;

        // Determine which is which based on instance or property
        if (obj1 instanceof Projectile) {
            projectile = obj1;
            enemy = obj2 as Enemy;
        } else {
            projectile = obj2 as Projectile;
            enemy = obj1 as Enemy;
        }
        
        if (!projectile || !enemy) return;
        if (!projectile.active || !enemy.active) return;
        
        // Safety check for method existence
        if (typeof enemy.takeDamage === 'function') {
            enemy.takeDamage(projectile.getDamage());
        }
        
        projectile.onHit();
    }
}