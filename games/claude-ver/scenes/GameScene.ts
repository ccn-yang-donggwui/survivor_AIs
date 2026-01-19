import Phaser from 'phaser';
import { WORLD, DEPTH, ENEMY, EXP } from '../config/Constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { ExpGem } from '../entities/ExpGem';
import { Projectile } from '../entities/Projectile';
import { Boss } from '../entities/Boss';
import { DropItem } from '../entities/DropItem';
import type { GameState } from '../types/GameTypes';

export class GameScene extends Phaser.Scene {
  public player!: Player;
  public enemies!: Phaser.Physics.Arcade.Group;
  public projectiles!: Phaser.Physics.Arcade.Group;
  public expGems!: Phaser.Physics.Arcade.Group;
  public dropItems!: Phaser.Physics.Arcade.Group;
  public boss: Boss | null = null;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  public gameState: GameState = {
    isPlaying: true,
    isPaused: false,
    currentTime: 0,
    level: 1,
    exp: 0,
    expToNextLevel: EXP.BASE_TO_LEVEL,
    kills: 0,
    gold: 0
  };

  private spawnTimer = 0;
  private spawnInterval = 2000;
  private difficultyTimer = 0;
  private bossSpawned = false;
  private dropSpawnTimer = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.createWorld();
    this.createPlayer();
    this.createGroups();
    this.setupInput();
    this.setupCollisions();
    this.setupCamera();

    // UI 씬 시작
    this.scene.launch('UIScene');
  }

  private createWorld(): void {
    // 월드 배경 타일
    for (let x = 0; x < WORLD.WIDTH; x += 64) {
      for (let y = 0; y < WORLD.HEIGHT; y += 64) {
        const tile = this.add.image(x, y, 'bg_tile');
        tile.setOrigin(0, 0);
        tile.setDepth(DEPTH.BACKGROUND);
      }
    }

    // 물리 월드 경계 설정
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
  }

  private createPlayer(): void {
    this.player = new Player(this, WORLD.WIDTH / 2, WORLD.HEIGHT / 2);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);

    this.player.setCollideWorldBounds(true);
    this.player.setDepth(DEPTH.PLAYER);
  }

  private createGroups(): void {
    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true
    });

    this.projectiles = this.physics.add.group({
      classType: Projectile,
      runChildUpdate: true
    });

    this.expGems = this.physics.add.group({
      classType: ExpGem,
      runChildUpdate: true
    });

    this.dropItems = this.physics.add.group({
      classType: DropItem,
      runChildUpdate: true
    });
  }

  private setupInput(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    }
  }

  private setupCollisions(): void {
    // 투사체와 적 충돌
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.onProjectileHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // 플레이어와 적 충돌
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.onPlayerHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // 플레이어와 경험치 젬 충돌
    this.physics.add.overlap(
      this.player,
      this.expGems,
      this.onPlayerCollectExp as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // 플레이어와 드롭 아이템 충돌
    this.physics.add.overlap(
      this.player,
      this.dropItems,
      this.onPlayerCollectDrop as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
  }

  override update(time: number, delta: number): void {
    if (!this.gameState.isPlaying || this.gameState.isPaused) return;

    this.gameState.currentTime += delta;
    this.handleInput();
    this.player.update(time, delta);
    this.updateSpawning(delta);
    this.updateDifficulty(delta);
    this.updateBoss(time, delta);
    this.updateDropSpawning(delta);
    this.player.updateWeapons(time, delta, this.enemies);

    // 경험치 젬 자석 효과
    this.updateExpGemAttraction();
  }

  private updateBoss(time: number, delta: number): void {
    // 10분(600000ms)에 보스 스폰
    if (!this.bossSpawned && this.gameState.currentTime >= 600000) {
      this.spawnBoss();
    }

    // 보스 업데이트
    if (this.boss && this.boss.active && this.boss.body) {
      this.boss.update(time, delta);

      // 보스와 플레이어 충돌 체크 (거리 기반)
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.boss.x, this.boss.y
      );
      if (dist < 60) {
        this.player.takeDamage(this.boss.damage);
      }
    }
  }

  private updateDropSpawning(delta: number): void {
    this.dropSpawnTimer += delta;

    // 2분마다 자석 아이템 스폰
    if (this.dropSpawnTimer >= 120000) {
      this.dropSpawnTimer = 0;
      this.spawnMagnetItem();
    }
  }

  private spawnBoss(): void {
    this.bossSpawned = true;

    // 보스 스폰 경고
    this.cameras.main.flash(1000, 255, 0, 0);

    const warningText = this.add.text(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2,
      'WARNING!\nBOSS APPROACHING',
      {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold',
        align: 'center'
      }
    );
    warningText.setOrigin(0.5);
    warningText.setDepth(DEPTH.UI);

    this.tweens.add({
      targets: warningText,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        warningText.destroy();

        // 보스 스폰
        const angle = Math.random() * Math.PI * 2;
        const distance = 500;
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;

        this.boss = new Boss(this, x, y);
        this.add.existing(this.boss);
        this.physics.add.existing(this.boss);

        // 보스와 투사체 충돌 설정 (한 번만)
        this.physics.add.overlap(
          this.projectiles,
          this.boss,
          this.onProjectileHitBoss as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
          undefined,
          this
        );
      }
    });
  }

  private spawnMagnetItem(): void {
    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 200;
    const x = this.player.x + Math.cos(angle) * distance;
    const y = this.player.y + Math.sin(angle) * distance;

    const clampedX = Phaser.Math.Clamp(x, 50, WORLD.WIDTH - 50);
    const clampedY = Phaser.Math.Clamp(y, 50, WORLD.HEIGHT - 50);

    this.spawnDropItem(clampedX, clampedY, 'magnet');
  }

  private onProjectileHitBoss(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    // Phaser overlap 콜백에서 인자 순서가 바뀔 수 있으므로 타입 체크
    const proj = (obj1 instanceof Projectile ? obj1 : obj2) as Projectile;

    if (!proj || !proj.active || !this.boss || !this.boss.active || !this.boss.body) return;
    if (!(proj instanceof Projectile)) return;

    this.boss.takeDamage(proj.damage);
    this.showDamageNumber(this.boss.x, this.boss.y - 40, proj.damage);

    if (proj.hitEnemy()) {
      proj.destroy();
    }
  }

  public onBossDefeated(): void {
    this.boss = null;

    // 승리 메시지
    const victoryText = this.add.text(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2,
      'BOSS DEFEATED!\nSTAGE CLEAR!',
      {
        fontSize: '48px',
        color: '#00ff00',
        fontStyle: 'bold',
        align: 'center'
      }
    );
    victoryText.setOrigin(0.5);
    victoryText.setDepth(DEPTH.UI);

    this.tweens.add({
      targets: victoryText,
      alpha: 0,
      duration: 3000,
      onComplete: () => victoryText.destroy()
    });
  }

  private handleInput(): void {
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors?.left.isDown || this.wasd?.A.isDown) {
      velocityX = -1;
    } else if (this.cursors?.right.isDown || this.wasd?.D.isDown) {
      velocityX = 1;
    }

    if (this.cursors?.up.isDown || this.wasd?.W.isDown) {
      velocityY = -1;
    } else if (this.cursors?.down.isDown || this.wasd?.S.isDown) {
      velocityY = 1;
    }

    this.player.move(velocityX, velocityY);
  }

  private updateSpawning(delta: number): void {
    this.spawnTimer += delta;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemyWave();
    }
  }

  private updateDifficulty(delta: number): void {
    this.difficultyTimer += delta;

    // 매 30초마다 난이도 증가
    if (this.difficultyTimer >= 30000) {
      this.difficultyTimer = 0;
      this.spawnInterval = Math.max(500, this.spawnInterval - 200);
    }
  }

  private spawnEnemyWave(): void {
    const spawnCount = Math.min(3 + Math.floor(this.gameState.currentTime / 60000), 15);
    const minutes = this.gameState.currentTime / 60000;

    for (let i = 0; i < spawnCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = ENEMY.SPAWN_DISTANCE + Math.random() * 100;
      const x = this.player.x + Math.cos(angle) * distance;
      const y = this.player.y + Math.sin(angle) * distance;

      // 월드 경계 내로 제한
      const clampedX = Phaser.Math.Clamp(x, 50, WORLD.WIDTH - 50);
      const clampedY = Phaser.Math.Clamp(y, 50, WORLD.HEIGHT - 50);

      // 시간에 따라 다른 적 스폰
      let enemyType = 'slime';
      if (minutes >= 2 && Math.random() < 0.3) enemyType = 'bat';
      if (minutes >= 5 && Math.random() < 0.25) enemyType = 'skeleton';
      if (minutes >= 8 && Math.random() < 0.2) enemyType = 'zombie';

      this.spawnEnemy(clampedX, clampedY, enemyType);
    }
  }

  public spawnEnemy(x: number, y: number, type: string): Enemy {
    const enemy = new Enemy(this, x, y, type);
    this.enemies.add(enemy);
    this.add.existing(enemy);
    this.physics.add.existing(enemy);
    enemy.setDepth(DEPTH.ENEMIES);
    return enemy;
  }

  public spawnProjectile(
    x: number,
    y: number,
    texture: string,
    velocityX: number,
    velocityY: number,
    damage: number,
    piercing: number = 0
  ): Projectile {
    const projectile = new Projectile(this, x, y, texture, velocityX, velocityY, damage, piercing);
    this.projectiles.add(projectile);
    this.add.existing(projectile);
    this.physics.add.existing(projectile);
    projectile.initPhysics(); // 물리 바디 설정 후 속도 적용
    projectile.setDepth(DEPTH.PROJECTILES);
    return projectile;
  }

  public spawnExpGem(x: number, y: number, value: number): void {
    const gem = new ExpGem(this, x, y, value);
    this.expGems.add(gem);
    this.add.existing(gem);
    this.physics.add.existing(gem);
    gem.setDepth(DEPTH.DROPS);
  }

  public spawnDropItem(x: number, y: number, type: 'heal' | 'magnet' | 'chest' | 'gold', value: number = 0): void {
    const item = new DropItem(this, x, y, type, value);
    this.dropItems.add(item);
    this.add.existing(item);
    this.physics.add.existing(item);
  }

  private onProjectileHitEnemy(
    projectile: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const proj = projectile as Projectile;
    const enem = enemy as Enemy;

    if (!proj.active || !enem.active) return;

    enem.takeDamage(proj.damage);
    this.showDamageNumber(enem.x, enem.y, proj.damage);

    if (proj.hitEnemy()) {
      proj.destroy();
    }
  }

  private onPlayerHitEnemy(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const p = player as Player;
    const e = enemy as Enemy;

    if (!p.active || !e.active) return;

    p.takeDamage(e.damage);
  }

  private onPlayerCollectExp(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    gem: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const g = gem as ExpGem;
    if (!g.active) return;

    this.addExp(g.value);
    g.destroy();
  }

  private onPlayerCollectDrop(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    drop: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const d = drop as DropItem;
    if (!d.active) return;

    const collected = d.collect();

    switch (collected.type) {
      case 'heal':
        this.player.heal(20);
        this.showHealEffect();
        break;
      case 'magnet':
        this.collectAllExp();
        break;
      case 'chest':
        this.openChest();
        break;
      case 'gold':
        this.gameState.gold += collected.value || 10;
        break;
    }

    d.destroy();
  }

  private showHealEffect(): void {
    const text = this.add.text(this.player.x, this.player.y - 30, '+20 HP', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    text.setDepth(DEPTH.EFFECTS);

    this.tweens.add({
      targets: text,
      y: this.player.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }

  private collectAllExp(): void {
    // 자석 효과 - 화면 내 모든 경험치 수집
    this.expGems.getChildren().forEach((gem) => {
      const g = gem as ExpGem;
      if (!g.active) return;

      const angle = Phaser.Math.Angle.Between(g.x, g.y, this.player.x, this.player.y);
      g.setVelocity(
        Math.cos(angle) * 800,
        Math.sin(angle) * 800
      );
    });
  }

  private openChest(): void {
    // 보물상자 - 랜덤 보너스
    const bonus = Phaser.Math.Between(1, 3);

    if (bonus === 1) {
      // 대량 경험치
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const distance = 50;
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        this.spawnExpGem(x, y, 5);
      }
    } else if (bonus === 2) {
      // 회복
      this.player.heal(50);
      this.showHealEffect();
    } else {
      // 골드
      this.gameState.gold += 50;
    }
  }

  private updateExpGemAttraction(): void {
    const pickupRange = this.player.stats.pickupRange;

    this.expGems.getChildren().forEach((gem) => {
      const g = gem as ExpGem;
      if (!g.active) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        g.x, g.y
      );

      if (distance < pickupRange) {
        const angle = Phaser.Math.Angle.Between(g.x, g.y, this.player.x, this.player.y);
        const speed = 300;
        g.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
      }
    });
  }

  public addExp(amount: number): void {
    const multiplier = this.player.stats.expMultiplier;
    this.gameState.exp += Math.floor(amount * multiplier);

    while (this.gameState.exp >= this.gameState.expToNextLevel) {
      this.gameState.exp -= this.gameState.expToNextLevel;
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.gameState.level++;
    this.gameState.expToNextLevel = Math.floor(
      EXP.BASE_TO_LEVEL * Math.pow(EXP.LEVEL_MULTIPLIER, this.gameState.level - 1)
    );

    // 레벨업 이펙트
    this.cameras.main.flash(200, 255, 255, 255, true);

    // 레벨업 선택 UI 표시
    this.pauseGame();
    this.scene.launch('LevelUpScene');
  }

  public pauseGame(): void {
    this.gameState.isPaused = true;
    this.physics.pause();
  }

  public resumeGame(): void {
    this.gameState.isPaused = false;
    this.physics.resume();
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.add.text(x, y - 20, damage.toString(), {
      fontSize: '16px',
      color: '#ff4444',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    text.setDepth(DEPTH.EFFECTS);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  public addKill(): void {
    this.gameState.kills++;
  }

  public gameOver(): void {
    this.gameState.isPlaying = false;
    this.scene.pause();

    // 게임 오버 텍스트
    const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const centerY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    this.add.rectangle(centerX, centerY, 400, 200, 0x000000, 0.8)
      .setDepth(DEPTH.UI + 10);

    this.add.text(centerX, centerY - 40, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(DEPTH.UI + 11);

    const timeStr = this.formatTime(this.gameState.currentTime);
    this.add.text(centerX, centerY + 10, `생존 시간: ${timeStr}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(DEPTH.UI + 11);

    this.add.text(centerX, centerY + 40, `처치 수: ${this.gameState.kills}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(DEPTH.UI + 11);

    this.add.text(centerX, centerY + 80, 'R키를 눌러 재시작', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(DEPTH.UI + 11);

    // R키로 재시작
    this.input.keyboard?.once('keydown-R', () => {
      this.scene.stop('UIScene');
      this.scene.restart();
    });
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
