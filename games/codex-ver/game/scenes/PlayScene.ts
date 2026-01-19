import Phaser from "phaser";
import weaponsData from "../../data/balance/weapons.json";
import passivesData from "../../data/balance/passives.json";
import evolutionsData from "../../data/balance/evolutions.json";
import charactersData from "../../data/balance/characters.json";
import stagesData from "../../data/balance/stages.json";
import wavesLab from "../../data/balance/waves_lab.json";
import wavesSwamp from "../../data/balance/waves_swamp.json";
import { loadMeta, applyMetaUpgrade } from "../meta/MetaStore";
import { loadSettings, saveSettings } from "../meta/SettingsStore";
import type { RunResult } from "./ResultsScene";

type MoveKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
};

type StatKey =
  | "maxHealth"
  | "moveSpeed"
  | "pickupRadius"
  | "cooldownReduction"
  | "critChance"
  | "armor"
  | "regen"
  | "areaScale";

type PlayerStats = Record<StatKey, number>;

type WeaponLevelUp = {
  level: number;
  damage?: number;
  cooldown?: number;
  range?: number;
  projectiles?: number;
  pierce?: number;
};

type WeaponData = {
  id: string;
  name: string;
  rarity: string;
  baseDamage: number;
  cooldown: number;
  range: number;
  projectiles: number;
  pierce: number;
  tags: string[];
  levelUp: WeaponLevelUp[];
};

type WeaponStats = {
  damage: number;
  cooldown: number;
  range: number;
  projectiles: number;
  pierce: number;
};

type WeaponState = {
  id: string;
  data: WeaponData;
  level: number;
  stats: WeaponStats;
  timer?: Phaser.Time.TimerEvent;
};

type PassiveData = {
  id: string;
  name: string;
  rarity: string;
  stat: StatKey;
  value: number;
  maxStacks: number;
  description: string;
};

type WaveWeight = { type: EnemyTypeId; weight: number };

type WaveSegment = {
  start: number;
  end: number;
  spawnDelay: number;
  spawnCount: number;
  weights: WaveWeight[];
};

type WaveBoss = { time: number; type: EnemyTypeId };

type WaveData = {
  version: number;
  segments: WaveSegment[];
  bosses: WaveBoss[];
};

type EnemyTypeId = "swarm" | "charger" | "ranged" | "mini_boss" | "boss";

type EnemyStats = {
  hp: number;
  speed: number;
  xp: number;
  damage: number;
  tint: number;
  scale: number;
};

type EvolutionData = {
  id: string;
  baseWeaponId: string;
  requiredPassiveId: string;
  resultWeaponId: string;
  description: string;
};

type CharacterData = {
  id: string;
  name: string;
  description: string;
  stats: PlayerStats;
  startingWeaponId: string;
};

type StageSlowZone = {
  x: number;
  y: number;
  radius: number;
  slowMultiplier: number;
};

type StageData = {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  themeColor: string;
  wavesKey: string;
  duration: number;
  enemyMax: number;
  moveSpeedMultiplier: number;
  slowZones: StageSlowZone[];
};

type SlowZone = {
  x: number;
  y: number;
  radius: number;
  slowMultiplier: number;
};

type LevelUpOption =
  | { kind: "weapon-upgrade"; weaponId: string; label: string }
  | { kind: "weapon-add"; weaponId: string; label: string }
  | { kind: "evolve"; baseId: string; resultId: string; label: string }
  | { kind: "passive"; passive: PassiveData; label: string }
  | { kind: "heal"; label: string };

type OptionTextRefs = {
  master: Phaser.GameObjects.Text;
  sfx: Phaser.GameObjects.Text;
};

const WEAPON_LEVEL_CAP = 5;
const PROJECTILE_SPEED = 420;
const ENEMY_PROJECTILE_SPEED = 260;
const PROJECTILE_TTL = 8000;
const PROJECTILE_DESPAWN_PADDING = 60;
const UI_PANEL_COLOR = 0x0b1512;

const ENEMY_TYPES: Record<EnemyTypeId, EnemyStats> = {
  swarm: { hp: 20, speed: 90, xp: 1, damage: 6, tint: 0xd35f5f, scale: 1 },
  charger: { hp: 35, speed: 125, xp: 2, damage: 10, tint: 0xf0a44f, scale: 1.1 },
  ranged: { hp: 28, speed: 70, xp: 2, damage: 8, tint: 0x8aa9ff, scale: 1 },
  mini_boss: { hp: 900, speed: 65, xp: 10, damage: 18, tint: 0x9b4dca, scale: 1.8 },
  boss: { hp: 2600, speed: 52, xp: 20, damage: 26, tint: 0xf06a9c, scale: 2.3 }
};

const RARITY_WEIGHTS: Record<string, number> = {
  common: 60,
  rare: 30,
  epic: 9,
  legendary: 1
};

const SFX_KEYS = {
  shoot: "sfx_shoot",
  hit: "sfx_hit",
  hurt: "sfx_hurt",
  level: "sfx_level",
  enemyShoot: "sfx_enemy_shoot"
};

const WEAPON_POOL = (weaponsData as { items: WeaponData[] }).items;
const PASSIVE_POOL = (passivesData as { items: PassiveData[] }).items;
const EVOLUTIONS = (evolutionsData as { items: EvolutionData[] }).items;
const CHARACTERS = (charactersData as { items: CharacterData[] }).items;
const STAGES = (stagesData as { items: StageData[] }).items;
const WAVES_TABLE: Record<string, WaveData> = {
  lab: wavesLab as WaveData,
  swamp: wavesSwamp as WaveData
};

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: MoveKeys;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private enemyProjectiles!: Phaser.Physics.Arcade.Group;
  private xpOrbs!: Phaser.Physics.Arcade.Group;

  private characterData!: CharacterData;
  private stageData!: StageData;
  private waves!: WaveData;
  private stageDurationMs = 0;
  private enemyMax = 110;
  private slowZones: SlowZone[] = [];
  private slowZoneGraphics?: Phaser.GameObjects.Graphics;

  private playerStats: PlayerStats = {
    maxHealth: 100,
    moveSpeed: 220,
    pickupRadius: 60,
    cooldownReduction: 0,
    critChance: 0,
    armor: 0,
    regen: 0,
    areaScale: 0
  };
  private playerHealth = 100;

  private weapons: WeaponState[] = [];
  private weaponSlotsMax = 2;

  private xp = 0;
  private level = 1;
  private xpToNext = 0;
  private pendingLevelUps = 0;
  private isLevelUpOpen = false;
  private passiveStacks = new Map<string, number>();

  private spawnTimer!: Phaser.Time.TimerEvent;
  private hudTimer!: Phaser.Time.TimerEvent;

  private runTimeMs = 0;
  private currentWaveIndex = 0;
  private bossesSpawned = new Set<string>();
  private lastHitAt = 0;
  private lastFireSfxAt = 0;
  private isPaused = false;
  private isEnding = false;

  private kills = 0;

  private hudText!: Phaser.GameObjects.Text;
  private hudPanel!: Phaser.GameObjects.Rectangle;
  private hudSideText!: Phaser.GameObjects.Text;
  private hudSidePanel!: Phaser.GameObjects.Rectangle;
  private levelUpContainer?: Phaser.GameObjects.Container;
  private guideContainer?: Phaser.GameObjects.Container;
  private optionsContainer?: Phaser.GameObjects.Container;
  private optionTextRefs?: OptionTextRefs;
  private isOptionsOpen = false;

  private masterVolume = 0.8;
  private sfxVolume = 0.7;

  private touchActive = false;
  private touchPointerId: number | null = null;
  private touchPointer?: Phaser.Input.Pointer;
  private touchVector = new Phaser.Math.Vector2();
  private touchStart = new Phaser.Math.Vector2();
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickThumb?: Phaser.GameObjects.Arc;
  private joystickRadius = 46;

  constructor() {
    super("Play");
  }

  create() {
    this.resetRunState();
    this.applySelections();

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.cameras.main.setBackgroundColor(this.stageData.backgroundColor);
    this.physics.world.setBounds(0, 0, width, height);

    this.player = this.physics.add.sprite(centerX, centerY, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setScale(this.getPlayerScale());

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey("W"),
      down: this.input.keyboard!.addKey("S"),
      left: this.input.keyboard!.addKey("A"),
      right: this.input.keyboard!.addKey("D")
    };

    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.xpOrbs = this.physics.add.group();

    this.setupSlowZones();
    this.setupTouchControls();

    const settings = loadSettings();
    this.masterVolume = settings.masterVolume;
    this.sfxVolume = settings.sfxVolume;
    this.sound.volume = this.masterVolume;

    this.addWeaponById(this.characterData.startingWeaponId);
    this.xpToNext = this.getXpToNext(this.level);

    this.spawnTimer = this.time.addEvent({
      delay: this.getCurrentWave().spawnDelay,
      loop: true,
      callback: this.spawnFromWave,
      callbackScope: this
    });

    this.hudPanel = this.add
      .rectangle(16, 12, 260, 118, UI_PANEL_COLOR, 0.6)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(900);

    this.hudText = this.add
      .text(24, 18, "", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d8f7d8"
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.hudSidePanel = this.add
      .rectangle(width - 16, 12, 360, 190, UI_PANEL_COLOR, 0.6)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(900);

    this.hudSideText = this.add
      .text(width - 24, 18, "", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#cfe6d6",
        align: "right"
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1000);

    this.createGuide();

    this.hudTimer = this.time.addEvent({
      delay: 250,
      loop: true,
      callback: this.updateHud,
      callbackScope: this
    });

    this.input.keyboard?.on("keydown-H", () => this.toggleGuide());
    this.input.keyboard?.on("keydown-O", () => this.toggleOptionsSafe());
    this.input.keyboard?.on("keydown-ESC", () => this.toggleOptionsSafe());

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => this.handlePlayerHit(player as Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, enemy as Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile), undefined, this);
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (projectile, enemy) => this.handleProjectileHit(projectile as Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, enemy as Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile),
      undefined,
      this
    );
    this.physics.add.overlap(this.player, this.xpOrbs, (player, orb) => this.collectXp(player as Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, orb as Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile), undefined, this);
    this.physics.add.overlap(
      this.enemyProjectiles,
      this.player,
      (projectile, player) => this.handleEnemyProjectileHit(projectile as Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, player as Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile),
      undefined,
      this
    );

    this.scale.on("resize", this.handleResize, this);

    this.updateHud();
  }

  private resetRunState() {
    this.isPaused = false;
    this.isEnding = false;
    this.isLevelUpOpen = false;
    this.isOptionsOpen = false;
    this.pendingLevelUps = 0;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 0;
    this.runTimeMs = 0;
    this.currentWaveIndex = 0;
    this.kills = 0;
    this.lastHitAt = 0;
    this.lastFireSfxAt = 0;
    this.touchActive = false;
    this.touchPointerId = null;
    this.touchVector.set(0, 0);
    this.touchStart.set(0, 0);
    this.passiveStacks.clear();
    this.weapons = [];
    this.bossesSpawned.clear();
  }

  override update(_time: number, delta: number) {
    if (this.isPaused || this.isEnding) {
      return;
    }

    this.runTimeMs += delta;
    if (this.stageDurationMs > 0 && this.runTimeMs >= this.stageDurationMs) {
      this.endRun("victory");
      return;
    }

    this.updateWave();
    this.updateMovement();
    this.updateEnemies(false);
    this.updateProjectiles(delta);
    this.updateEnemyProjectiles(delta);
    this.updateXpOrbs();
    this.updateRegen(delta);
    this.spawnBossesIfNeeded();
  }

  private applySelections() {
    const characterId = (this.registry.get("selectedCharacterId") as string) || CHARACTERS[0]?.id;
    const stageId = (this.registry.get("selectedStageId") as string) || STAGES[0]?.id;

    this.characterData =
      CHARACTERS.find((character) => character.id === characterId) ?? CHARACTERS[0];
    this.stageData = STAGES.find((stage) => stage.id === stageId) ?? STAGES[0];
    this.waves = WAVES_TABLE[this.stageData.wavesKey] ?? WAVES_TABLE.lab;
    this.stageDurationMs = this.stageData.duration * 1000;
    this.enemyMax = this.stageData.enemyMax;

    this.registry.set("selectedCharacterId", this.characterData.id);
    this.registry.set("selectedStageId", this.stageData.id);

    this.playerStats = { ...this.characterData.stats };

    const meta = loadMeta();
    this.playerStats.maxHealth = applyMetaUpgrade("maxHealth", this.playerStats.maxHealth, meta);
    this.playerStats.moveSpeed = applyMetaUpgrade("moveSpeed", this.playerStats.moveSpeed, meta);
    this.playerStats.pickupRadius = applyMetaUpgrade(
      "pickupRadius",
      this.playerStats.pickupRadius,
      meta
    );
    this.playerStats.regen = applyMetaUpgrade("regen", this.playerStats.regen, meta);
    this.playerStats.moveSpeed *= this.stageData.moveSpeedMultiplier;

    this.playerHealth = this.playerStats.maxHealth;
  }

  private setupSlowZones() {
    if (!this.stageData.slowZones || this.stageData.slowZones.length === 0) {
      return;
    }

    const { width, height } = this.scale;
    this.slowZones = this.stageData.slowZones.map((zone) => ({
      x: zone.x * width,
      y: zone.y * height,
      radius: zone.radius * Math.min(width, height),
      slowMultiplier: zone.slowMultiplier
    }));

    this.slowZoneGraphics = this.add.graphics();
    this.slowZoneGraphics.setDepth(10);
    this.slowZoneGraphics.fillStyle(0x1d2f25, 0.4);
    this.slowZones.forEach((zone) => {
      this.slowZoneGraphics?.fillCircle(zone.x, zone.y, zone.radius);
    });
  }

  private setupTouchControls() {
    this.joystickBase = this.add.circle(0, 0, this.joystickRadius, 0x16251f, 0.7);
    this.joystickThumb = this.add.circle(0, 0, this.joystickRadius * 0.45, 0x5fd35f, 0.85);
    this.joystickBase.setScrollFactor(0).setDepth(1200).setVisible(false);
    this.joystickThumb.setScrollFactor(0).setDepth(1201).setVisible(false);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isPaused || this.isLevelUpOpen || this.isOptionsOpen) {
        return;
      }
      if (!pointer.wasTouch && !this.sys.game.device.input.touch) {
        return;
      }
      if (pointer.x > this.scale.width * 0.5) {
        return;
      }
      if (this.touchActive) {
        return;
      }

      this.touchActive = true;
      this.touchPointerId = pointer.id;
      this.touchPointer = pointer;
      this.touchStart.set(pointer.x, pointer.y);
      this.touchVector.set(0, 0);

      this.joystickBase?.setPosition(pointer.x, pointer.y).setVisible(true);
      this.joystickThumb?.setPosition(pointer.x, pointer.y).setVisible(true);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.touchActive || this.touchPointerId !== pointer.id) {
        return;
      }

      const dx = pointer.x - this.touchStart.x;
      const dy = pointer.y - this.touchStart.y;
      const distance = Math.min(Math.hypot(dx, dy), this.joystickRadius);
      const angle = Math.atan2(dy, dx);

      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      this.joystickThumb?.setPosition(this.touchStart.x + offsetX, this.touchStart.y + offsetY);

      if (distance > 6) {
        this.touchVector.set(offsetX / this.joystickRadius, offsetY / this.joystickRadius);
      } else {
        this.touchVector.set(0, 0);
      }
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.touchPointerId !== pointer.id) {
        return;
      }
      this.resetTouch();
    });
  }

  private resetTouch() {
    this.touchActive = false;
    this.touchPointerId = null;
    this.touchPointer = undefined;
    this.touchVector.set(0, 0);
    this.joystickBase?.setVisible(false);
    this.joystickThumb?.setVisible(false);
  }

  private updateMovement() {
    if (!this.player || !this.player.body) {
      return;
    }

    let keyX = 0;
    let keyY = 0;

    if (this.cursors.left?.isDown || this.wasd.left.isDown) {
      keyX -= 1;
    }
    if (this.cursors.right?.isDown || this.wasd.right.isDown) {
      keyX += 1;
    }
    if (this.cursors.up?.isDown || this.wasd.up.isDown) {
      keyY -= 1;
    }
    if (this.cursors.down?.isDown || this.wasd.down.isDown) {
      keyY += 1;
    }

    if (this.touchActive && this.touchPointer && !this.touchPointer.isDown) {
      this.resetTouch();
    }

    let inputX = keyX;
    let inputY = keyY;
    const touchMagnitude = this.touchVector.length();
    if (this.touchActive && touchMagnitude > 0.08) {
      inputX = this.touchVector.x;
      inputY = this.touchVector.y;
    }

    const direction = new Phaser.Math.Vector2(inputX, inputY);
    if (direction.lengthSq() > 0) {
      direction.normalize();
    }

    const slowMultiplier = this.getSlowMultiplier(this.player.x, this.player.y);
    const speed = this.playerStats.moveSpeed * slowMultiplier;
    this.player.setVelocity(direction.x * speed, direction.y * speed);
  }

  private getSlowMultiplier(x: number, y: number) {
    if (this.slowZones.length === 0) {
      return 1;
    }

    for (const zone of this.slowZones) {
      const distance = Phaser.Math.Distance.Between(x, y, zone.x, zone.y);
      if (distance <= zone.radius) {
        return zone.slowMultiplier;
      }
    }

    return 1;
  }

  private spawnFromWave() {
    const wave = this.getCurrentWave();
    for (let i = 0; i < wave.spawnCount; i += 1) {
      const type = this.pickWeighted(wave.weights, (entry) => entry.weight)?.type ?? "swarm";
      this.spawnEnemy(type);
    }
  }

  private spawnEnemy(type: EnemyTypeId) {
    if (type !== "mini_boss" && type !== "boss" && this.enemies.countActive(true) >= this.enemyMax) {
      return;
    }

    const stats = ENEMY_TYPES[type];
    const spawn = this.randomEdgePoint(40);
    const enemy = this.enemies.create(spawn.x, spawn.y, "enemy") as Phaser.Physics.Arcade.Sprite;

    enemy.setData("type", type);
    enemy.setData("hp", stats.hp);
    enemy.setData("maxHp", stats.hp);
    enemy.setData("speed", stats.speed);
    enemy.setData("xp", stats.xp);
    enemy.setData("damage", stats.damage);
    enemy.setData("tint", stats.tint);
    enemy.setTint(stats.tint);
    enemy.setScale(stats.scale);

    if (type === "ranged" || type === "mini_boss" || type === "boss") {
      const baseDelay = type === "boss" ? 700 : type === "mini_boss" ? 900 : 1400;
      enemy.setData("fireDelay", baseDelay);
      enemy.setData("nextShot", this.time.now + Phaser.Math.Between(200, 700));
      enemy.setData("burstCounter", 0);
      enemy.setData("strafeDir", Phaser.Math.Between(0, 1) === 0 ? -1 : 1);
    }
  }

  private updateEnemies(freeze: boolean) {
    this.enemies.children.iterate((child) => {
      if (!child) {
        return null;
      }

      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) {
        return null;
      }

      if (freeze) {
        enemy.setVelocity(0, 0);
        return null;
      }

      const type = enemy.getData("type") as EnemyTypeId;
      const speed = enemy.getData("speed") as number;

      if (type === "ranged") {
        this.updateRangedEnemy(enemy, speed);
        this.tryFireRangedEnemy(enemy, "ranged");
      } else if (type === "mini_boss") {
        this.updateChasingEnemy(enemy, speed);
        this.tryFireRangedEnemy(enemy, "mini_boss");
      } else if (type === "boss") {
        this.updateChasingEnemy(enemy, speed);
        this.tryFireRangedEnemy(enemy, "boss");
      } else {
        this.updateChasingEnemy(enemy, speed);
      }

      return null;
    });
  }

  private updateChasingEnemy(enemy: Phaser.Physics.Arcade.Sprite, speed: number) {
    const direction = new Phaser.Math.Vector2(
      this.player.x - enemy.x,
      this.player.y - enemy.y
    ).normalize();

    enemy.setVelocity(direction.x * speed, direction.y * speed);
  }

  private updateRangedEnemy(enemy: Phaser.Physics.Arcade.Sprite, speed: number) {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);

    if (distance > 230) {
      this.updateChasingEnemy(enemy, speed);
      return;
    }

    if (distance < 140) {
      const direction = new Phaser.Math.Vector2(
        enemy.x - this.player.x,
        enemy.y - this.player.y
      ).normalize();

      enemy.setVelocity(direction.x * speed, direction.y * speed);
      return;
    }

    const direction = new Phaser.Math.Vector2(
      enemy.x - this.player.x,
      enemy.y - this.player.y
    ).normalize();
    const strafeDir = (enemy.getData("strafeDir") as number) ?? 1;
    const perpendicular = new Phaser.Math.Vector2(-direction.y, direction.x).scale(strafeDir);
    const strafeSpeed = speed * 0.65;

    enemy.setVelocity(perpendicular.x * strafeSpeed, perpendicular.y * strafeSpeed);

    if (Phaser.Math.Between(0, 100) < 2) {
      enemy.setData("strafeDir", -strafeDir);
    }
  }

  private tryFireRangedEnemy(enemy: Phaser.Physics.Arcade.Sprite, type: EnemyTypeId) {
    const nextShot = enemy.getData("nextShot") as number | undefined;
    if (nextShot !== undefined && this.time.now < nextShot) {
      return;
    }

    const delay = (enemy.getData("fireDelay") as number | undefined) ?? 1400;
    enemy.setData("nextShot", this.time.now + delay + Phaser.Math.Between(0, 200));

    const aimAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const baseDamage = Number(enemy.getData("damage"));
    const damage = Number.isFinite(baseDamage) ? baseDamage : ENEMY_TYPES[type].damage;

    if (type === "boss") {
      const burstCounter = (enemy.getData("burstCounter") as number) ?? 0;
      if (burstCounter % 4 === 3) {
        const shots = 10;
        for (let i = 0; i < shots; i += 1) {
          const angle = (Math.PI * 2 * i) / shots;
          this.fireEnemyProjectile(
            enemy.x,
            enemy.y,
            angle,
            ENEMY_PROJECTILE_SPEED * 0.95,
            damage,
            1900,
            0xffb15f,
            type
          );
        }
      } else if (burstCounter % 2 === 0) {
        this.fireEnemySpread(
          enemy.x,
          enemy.y,
          aimAngle,
          5,
          0.24,
          ENEMY_PROJECTILE_SPEED + 60,
          damage,
          1700,
          0xff7f66,
          type
        );
      } else {
        this.fireEnemySpread(
          enemy.x,
          enemy.y,
          aimAngle,
          3,
          0.16,
          ENEMY_PROJECTILE_SPEED + 30,
          damage,
          1600,
          0xff7f66,
          type
        );
      }
      enemy.setData("burstCounter", burstCounter + 1);
    } else if (type === "mini_boss") {
      const burstCounter = (enemy.getData("burstCounter") as number) ?? 0;
      if (burstCounter % 3 === 2) {
        const shots = 6;
        for (let i = 0; i < shots; i += 1) {
          const angle = (Math.PI * 2 * i) / shots;
          this.fireEnemyProjectile(
            enemy.x,
            enemy.y,
            angle,
            ENEMY_PROJECTILE_SPEED * 0.9,
            damage,
            1800,
            0xffb15f,
            type
          );
        }
      } else {
        this.fireEnemySpread(
          enemy.x,
          enemy.y,
          aimAngle,
          2,
          0.12,
          ENEMY_PROJECTILE_SPEED + 40,
          damage,
          1600,
          0xff7f66,
          type
        );
      }
      enemy.setData("burstCounter", burstCounter + 1);
    } else {
      if (Phaser.Math.FloatBetween(0, 1) < 0.35) {
        this.fireEnemySpread(
          enemy.x,
          enemy.y,
          aimAngle,
          3,
          0.22,
          ENEMY_PROJECTILE_SPEED,
          damage,
          1500,
          undefined,
          type
        );
      } else {
        this.fireEnemyProjectile(enemy.x, enemy.y, aimAngle, ENEMY_PROJECTILE_SPEED, damage, 1500, undefined, type);
      }
    }

    this.playSfx(SFX_KEYS.enemyShoot, 0.35);
  }

  private fireEnemyProjectile(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    ttl: number,
    tint?: number,
    sourceType?: EnemyTypeId
  ) {
    const projectile = this.enemyProjectiles.create(x, y, "enemy_projectile") as Phaser.Physics.Arcade.Image;

    if (tint) {
      projectile.setTint(tint);
    }

    const safeDamage = Number.isFinite(damage) ? damage : ENEMY_TYPES.ranged.damage;
    const velocity = new Phaser.Math.Vector2();
    this.physics.velocityFromRotation(angle, speed, velocity);
    projectile.setVelocity(velocity.x, velocity.y);
    projectile.setData("damage", safeDamage);
    projectile.setData("ttl", ttl);
    if (sourceType) {
      projectile.setData("sourceType", sourceType);
    }
  }

  private fireEnemySpread(
    x: number,
    y: number,
    baseAngle: number,
    count: number,
    spread: number,
    speed: number,
    damage: number,
    ttl: number,
    tint?: number,
    sourceType?: EnemyTypeId
  ) {
    const startOffset = -(count - 1) / 2;
    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle + (startOffset + i) * spread;
      this.fireEnemyProjectile(x, y, angle, speed, damage, ttl, tint, sourceType);
    }
  }

  private fireWeapon(weapon: WeaponState) {
    const target = this.getNearestEnemy();
    if (!target) {
      return;
    }

    const baseAngle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      target.x,
      target.y
    );
    const count = weapon.stats.projectiles;
    const spread = count > 1 ? 0.22 : 0;
    const startOffset = -(count - 1) / 2;
    const ttl = PROJECTILE_TTL;

    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle + (startOffset + i) * spread;
      const projectile = this.projectiles.create(
        this.player.x,
        this.player.y,
        "projectile"
      ) as Phaser.Physics.Arcade.Image;

      projectile.setData("damage", weapon.stats.damage);
      projectile.setData("pierce", weapon.stats.pierce);
      projectile.setData("ttl", ttl);

      const body = projectile.body as Phaser.Physics.Arcade.Body;
      this.physics.velocityFromRotation(angle, PROJECTILE_SPEED, body.velocity);
    }

    if (this.time.now - this.lastFireSfxAt > 120) {
      this.playSfx(SFX_KEYS.shoot, 0.2);
      this.lastFireSfxAt = this.time.now;
    }
  }

  private updateProjectiles(delta: number) {
    const width = this.scale.width as number;
    const height = this.scale.height as number;

    this.projectiles.children.iterate((child) => {
      if (!child) {
        return null;
      }

      const projectile = child as Phaser.Physics.Arcade.Image;
      if (!projectile.active) {
        return null;
      }

      if (
        projectile.x < -PROJECTILE_DESPAWN_PADDING ||
        projectile.x > width + PROJECTILE_DESPAWN_PADDING ||
        projectile.y < -PROJECTILE_DESPAWN_PADDING ||
        projectile.y > height + PROJECTILE_DESPAWN_PADDING
      ) {
        projectile.destroy();
        return null;
      }

      const ttl = (projectile.getData("ttl") as number) - delta;
      if (ttl <= 0) {
        projectile.destroy();
        return null;
      }

      projectile.setData("ttl", ttl);
      return null;
    });
  }

  private updateEnemyProjectiles(delta: number) {
    this.enemyProjectiles.children.iterate((child) => {
      if (!child) {
        return null;
      }

      const projectile = child as Phaser.Physics.Arcade.Image;
      if (!projectile.active) {
        return null;
      }

      const ttl = (projectile.getData("ttl") as number) - delta;
      if (ttl <= 0) {
        projectile.destroy();
        return null;
      }

      projectile.setData("ttl", ttl);
      return null;
    });
  }

  private handleProjectileHit(
    projectileObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const projectile = projectileObj as Phaser.Physics.Arcade.Image;
    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;

    if (!projectile.active || !enemy.active) {
      return;
    }

    const damage = projectile.getData("damage") as number;
    const hp = (enemy.getData("hp") as number) - damage;
    enemy.setData("hp", hp);

    this.flashEnemy(enemy);
    this.spawnHitEffect(enemy.x, enemy.y, 0xf8d14d);
    this.playSfx(SFX_KEYS.hit, 0.25);

    if (hp <= 0) {
      this.killEnemy(enemy);
    }

    const pierce = projectile.getData("pierce") as number;
    if (pierce > 0) {
      projectile.setData("pierce", pierce - 1);
    } else {
      projectile.destroy();
    }
  }

  private handleEnemyProjectileHit(
    projectileObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const projectile = this.resolveEnemyProjectile(projectileObj as Phaser.GameObjects.GameObject, playerObj as Phaser.GameObjects.GameObject);
    if (!projectile || !projectile.active) {
      return;
    }

    let damage = Number(projectile.getData("damage"));
    projectile.destroy();

    if (!Number.isFinite(damage)) {
      const sourceType = projectile.getData("sourceType") as EnemyTypeId | undefined;
      damage = sourceType ? ENEMY_TYPES[sourceType].damage : ENEMY_TYPES.ranged.damage;
    }

    this.applyPlayerDamage(damage);
  }

  private handlePlayerHit(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (this.isPaused) {
      return;
    }

    const now = this.time.now;
    if (now - this.lastHitAt < 450) {
      return;
    }

    const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
    const damage = Number(enemy.getData("damage"));
    if (!Number.isFinite(damage)) {
      return;
    }

    this.applyPlayerDamage(damage);
    this.lastHitAt = now;
  }

  private applyPlayerDamage(rawDamage: number) {
    if (!Number.isFinite(rawDamage)) {
      return;
    }

    const armor = Number.isFinite(this.playerStats.armor) ? this.playerStats.armor : 0;
    const currentHealth = Number.isFinite(this.playerHealth)
      ? this.playerHealth
      : Number.isFinite(this.playerStats.maxHealth)
        ? this.playerStats.maxHealth
        : 100;
    const mitigated = Math.max(1, rawDamage - armor);
    this.playerHealth = Math.max(0, currentHealth - mitigated);

    this.player.setTintFill(0xff5555);
    this.time.delayedCall(120, () => this.player.clearTint());

    this.spawnHitEffect(this.player.x, this.player.y, 0xff5555);
    this.playSfx(SFX_KEYS.hurt, 0.35);

    if (this.playerHealth <= 0) {
      this.endRun("defeat");
    }
  }

  private resolveEnemyProjectile(
    first: Phaser.GameObjects.GameObject,
    second: Phaser.GameObjects.GameObject
  ) {
    const firstImage = first as Phaser.GameObjects.Image;
    const secondImage = second as Phaser.GameObjects.Image;

    const firstKey = firstImage.texture?.key;
    const secondKey = secondImage.texture?.key;

    if (firstKey === "enemy_projectile") {
      return first as Phaser.Physics.Arcade.Image;
    }
    if (secondKey === "enemy_projectile") {
      return second as Phaser.Physics.Arcade.Image;
    }

    return null;
  }

  private killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    const xpValue = enemy.getData("xp") as number;
    this.spawnXp(enemy.x, enemy.y, xpValue);
    this.spawnHitEffect(enemy.x, enemy.y, 0xffb15f, 1.4);
    this.kills += 1;

    enemy.destroy();
  }

  private spawnXp(x: number, y: number, value: number) {
    const orb = this.xpOrbs.create(x, y, "xp") as Phaser.Physics.Arcade.Image;
    const scale = value >= 10 ? 1.6 : value >= 3 ? 1.2 : 1;

    orb.setScale(scale);
    orb.setData("xp", value);
  }

  private collectXp(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    orbObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const orb = orbObj as Phaser.Physics.Arcade.Image;
    if (!orb.active) {
      return;
    }

    const value = orb.getData("xp") as number;
    orb.destroy();
    this.gainXp(value);
  }

  private updateXpOrbs() {
    this.xpOrbs.children.iterate((child) => {
      if (!child) {
        return null;
      }

      const orb = child as Phaser.Physics.Arcade.Image;
      if (!orb.active) {
        return null;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y);
      if (distance <= this.playerStats.pickupRadius) {
        const direction = new Phaser.Math.Vector2(this.player.x - orb.x, this.player.y - orb.y).normalize();
        orb.setVelocity(direction.x * 140, direction.y * 140);
      } else {
        orb.setVelocity(0, 0);
      }

      return null;
    });
  }

  private gainXp(amount: number) {
    this.xp += amount;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = this.getXpToNext(this.level);
      this.pendingLevelUps += 1;
    }

    if (!this.isLevelUpOpen && this.pendingLevelUps > 0) {
      this.openLevelUp();
    }
  }

  private openLevelUp() {
    this.pendingLevelUps -= 1;
    this.isLevelUpOpen = true;
    this.setPaused(true);

    const options = this.rollLevelUpOptions(3);
    const width = this.scale.width;
    const height = this.scale.height;

    const panel = this.add.rectangle(width / 2, height / 2, width * 0.68, height * 0.62, UI_PANEL_COLOR, 0.92);
    panel.setStrokeStyle(2, 0x5fd35f);

    const title = this.add
      .text(width / 2, height / 2 - 160, `LEVEL ${this.level}`, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#5fd35f"
      })
      .setOrigin(0.5);

    const optionTexts = options.map((option, index) => {
      const y = height / 2 - 70 + index * 80;
      const text = this.add
        .text(width / 2, y, option.label, {
          fontFamily: "monospace",
          fontSize: "16px",
          color: "#f0f7e8",
          align: "center"
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      text.on("pointerdown", () => {
        this.applyLevelUpOption(option);
        this.closeLevelUp();
      });

      return text;
    });

    this.playSfx(SFX_KEYS.level, 0.6);
    this.levelUpContainer = this.add.container(0, 0, [panel, title, ...optionTexts]).setDepth(2000);
  }

  private closeLevelUp() {
    this.levelUpContainer?.destroy(true);
    this.levelUpContainer = undefined;
    this.isLevelUpOpen = false;

    if (this.pendingLevelUps > 0) {
      this.openLevelUp();
      return;
    }

    this.setPaused(false);
  }

  private rollLevelUpOptions(count: number): LevelUpOption[] {
    const options: LevelUpOption[] = [];

    const evolutionOptions = this.getEvolutionOptions();
    this.fillOptions(options, evolutionOptions, count);

    const upgradeOptions = this.getWeaponUpgradeOptions();
    this.fillOptions(options, upgradeOptions, count);

    if (options.length < count && this.weapons.length < this.weaponSlotsMax) {
      const availableWeapons = WEAPON_POOL.filter(
        (weapon) => !this.weapons.some((owned) => owned.id === weapon.id)
      );

      while (options.length < count && availableWeapons.length > 0) {
        const pick = this.pickWeightedIndex(availableWeapons, (item) => this.getRarityWeight(item.rarity));
        if (!pick) {
          break;
        }

        const weapon = pick.item;
        availableWeapons.splice(pick.index, 1);
        options.push({
          kind: "weapon-add",
          weaponId: weapon.id,
          label: `New Weapon: ${weapon.name}`
        });
      }
    }

    const availablePassives = PASSIVE_POOL.filter(
      (passive) => (this.passiveStacks.get(passive.id) ?? 0) < passive.maxStacks
    );

    while (options.length < count && availablePassives.length > 0) {
      const pick = this.pickWeightedIndex(availablePassives, (item) => this.getRarityWeight(item.rarity));
      if (!pick) {
        break;
      }

      const passive = pick.item;
      availablePassives.splice(pick.index, 1);

      options.push({
        kind: "passive",
        passive,
        label: `${passive.name} +${passive.value} (${passive.description})`
      });
    }

    while (options.length < count) {
      options.push({ kind: "heal", label: "Recover 20 HP" });
    }

    return options.slice(0, count);
  }

  private getEvolutionOptions(): LevelUpOption[] {
    const options: LevelUpOption[] = [];

    EVOLUTIONS.forEach((evolution) => {
      const baseWeapon = this.weapons.find((weapon) => weapon.id === evolution.baseWeaponId);
      const passiveStacks = this.passiveStacks.get(evolution.requiredPassiveId) ?? 0;
      const resultWeapon = this.getWeaponData(evolution.resultWeaponId);

      if (!baseWeapon || !resultWeapon) {
        return;
      }
      if (baseWeapon.level < WEAPON_LEVEL_CAP) {
        return;
      }
      if (passiveStacks <= 0) {
        return;
      }
      if (this.weapons.some((weapon) => weapon.id === evolution.resultWeaponId)) {
        return;
      }

      options.push({
        kind: "evolve",
        baseId: evolution.baseWeaponId,
        resultId: evolution.resultWeaponId,
        label: `Evolve ${baseWeapon.data.name} -> ${resultWeapon.name}`
      });
    });

    return options;
  }

  private getEvolutionReadyLabels() {
    const labels: string[] = [];

    EVOLUTIONS.forEach((evolution) => {
      const baseWeapon = this.weapons.find((weapon) => weapon.id === evolution.baseWeaponId);
      const passiveStacks = this.passiveStacks.get(evolution.requiredPassiveId) ?? 0;
      const resultWeapon = this.getWeaponData(evolution.resultWeaponId);

      if (!baseWeapon || !resultWeapon) {
        return;
      }
      if (baseWeapon.level < WEAPON_LEVEL_CAP) {
        return;
      }
      if (passiveStacks <= 0) {
        return;
      }
      if (this.weapons.some((weapon) => weapon.id === evolution.resultWeaponId)) {
        return;
      }

      labels.push(resultWeapon.name);
    });

    return labels;
  }

  private getWeaponUpgradeOptions(): LevelUpOption[] {
    return this.weapons
      .filter((weapon) => weapon.level < WEAPON_LEVEL_CAP)
      .map((weapon) => ({
        kind: "weapon-upgrade",
        weaponId: weapon.id,
        label: `Upgrade ${weapon.data.name} -> Lv.${weapon.level + 1}`
      }));
  }

  private applyLevelUpOption(option: LevelUpOption) {
    if (option.kind === "weapon-add") {
      this.addWeaponById(option.weaponId);
      return;
    }

    if (option.kind === "weapon-upgrade") {
      this.upgradeWeapon(option.weaponId);
      return;
    }

    if (option.kind === "evolve") {
      this.evolveWeapon(option.baseId, option.resultId);
      return;
    }

    if (option.kind === "heal") {
      this.playerHealth = Math.min(this.playerStats.maxHealth, this.playerHealth + 20);
      return;
    }

    const passive = option.passive;
    const currentStacks = this.passiveStacks.get(passive.id) ?? 0;
    if (currentStacks >= passive.maxStacks) {
      return;
    }

    this.passiveStacks.set(passive.id, currentStacks + 1);
    this.applyPassiveStat(passive);
  }

  private applyPassiveStat(passive: PassiveData) {
    const stat = passive.stat;
    this.playerStats[stat] += passive.value;

    if (stat === "maxHealth") {
      this.playerHealth += passive.value;
    }

    if (stat === "cooldownReduction") {
      this.playerStats.cooldownReduction = Phaser.Math.Clamp(this.playerStats.cooldownReduction, 0, 0.6);
      this.resetAllWeaponTimers();
    }
  }

  private addWeaponById(weaponId: string) {
    const data = this.getWeaponData(weaponId);
    if (!data || this.weapons.some((weapon) => weapon.id === data.id)) {
      return;
    }

    const weapon: WeaponState = {
      id: data.id,
      data,
      level: 1,
      stats: this.computeWeaponStats(data, 1)
    };

    this.weapons.push(weapon);
    this.resetWeaponTimer(weapon);
  }

  private upgradeWeapon(weaponId: string) {
    const weapon = this.weapons.find((entry) => entry.id === weaponId);
    if (!weapon || weapon.level >= WEAPON_LEVEL_CAP) {
      return;
    }

    weapon.level += 1;
    weapon.stats = this.computeWeaponStats(weapon.data, weapon.level);
    this.resetWeaponTimer(weapon);
  }

  private evolveWeapon(baseId: string, resultId: string) {
    const baseIndex = this.weapons.findIndex((weapon) => weapon.id === baseId);
    const result = this.getWeaponData(resultId);
    if (baseIndex === -1 || !result) {
      return;
    }

    const baseWeapon = this.weapons[baseIndex];
    baseWeapon.timer?.remove(false);
    this.weapons.splice(baseIndex, 1);

    const evolved: WeaponState = {
      id: result.id,
      data: result,
      level: 1,
      stats: this.computeWeaponStats(result, 1)
    };

    this.weapons.push(evolved);
    this.resetWeaponTimer(evolved);
  }

  private getWeaponData(weaponId: string) {
    return WEAPON_POOL.find((weapon) => weapon.id === weaponId);
  }

  private resetWeaponTimer(weapon: WeaponState) {
    if (weapon.timer) {
      weapon.timer.remove(false);
    }

    weapon.timer = this.time.addEvent({
      delay: this.getEffectiveCooldownMs(weapon.stats),
      loop: true,
      callback: () => this.fireWeapon(weapon)
    });

    weapon.timer.paused = this.isPaused;
  }

  private resetAllWeaponTimers() {
    this.weapons.forEach((weapon) => this.resetWeaponTimer(weapon));
  }

  private updateRegen(delta: number) {
    if (this.playerStats.regen <= 0) {
      return;
    }

    const heal = (this.playerStats.regen * delta) / 1000;
    this.playerHealth = Math.min(this.playerStats.maxHealth, this.playerHealth + heal);
  }

  private updateHud() {
    const elapsedSeconds = Math.floor(this.runTimeMs / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const totalSeconds = Math.floor(this.stageDurationMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalRemainder = totalSeconds % 60;
    const waveIndex = this.currentWaveIndex + 1;

    const leftLines = [
      `Stage ${this.stageData.name}`,
      `Time ${minutes}:${seconds.toString().padStart(2, "0")} / ${totalMinutes}:${totalRemainder
        .toString()
        .padStart(2, "0")}`,
      `Wave ${waveIndex}/${this.waves.segments.length}`,
      `HP ${Math.ceil(this.playerHealth)}/${Math.ceil(this.playerStats.maxHealth)}`,
      `Level ${this.level} (XP ${this.xp}/${this.xpToNext})`,
      `Kills ${this.kills}`
    ];

    this.hudText.setText(leftLines);

    const weaponLines = this.weapons.map(
      (weapon, index) => `${index + 1}. ${weapon.data.name} Lv.${weapon.level}`
    );

    const passiveLines = Array.from(this.passiveStacks.entries())
      .map(([id, stacks]) => ({ id, stacks }))
      .filter((entry) => entry.stacks > 0)
      .map((entry) => {
        const passive = PASSIVE_POOL.find((item) => item.id === entry.id);
        return passive ? `${passive.name} x${entry.stacks}` : `${entry.id} x${entry.stacks}`;
      });

    const evolutionsReady = this.getEvolutionReadyLabels();
    const evolutionLabel = evolutionsReady.length > 0 ? evolutionsReady.join(", ") : "None";

    const rightLines = [
      `Character ${this.characterData.name}`,
      `Slots ${this.weapons.length}/${this.weaponSlotsMax}`,
      "Weapons:",
      ...(weaponLines.length > 0 ? weaponLines : ["- None"]),
      "Passives:",
      ...(passiveLines.length > 0 ? passiveLines : ["- None"]),
      `Evolution Ready: ${evolutionLabel}`,
      "H: Help  O: Options"
    ];

    this.hudSideText.setText(rightLines);

    this.layoutHud(leftLines.length, rightLines.length);
  }

  private layoutHud(leftLines: number, rightLines: number) {
    const width = this.scale.width;
    const height = this.scale.height;
    const isNarrow = width < 900;

    const leftPanelWidth = Math.min(260, width - 32);
    const leftHeight = 18 + leftLines * 16;
    this.hudPanel.setPosition(16, 12);
    this.hudPanel.setSize(leftPanelWidth, leftHeight);
    this.hudText.setPosition(24, 18);

    const rightPanelWidth = isNarrow ? Math.min(360, width - 32) : 360;
    const rightHeight = 18 + rightLines * 15;
    const rightX = width - 16;
    const rightY = isNarrow ? height - rightHeight - 16 : 12;

    this.hudSidePanel.setPosition(rightX, rightY);
    this.hudSidePanel.setSize(rightPanelWidth, rightHeight);
    this.hudSideText.setPosition(width - 24, rightY + 6);

    this.layoutGuide();
  }

  private updateWave() {
    const elapsedSeconds = this.runTimeMs / 1000;
    const nextIndex = this.waves.segments.findIndex(
      (segment) => elapsedSeconds >= segment.start && elapsedSeconds < segment.end
    );

    if (nextIndex !== -1 && nextIndex !== this.currentWaveIndex) {
      this.currentWaveIndex = nextIndex;
      this.resetSpawnTimer();
    }
  }

  private spawnBossesIfNeeded() {
    const elapsedSeconds = this.runTimeMs / 1000;
    this.waves.bosses.forEach((boss) => {
      const key = `${boss.type}-${boss.time}`;
      if (elapsedSeconds >= boss.time && !this.bossesSpawned.has(key)) {
        this.bossesSpawned.add(key);
        this.spawnEnemy(boss.type);
      }
    });
  }

  private getCurrentWave() {
    return this.waves.segments[this.currentWaveIndex] ?? this.waves.segments[0];
  }

  private resetSpawnTimer() {
    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
    }

    this.spawnTimer = this.time.addEvent({
      delay: this.getCurrentWave().spawnDelay,
      loop: true,
      callback: this.spawnFromWave,
      callbackScope: this
    });

    this.spawnTimer.paused = this.isPaused;
  }

  private getEffectiveCooldownMs(stats: WeaponStats) {
    const cooldownScale = 1 - Phaser.Math.Clamp(this.playerStats.cooldownReduction, 0, 0.6);
    const cooldown = Math.max(0.1, stats.cooldown * cooldownScale);
    return cooldown * 1000;
  }

  private computeWeaponStats(data: WeaponData, level: number): WeaponStats {
    const stats: WeaponStats = {
      damage: data.baseDamage,
      cooldown: data.cooldown,
      range: data.range,
      projectiles: data.projectiles,
      pierce: data.pierce
    };

    data.levelUp.forEach((upgrade) => {
      if (upgrade.level <= level) {
        if (upgrade.damage) {
          stats.damage += upgrade.damage;
        }
        if (upgrade.cooldown) {
          stats.cooldown += upgrade.cooldown;
        }
        if (upgrade.range) {
          stats.range += upgrade.range;
        }
        if (upgrade.projectiles) {
          stats.projectiles += upgrade.projectiles;
        }
        if (upgrade.pierce) {
          stats.pierce += upgrade.pierce;
        }
      }
    });

    return stats;
  }

  private getNearestEnemy(): Phaser.Physics.Arcade.Sprite | null {
    let nearest: Phaser.Physics.Arcade.Sprite | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    this.enemies.children.iterate((child) => {
      if (!child) {
        return null;
      }

      const enemy = child as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) {
        return null;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = enemy;
      }

      return null;
    });

    return nearest;
  }

  private getXpToNext(level: number) {
    return Math.floor(12 * Math.pow(level, 1.2) + 8);
  }

  private setPaused(paused: boolean) {
    this.isPaused = paused;
    this.spawnTimer.paused = paused;
    this.weapons.forEach((weapon) => {
      if (weapon.timer) {
        weapon.timer.paused = paused;
      }
    });

    if (paused) {
      this.physics.world.pause();
    } else {
      this.physics.world.resume();
    }
  }

  private endRun(result: "victory" | "defeat") {
    if (this.isEnding) {
      return;
    }

    this.isEnding = true;
    this.setPaused(true);

    const summary: RunResult = {
      result,
      timeMs: this.runTimeMs,
      level: this.level,
      kills: this.kills,
      stageId: this.stageData.id,
      characterId: this.characterData.id
    };

    this.scene.start("Results", summary);
  }

  private spawnHitEffect(x: number, y: number, color: number, scale = 1) {
    const circle = this.add.circle(x, y, 4 * scale, color, 0.9);
    circle.setDepth(1500);

    this.tweens.add({
      targets: circle,
      alpha: 0,
      scale: 2.2 * scale,
      duration: 180,
      onComplete: () => circle.destroy()
    });
  }

  private flashEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    const baseTint = enemy.getData("tint") as number;
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(60, () => enemy.setTint(baseTint));
  }

  private createGuide() {
    const panel = this.add
      .rectangle(0, 0, 300, 150, UI_PANEL_COLOR, 0.7)
      .setStrokeStyle(1, 0x5fd35f)
      .setScrollFactor(0);

    const guideText = this.add
      .text(0, 0, "", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#d8f7d8"
      })
      .setScrollFactor(0);

    guideText.setText([
      "Guide",
      "- Move: WASD / Arrow",
      "- Touch: drag left side",
      "- Auto attack vs nearest",
      "- Click level-up cards",
      "- H: Toggle help",
      "- O: Options"
    ]);

    this.guideContainer = this.add.container(0, 0, [panel, guideText]).setDepth(1500);
    this.layoutGuide();
    this.time.delayedCall(7000, () => this.setGuideVisible(false));
  }

  private layoutGuide() {
    if (!this.guideContainer) {
      return;
    }

    const panel = this.guideContainer.list[0] as Phaser.GameObjects.Rectangle;
    const text = this.guideContainer.list[1] as Phaser.GameObjects.Text;
    const width = this.scale.width;
    const height = this.scale.height;
    const margin = 16;

    const panelWidth = 300;
    const panelHeight = 150;
    panel.setSize(panelWidth, panelHeight);
    panel.setPosition(width - panelWidth / 2 - margin, height - panelHeight / 2 - margin);

    text.setPosition(panel.x - panelWidth / 2 + 16, panel.y - panelHeight / 2 + 12);
  }

  private toggleGuide() {
    if (!this.guideContainer) {
      return;
    }

    const visible = !this.guideContainer.visible;
    this.setGuideVisible(visible);
  }

  private setGuideVisible(visible: boolean) {
    if (!this.guideContainer) {
      return;
    }

    this.guideContainer.setVisible(visible);
    this.guideContainer.setActive(visible);
  }

  private toggleOptionsSafe() {
    if (this.isLevelUpOpen || this.isEnding) {
      return;
    }
    this.toggleOptions();
  }

  private toggleOptions() {
    if (this.isOptionsOpen) {
      this.closeOptions();
      return;
    }

    this.openOptions();
  }

  private openOptions() {
    this.isOptionsOpen = true;
    this.setPaused(true);

    const width = this.scale.width;
    const height = this.scale.height;

    const panel = this.add.rectangle(0, 0, 420, 260, UI_PANEL_COLOR, 0.92);
    panel.setStrokeStyle(2, 0x5fd35f);

    const title = this.add
      .text(0, -96, "OPTIONS", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#5fd35f"
      })
      .setOrigin(0.5);

    const masterLabel = this.add
      .text(-140, -30, "Master", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#f0f7e8"
      })
      .setOrigin(0, 0.5);

    const masterValue = this.add
      .text(40, -30, "", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d8f7d8"
      })
      .setOrigin(0.5);

    const masterMinus = this.add
      .text(110, -30, "-", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#f0f7e8"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const masterPlus = this.add
      .text(150, -30, "+", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#f0f7e8"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    masterMinus.on("pointerdown", () => this.adjustVolume("master", -0.1));
    masterPlus.on("pointerdown", () => this.adjustVolume("master", 0.1));

    const sfxLabel = this.add
      .text(-140, 20, "SFX", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#f0f7e8"
      })
      .setOrigin(0, 0.5);

    const sfxValue = this.add
      .text(40, 20, "", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d8f7d8"
      })
      .setOrigin(0.5);

    const sfxMinus = this.add
      .text(110, 20, "-", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#f0f7e8"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const sfxPlus = this.add
      .text(150, 20, "+", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#f0f7e8"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    sfxMinus.on("pointerdown", () => this.adjustVolume("sfx", -0.1));
    sfxPlus.on("pointerdown", () => this.adjustVolume("sfx", 0.1));

    const hint = this.add
      .text(0, 92, "Press O to close", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#cfe6d6"
      })
      .setOrigin(0.5);

    this.optionTextRefs = { master: masterValue, sfx: sfxValue };
    this.updateOptionText();

    this.optionsContainer = this.add
      .container(width / 2, height / 2, [
        panel,
        title,
        masterLabel,
        masterValue,
        masterMinus,
        masterPlus,
        sfxLabel,
        sfxValue,
        sfxMinus,
        sfxPlus,
        hint
      ])
      .setDepth(2600)
      .setScrollFactor(0);
  }

  private closeOptions() {
    this.optionsContainer?.destroy(true);
    this.optionsContainer = undefined;
    this.optionTextRefs = undefined;
    this.isOptionsOpen = false;
    this.setPaused(false);
  }

  private adjustVolume(channel: "master" | "sfx", delta: number) {
    if (channel === "master") {
      this.masterVolume = Phaser.Math.Clamp(this.masterVolume + delta, 0, 1);
      this.sound.volume = this.masterVolume;
    } else {
      this.sfxVolume = Phaser.Math.Clamp(this.sfxVolume + delta, 0, 1);
      this.playSfx(SFX_KEYS.shoot, 0.15);
    }

    saveSettings({ masterVolume: this.masterVolume, sfxVolume: this.sfxVolume });
    this.updateOptionText();
  }

  private updateOptionText() {
    if (!this.optionTextRefs) {
      return;
    }

    this.optionTextRefs.master.setText(`${Math.round(this.masterVolume * 100)}%`);
    this.optionTextRefs.sfx.setText(`${Math.round(this.sfxVolume * 100)}%`);
  }

  private playSfx(key: string, volume: number) {
    if (this.sfxVolume <= 0 || this.sound.locked) {
      return;
    }

    this.sound.play(key, { volume: this.sfxVolume * volume });
  }

  private handleResize() {
    if (this.slowZoneGraphics) {
      this.slowZoneGraphics.destroy();
      this.slowZoneGraphics = undefined;
      this.slowZones = [];
      this.setupSlowZones();
    }

    this.updateHud();
  }

  private fillOptions(target: LevelUpOption[], options: LevelUpOption[], count: number) {
    const pool = options.slice();
    while (target.length < count && pool.length > 0) {
      const index = Phaser.Math.Between(0, pool.length - 1);
      target.push(pool.splice(index, 1)[0]);
    }
  }

  private getRarityWeight(rarity: string) {
    return RARITY_WEIGHTS[rarity] ?? 1;
  }

  private pickWeighted<T>(items: T[], weightFn: (item: T) => number) {
    const total = items.reduce((sum, item) => sum + weightFn(item), 0);
    if (total <= 0) {
      return null;
    }

    let roll = Phaser.Math.FloatBetween(0, total);
    for (const item of items) {
      roll -= weightFn(item);
      if (roll <= 0) {
        return item;
      }
    }

    return items[items.length - 1] ?? null;
  }

  private pickWeightedIndex<T>(items: T[], weightFn: (item: T) => number) {
    const total = items.reduce((sum, item) => sum + weightFn(item), 0);
    if (total <= 0) {
      return null;
    }

    let roll = Phaser.Math.FloatBetween(0, total);
    for (let index = 0; index < items.length; index += 1) {
      roll -= weightFn(items[index]);
      if (roll <= 0) {
        return { item: items[index], index };
      }
    }

    if (items.length === 0) {
      return null;
    }

    return { item: items[items.length - 1], index: items.length - 1 };
  }

  private randomEdgePoint(padding: number) {
    const width = this.scale.width as number;
    const height = this.scale.height as number;
    const side = Phaser.Math.Between(0, 3);

    switch (side) {
      case 0:
        return { x: -padding, y: Phaser.Math.Between(0, height) };
      case 1:
        return { x: width + padding, y: Phaser.Math.Between(0, height) };
      case 2:
        return { x: Phaser.Math.Between(0, width), y: -padding };
      default:
        return { x: Phaser.Math.Between(0, width), y: height + padding };
    }
  }

  private getPlayerScale() {
    const scale = Phaser.Math.Clamp(this.playerStats.maxHealth / 100, 0.9, 1.2);
    return scale;
  }
}
