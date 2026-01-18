import Phaser from 'phaser';
import { WORLD_SIZE } from '../config/Constants';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { SoundManager } from '../utils/SoundManager';

type UpgradeOption = {
  id: string;
  label: string;
  apply: () => void;
};

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private gems!: Phaser.Physics.Arcade.Group;
  private readonly enemyTextureKeys = ['enemy-slime', 'enemy-bat', 'enemy-skull'];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private joystick!: VirtualJoystick;
  private elapsedMs = 0;
  private spawnTimer = 0;
  private baseSpawnInterval = 1400;
  private minSpawnInterval = 380;
  private attackCooldown = 720;
  private attackTimer = 0;
  private projectileDamage = 11;
  private projectileSpeed = 430;
  private projectileLifespan = 1000;
  private level = 1;
  private xp = 0;
  private xpToNext = 40;
  private pendingLevelUps = 0;
  private isLeveling = false;
  private isGameOver = false;
  private lastShootSoundTime = 0;
  private lastHitSoundTime = 0;
  private lastPickupSoundTime = 0;
  private gameOverText?: Phaser.GameObjects.Text;
  private gameOverHint?: Phaser.GameObjects.Text;
  private levelUpBackdrop?: Phaser.GameObjects.Rectangle;
  private levelUpPanel?: Phaser.GameObjects.Rectangle;
  private levelUpTitle?: Phaser.GameObjects.Text;
  private levelUpOptions: Phaser.GameObjects.Text[] = [];
  private currentUpgradeOptions: UpgradeOption[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const half = WORLD_SIZE / 2;
    const { width, height } = this.scale;

    this.isGameOver = false;
    this.isLeveling = false;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = this.getXpRequirement(this.level);
    this.pendingLevelUps = 0;
    this.elapsedMs = 0;
    this.spawnTimer = 0;
    this.baseSpawnInterval = 1400;
    this.minSpawnInterval = 380;
    this.attackCooldown = 720;
    this.attackTimer = 0;
    this.projectileDamage = 11;
    this.projectileSpeed = 430;
    this.lastShootSoundTime = 0;
    this.lastHitSoundTime = 0;
    this.lastPickupSoundTime = 0;
    this.clearLevelUpUI();

    this.physics.world.setBounds(-half, -half, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.setBounds(-half, -half, WORLD_SIZE, WORLD_SIZE);

    this.add
      .tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'bg-tile')
      .setOrigin(0.5)
      .setDepth(0);

    this.player = new Player(this, 0, 0);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.gems = this.physics.add.group();

    this.cursors = this.input.keyboard?.createCursorKeys() ?? {
      up: undefined,
      down: undefined,
      left: undefined,
      right: undefined
    };
    this.wasd = this.input.keyboard
      ? (this.input.keyboard.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>)
      : {};

    this.joystick = new VirtualJoystick(this, 120, height - 120, 70);
    this.input.once('pointerdown', () => SoundManager.unlock());
    this.input.keyboard?.once('keydown', () => SoundManager.unlock());

    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, undefined, this);
    this.physics.add.overlap(this.projectiles, this.enemies, this.handleProjectileHit, undefined, this);
    this.physics.add.overlap(this.player, this.gems, this.handleGemPickup, undefined, this);

    for (let i = 0; i < 6; i += 1) {
      this.spawnEnemy(0);
    }

    this.scale.on('resize', this.handleResize, this);
    this.handleResize({ width, height } as Phaser.Structs.Size);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.joystick.destroy();
      this.scale.off('resize', this.handleResize, this);
      this.clearLevelUpUI();
    });
  }

  update(_: number, delta: number): void {
    if (this.isGameOver || this.isLeveling) {
      return;
    }

    const keyboard = this.getKeyboardDirection();
    const direction = keyboard.lengthSq() > 0 ? keyboard : this.joystick.getDirection();

    this.player.move(direction);

    this.elapsedMs += delta;
    this.spawnTimer += delta;
    const difficulty = this.getDifficulty();
    const spawnInterval = this.getSpawnInterval(difficulty);

    while (this.spawnTimer >= spawnInterval) {
      this.spawnTimer -= spawnInterval;
      this.spawnWave(difficulty);
    }

    this.enemies.children.iterate((child) => {
      if (!child) {
        return undefined;
      }
      (child as Enemy).update(this.player);
      return undefined;
    });

    this.attackTimer += delta;
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0;
      this.spawnProjectile();
    }

    this.projectiles.children.iterate((child) => {
      if (!child) {
        return undefined;
      }
      const projectile = child as Phaser.Physics.Arcade.Image;
      const spawnTime = projectile.getData('spawnTime') as number;
      if (this.time.now - spawnTime > this.projectileLifespan) {
        projectile.destroy();
      }
      return undefined;
    });
  }

  public getPlayerHealth(): { current: number; max: number } {
    return {
      current: this.player.getCurrentHP(),
      max: this.player.getMaxHP()
    };
  }

  public getLevelProgress(): { level: number; xp: number; xpToNext: number } {
    return {
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext
    };
  }

  public getElapsedMs(): number {
    return this.elapsedMs;
  }

  private getKeyboardDirection(): Phaser.Math.Vector2 {
    const direction = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.left?.isDown || this.wasd.A?.isDown) {
      direction.x -= 1;
    }
    if (this.cursors.right?.isDown || this.wasd.D?.isDown) {
      direction.x += 1;
    }
    if (this.cursors.up?.isDown || this.wasd.W?.isDown) {
      direction.y -= 1;
    }
    if (this.cursors.down?.isDown || this.wasd.S?.isDown) {
      direction.y += 1;
    }

    return direction;
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const joystickX = Math.max(90, gameSize.width * 0.13);
    const joystickY = Math.max(90, gameSize.height - 110);
    this.joystick.setPosition(joystickX, joystickY);

    if (this.gameOverText && this.gameOverHint) {
      this.gameOverText.setPosition(gameSize.width * 0.5, gameSize.height * 0.45);
      this.gameOverHint.setPosition(gameSize.width * 0.5, gameSize.height * 0.55);
    }

    this.layoutLevelUp(gameSize.width, gameSize.height);
  }

  private getDifficulty(): number {
    const minutes = this.elapsedMs / 60000;
    const timeFactor = Math.min(1, minutes / 10);
    const levelFactor = Math.min(1, (this.level - 1) / 25);
    return Phaser.Math.Clamp(timeFactor * 0.65 + levelFactor * 0.35, 0, 1);
  }

  private getSpawnInterval(difficulty: number): number {
    return Phaser.Math.Linear(this.baseSpawnInterval, this.minSpawnInterval, difficulty);
  }

  private getEnemyScaling(difficulty: number): {
    speed: number;
    hp: number;
    damage: number;
    exp: number;
  } {
    return {
      speed: Phaser.Math.Linear(1, 1.55, difficulty),
      hp: Phaser.Math.Linear(1, 2.8, difficulty),
      damage: Phaser.Math.Linear(1, 1.7, difficulty),
      exp: Phaser.Math.Linear(1, 1.35, difficulty)
    };
  }

  private spawnWave(difficulty: number): void {
    const count = 1 + Math.floor(difficulty * 3);
    for (let i = 0; i < count; i += 1) {
      this.spawnEnemy(difficulty);
    }
  }

  private spawnEnemy(difficulty: number): void {
    if (this.isGameOver || this.isLeveling) {
      return;
    }
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = Phaser.Math.Between(360, 540);
    const half = WORLD_SIZE / 2;

    const spawnX = this.player.x + Math.cos(angle) * distance;
    const spawnY = this.player.y + Math.sin(angle) * distance;

    const clampedX = Phaser.Math.Clamp(spawnX, -half + 20, half - 20);
    const clampedY = Phaser.Math.Clamp(spawnY, -half + 20, half - 20);

    const textureKey = this.pickEnemyTexture();
    const enemy = new Enemy(this, clampedX, clampedY, textureKey);
    const scaling = this.getEnemyScaling(difficulty);
    const variance = Phaser.Math.FloatBetween(0.95, 1.05);
    enemy.applyDifficulty({
      speed: scaling.speed * variance,
      hp: scaling.hp * variance,
      damage: scaling.damage,
      exp: scaling.exp
    });
    this.enemies.add(enemy);
  }

  private pickEnemyTexture(): string {
    const key = this.enemyTextureKeys[Phaser.Math.Between(0, this.enemyTextureKeys.length - 1)];
    if (key && this.textures.exists(key)) {
      return key;
    }
    return 'enemy';
  }

  private handlePlayerHit(
    playerObject: Phaser.GameObjects.GameObject,
    enemyObject: Phaser.GameObjects.GameObject
  ): void {
    const player = playerObject as Player;
    const enemy = enemyObject as Enemy;

    if (!player.takeDamage(enemy.getDamage())) {
      return;
    }

    this.playPlayerHitEffect(player.x, player.y);
    this.playHitSound();

    if (player.isDead()) {
      this.triggerGameOver();
    }
  }

  private spawnProjectile(): void {
    const target = this.getNearestEnemy();
    if (!target) {
      return;
    }

    const projectile = this.physics.add.image(this.player.x, this.player.y, 'projectile');
    projectile.setDepth(2);
    projectile.setCircle(4);
    projectile.setData('damage', this.projectileDamage);
    projectile.setData('spawnTime', this.time.now);
    this.projectiles.add(projectile);

    const direction = new Phaser.Math.Vector2(target.x - this.player.x, target.y - this.player.y);
    if (direction.lengthSq() === 0) {
      direction.set(1, 0);
    } else {
      direction.normalize();
    }

    projectile.setVelocity(direction.x * this.projectileSpeed, direction.y * this.projectileSpeed);
    this.playShootEffect(this.player.x, this.player.y);
    this.playShootSound();
  }

  private getNearestEnemy(): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = Number.MAX_VALUE;

    this.enemies.children.iterate((child) => {
      if (!child) {
        return undefined;
      }
      const enemy = child as Enemy;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance < closestDist) {
        closestDist = distance;
        closest = enemy;
      }
      return undefined;
    });

    return closest;
  }

  private handleProjectileHit(
    projectileObject: Phaser.GameObjects.GameObject,
    enemyObject: Phaser.GameObjects.GameObject
  ): void {
    const projectile = projectileObject as Phaser.Physics.Arcade.Image;
    const enemy = enemyObject as Enemy;

    if (!projectile.active || !enemy.active) {
      return;
    }

    const damage = (projectile.getData('damage') as number) ?? this.projectileDamage;
    projectile.destroy();

    const killed = enemy.takeDamage(damage);
    this.playHitEffect(enemy.x, enemy.y);
    this.playHitSound();

    if (killed) {
      this.playKillEffect(enemy.x, enemy.y);
      this.spawnGem(enemy.x, enemy.y, enemy.getExpValue());
      enemy.destroy();
    }
  }

  private spawnGem(x: number, y: number, value: number): void {
    const gem = this.physics.add.image(x, y, 'exp-gem');
    gem.setDepth(1);
    gem.setData('value', value);
    gem.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(-30, 30));
    gem.setDrag(240, 240);
    gem.setMaxVelocity(60, 60);
    this.gems.add(gem);
  }

  private handleGemPickup(
    _: Phaser.GameObjects.GameObject,
    gemObject: Phaser.GameObjects.GameObject
  ): void {
    const gem = gemObject as Phaser.Physics.Arcade.Image;

    if (!gem.active) {
      return;
    }

    const value = (gem.getData('value') as number) ?? 5;
    this.playPickupEffect(gem.x, gem.y);
    this.playPickupSound();
    gem.destroy();
    this.addExperience(value);
  }

  private addExperience(amount: number): void {
    this.xp += amount;

    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.pendingLevelUps += 1;
      this.xpToNext = this.getXpRequirement(this.level);
    }

    if (this.pendingLevelUps > 0) {
      this.startLevelUp();
    }
  }

  private getXpRequirement(level: number): number {
    const base = 34;
    const growth = 1.28;
    return Math.round(base * Math.pow(growth, level - 1) + level * 3);
  }

  private startLevelUp(): void {
    if (this.isGameOver || this.pendingLevelUps <= 0) {
      return;
    }

    if (!this.isLeveling) {
      this.isLeveling = true;
      this.physics.pause();
    }

    this.pendingLevelUps -= 1;
    this.playLevelUpEffect();
    SoundManager.playLevelUp();
    this.showLevelUpChoices();
  }

  private showLevelUpChoices(): void {
    this.clearLevelUpUI();

    this.currentUpgradeOptions = this.pickUpgrades(3);

    const { width, height } = this.scale;
    this.levelUpBackdrop = this.add
      .rectangle(0, 0, width, height, 0x0b0f16, 0.85)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(25);

    const panelWidth = Math.min(width * 0.75, 560);
    const panelHeight = Math.min(height * 0.6, 360);

    this.levelUpPanel = this.add
      .rectangle(width * 0.5, height * 0.5, panelWidth, panelHeight, 0x111a24, 0.95)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(26);

    this.levelUpTitle = this.add
      .text(width * 0.5, height * 0.34, `LEVEL UP! (Lv ${this.level})`, {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '26px',
        color: '#f4f6fb'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(27);

    const baseColor = '#c7d0e0';
    const hoverColor = '#f4f6fb';
    const startY = height * 0.45;
    const spacing = 54;

    this.levelUpOptions = this.currentUpgradeOptions.map((option, index) => {
      const optionText = this.add
        .text(width * 0.5, startY + index * spacing, option.label, {
          fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
          fontSize: '18px',
          color: baseColor
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(27)
        .setInteractive({ useHandCursor: true });

      optionText.on('pointerover', () => optionText.setColor(hoverColor));
      optionText.on('pointerout', () => optionText.setColor(baseColor));
      optionText.on('pointerdown', () => this.applyUpgrade(option));

      return optionText;
    });

    this.layoutLevelUp(width, height);
  }

  private layoutLevelUp(width: number, height: number): void {
    if (!this.levelUpBackdrop || !this.levelUpPanel || !this.levelUpTitle) {
      return;
    }

    const panelWidth = Math.min(width * 0.75, 560);
    const panelHeight = Math.min(height * 0.6, 360);

    this.levelUpBackdrop.setPosition(0, 0);
    this.levelUpBackdrop.setSize(width, height);
    this.levelUpPanel.setPosition(width * 0.5, height * 0.5);
    this.levelUpPanel.setSize(panelWidth, panelHeight);
    this.levelUpTitle.setPosition(width * 0.5, height * 0.34);

    const startY = height * 0.45;
    const spacing = Math.min(58, panelHeight / 3.2);
    this.levelUpOptions.forEach((optionText, index) => {
      optionText.setPosition(width * 0.5, startY + index * spacing);
    });
  }

  private applyUpgrade(option: UpgradeOption): void {
    option.apply();
    this.attackTimer = Math.min(this.attackTimer, this.attackCooldown);
    this.clearLevelUpUI();

    if (this.pendingLevelUps > 0) {
      this.startLevelUp();
      return;
    }

    this.isLeveling = false;
    this.physics.resume();
  }

  private clearLevelUpUI(): void {
    this.levelUpOptions.forEach((option) => option.destroy());
    this.levelUpOptions = [];
    this.currentUpgradeOptions = [];
    this.levelUpBackdrop?.destroy();
    this.levelUpPanel?.destroy();
    this.levelUpTitle?.destroy();
    this.levelUpBackdrop = undefined;
    this.levelUpPanel = undefined;
    this.levelUpTitle = undefined;
  }

  private pickUpgrades(count: number): UpgradeOption[] {
    const pool = [...this.getUpgradePool()];
    const selections: UpgradeOption[] = [];

    while (selections.length < count && pool.length > 0) {
      const index = Phaser.Math.Between(0, pool.length - 1);
      const [pick] = pool.splice(index, 1);
      selections.push(pick);
    }

    return selections;
  }

  private getUpgradePool(): UpgradeOption[] {
    return [
      {
        id: 'damage',
        label: '공격력 +20%',
        apply: () => {
          this.projectileDamage = Math.round(this.projectileDamage * 1.2);
        }
      },
      {
        id: 'cooldown',
        label: '공격속도 +15%',
        apply: () => {
          this.attackCooldown = Math.max(200, Math.round(this.attackCooldown * 0.85));
        }
      },
      {
        id: 'projectile-speed',
        label: '투사체 속도 +15%',
        apply: () => {
          this.projectileSpeed = Math.round(this.projectileSpeed * 1.15);
        }
      },
      {
        id: 'move-speed',
        label: '이동속도 +10%',
        apply: () => {
          this.player.applySpeedMultiplier(1.1);
        }
      },
      {
        id: 'max-hp',
        label: '최대 HP +20',
        apply: () => {
          this.player.addMaxHP(20);
        }
      },
      {
        id: 'heal',
        label: '즉시 회복 30',
        apply: () => {
          this.player.heal(30);
        }
      }
    ];
  }

  private spawnPulse(
    x: number,
    y: number,
    color: number,
    startRadius: number,
    endRadius: number,
    duration: number,
    alpha: number,
    depth = 8
  ): void {
    const pulse = this.add
      .circle(x, y, startRadius, color, alpha)
      .setDepth(depth)
      .setBlendMode(Phaser.BlendModes.ADD);
    const scale = endRadius / startRadius;
    this.tweens.add({
      targets: pulse,
      scale,
      alpha: 0,
      duration,
      ease: 'Cubic.Out',
      onComplete: () => pulse.destroy()
    });
  }

  private playShootEffect(x: number, y: number): void {
    this.spawnPulse(x, y, 0xfff1a8, 4, 12, 160, 0.8, 6);
  }

  private playHitEffect(x: number, y: number): void {
    this.spawnPulse(x, y, 0xff6b6b, 6, 14, 140, 0.7, 7);
  }

  private playPlayerHitEffect(x: number, y: number): void {
    this.spawnPulse(x, y, 0xff9d9d, 12, 26, 180, 0.55, 8);
  }

  private playKillEffect(x: number, y: number): void {
    this.spawnPulse(x, y, 0x7cffb2, 8, 22, 220, 0.6, 7);
  }

  private playPickupEffect(x: number, y: number): void {
    this.spawnPulse(x, y, 0xbaffd7, 5, 16, 180, 0.6, 6);
  }

  private playLevelUpEffect(): void {
    this.spawnPulse(this.player.x, this.player.y, 0x7cffb2, 14, 54, 420, 0.55, 9);
    this.spawnPulse(this.player.x, this.player.y, 0x7ee3ff, 10, 38, 300, 0.65, 9);
  }

  private playShootSound(): void {
    const now = this.time.now;
    if (now - this.lastShootSoundTime < 90) {
      return;
    }
    this.lastShootSoundTime = now;
    SoundManager.playShoot();
  }

  private playHitSound(): void {
    const now = this.time.now;
    if (now - this.lastHitSoundTime < 80) {
      return;
    }
    this.lastHitSoundTime = now;
    SoundManager.playHit();
  }

  private playPickupSound(): void {
    const now = this.time.now;
    if (now - this.lastPickupSoundTime < 80) {
      return;
    }
    this.lastPickupSoundTime = now;
    SoundManager.playPickup();
  }

  private triggerGameOver(): void {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.isLeveling = false;
    this.pendingLevelUps = 0;
    this.clearLevelUpUI();
    this.physics.pause();

    const { width, height } = this.scale;

    this.gameOverText = this.add
      .text(width * 0.5, height * 0.45, 'GAME OVER', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '42px',
        color: '#f4f6fb'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);

    this.gameOverHint = this.add
      .text(width * 0.5, height * 0.55, 'Press Enter or Tap to Return', {
        fontFamily: '"Trebuchet MS", "Lucida Sans Unicode", Arial, sans-serif',
        fontSize: '18px',
        color: '#c7d0e0'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);

    this.input.keyboard?.once('keydown-ENTER', () => this.returnToMenu());
    this.input.once('pointerdown', () => this.returnToMenu());
  }

  private returnToMenu(): void {
    this.scene.stop('UIScene');
    this.scene.start('MenuScene');
  }
}
