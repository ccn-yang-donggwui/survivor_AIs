// 게임 씬 - 메인 게임 로직

import Phaser from 'phaser';
import { GAME, PLAYER, DEPTH, COLORS, EXPERIENCE } from '../config/Constants';
import charactersData from '../data/characters.json';
import weaponsData from '../data/weapons.json';
import passivesData from '../data/passives.json';
import type { CharacterData } from '../types/DataTypes';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { ExpGem } from '../entities/ExpGem';
import { DropItem } from '../entities/DropItem';
import { WaveManager } from '../systems/WaveManager';
import { EvolutionSystem } from '../systems/EvolutionSystem';
import { metaStore } from '../systems/MetaStore';
import { settingsStore } from '../systems/SettingsStore';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { TouchButton } from '../ui/TouchButton';
import { getSoundManager } from '../utils/SoundManager';

export class GameScene extends Phaser.Scene {
  // 엔티티
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private expGems!: Phaser.Physics.Arcade.Group;
  private drops!: Phaser.Physics.Arcade.Group;

  // 시스템
  private waveManager!: WaveManager;
  private evolutionSystem!: EvolutionSystem;

  // UI
  private joystick!: VirtualJoystick;

  // 게임 상태
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private goldEarned: number = 0;

  // 일시정지 UI
  private pauseButtons: TouchButton[] = [];

  // 입력
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 게임 상태 초기화
    this.isPaused = false;
    this.isGameOver = false;
    this.goldEarned = 0;
    this.pauseButtons = [];

    // 배경
    this.createBackground();

    // 물리 그룹
    this.createGroups();

    // 플레이어 생성
    this.createPlayer();

    // 시스템 초기화
    this.initializeSystems();

    // 입력 설정
    this.setupInput();

    // 충돌 설정
    this.setupCollisions();

    // 이벤트 리스너
    this.setupEventListeners();

    // 카메라 설정
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.fadeIn(300);

    // BGM
    getSoundManager()?.playBgm('bgm_game');

    // 시작
    this.waveManager.start();
  }

  private createBackground(): void {
    // 타일맵 배경 (무한 반복)
    const tileSize = 16;
    const worldSize = GAME.WORLD_SIZE;

    // 그리드 패턴
    const graphics = this.add.graphics();
    graphics.setDepth(DEPTH.BACKGROUND);

    for (let x = -worldSize; x < worldSize; x += tileSize) {
      for (let y = -worldSize; y < worldSize; y += tileSize) {
        const isDark = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
        graphics.fillStyle(isDark ? 0x1a1c2c : 0x29366f, 1);
        graphics.fillRect(x, y, tileSize, tileSize);
      }
    }

    // 월드 경계 표시
    graphics.lineStyle(4, 0xef7d57, 0.5);
    graphics.strokeRect(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
  }

  private createGroups(): void {
    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    this.projectiles = this.physics.add.group({
      classType: Projectile,
      runChildUpdate: true,
    });

    this.expGems = this.physics.add.group({
      classType: ExpGem,
      runChildUpdate: true,
    });

    this.drops = this.physics.add.group({
      classType: DropItem,
      runChildUpdate: true,
    });

    // 씬 데이터에 저장 (무기에서 참조용)
    this.data.set('projectiles', this.projectiles);
    this.data.set('enemies', this.enemies);
  }

  private createPlayer(): void {
    const characterId = this.registry.get('selectedCharacter') || 'knight';

    // 캐릭터 데이터 찾기
    const charData = (charactersData as any).characters.find(
      (c: CharacterData) => c.id === characterId
    ) as CharacterData;

    if (!charData) {
      console.error(`Character not found: ${characterId}`);
      return;
    }

    this.player = new Player(this, 0, 0, charData);
    this.player.setDepth(DEPTH.PLAYER);

    // 시작 무기 추가
    this.player.addWeapon(charData.startingWeaponId || 'dagger');

    // 플레이어 참조를 씬 데이터에 저장
    this.data.set('player', this.player);
  }

  private initializeSystems(): void {
    // 웨이브 매니저
    this.waveManager = new WaveManager(this, this.player, this.enemies);
    this.waveManager.loadWaveData();

    // 진화 시스템
    this.evolutionSystem = new EvolutionSystem(this);
    this.evolutionSystem.loadEvolutionData();
  }

  private setupInput(): void {
    // 키보드
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard?.addKeys('W,A,S,D');

    // ESC로 일시정지
    this.input.keyboard?.on('keydown-ESC', () => {
      this.togglePause();
    });

    // 모바일 조이스틱
    const { width, height } = this.cameras.main;
    this.joystick = new VirtualJoystick(this, 100, height - 100, 50, true);

    // 모바일 감지
    if (!this.sys.game.device.os.desktop) {
      this.joystick.setVisible(true);
    }
  }

  private setupCollisions(): void {
    // 투사체 vs 적
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.onProjectileHitEnemy,
      undefined,
      this
    );

    // 플레이어 vs 적
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.onPlayerHitEnemy,
      undefined,
      this
    );

    // 플레이어 vs 경험치
    this.physics.add.overlap(
      this.player,
      this.expGems,
      this.onPlayerCollectExp,
      undefined,
      this
    );

    // 플레이어 vs 드랍 아이템
    this.physics.add.overlap(
      this.player,
      this.drops,
      this.onPlayerCollectDrop,
      undefined,
      this
    );
  }

  private setupEventListeners(): void {
    // 적 처치
    this.events.on('enemyKilled', this.onEnemyKilled, this);

    // 레벨업
    this.events.on('playerLevelUp', this.onPlayerLevelUp, this);

    // 플레이어 사망
    this.events.on('playerDied', this.onPlayerDied, this);

    // 웨이브 변경
    this.events.on('waveChanged', this.onWaveChanged, this);

    // 보스 스폰
    this.events.on('bossSpawned', this.onBossSpawned, this);

    // 진화
    this.events.on('weaponEvolved', this.onWeaponEvolved, this);
  }

  update(time: number, delta: number): void {
    if (this.isPaused || this.isGameOver) return;

    // 입력 처리
    this.handleInput();

    // 플레이어 업데이트
    this.player.update(time, delta);

    // 웨이브 매니저 업데이트
    this.waveManager.update(time, delta);

    // 경험치 젬 pickup 범위 체크 및 업데이트
    this.updateExpGems(time, delta);

    // 적 업데이트
    this.updateEnemies(time, delta);

    // 월드 경계 체크
    this.checkWorldBounds();

    // UI 씬에 데이터 전달
    this.updateUIData();
  }

  private updateExpGems(time: number, delta: number): void {
    const pickupRange = this.player.stats.pickupRange;

    this.expGems.getChildren().forEach(gem => {
      const g = gem as ExpGem;
      if (!g.active) return;

      // pickup 범위 내에 있으면 끌어당기기 시작
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        g.x, g.y
      );

      if (distance < pickupRange && !g.isCollecting()) {
        g.startCollecting(this.player);
      }

      // 젬 업데이트
      g.update(time, delta);
    });
  }

  private updateEnemies(time: number, delta: number): void {
    this.enemies.getChildren().forEach(enemy => {
      const e = enemy as Enemy;
      if (e.active) {
        e.update(time, delta);
      }
    });
  }

  private handleInput(): void {
    let dx = 0;
    let dy = 0;

    // 키보드 입력
    const keys = this.input.keyboard?.addKeys('W,A,S,D') as any;

    if (this.cursors.left.isDown || keys?.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || keys?.D.isDown) dx += 1;
    if (this.cursors.up.isDown || keys?.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || keys?.S.isDown) dy += 1;

    // 조이스틱 입력
    if (this.joystick.isJoystickActive()) {
      const dir = this.joystick.getDirection();
      dx = dir.x;
      dy = dir.y;
    }

    // 플레이어 이동
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      const speed = this.player.stats.moveSpeed;
      this.player.setVelocity(dx * speed, dy * speed);
      this.player.lastDirection = { x: dx, y: dy };
    } else {
      this.player.setVelocity(0, 0);
    }
  }

  private checkWorldBounds(): void {
    const bounds = GAME.WORLD_SIZE;
    this.player.x = Phaser.Math.Clamp(this.player.x, -bounds, bounds);
    this.player.y = Phaser.Math.Clamp(this.player.y, -bounds, bounds);
  }

  private updateUIData(): void {
    this.registry.set('playerHP', this.player.stats.currentHP);
    this.registry.set('playerMaxHP', this.player.stats.maxHP);
    this.registry.set('playerLevel', this.player.level);
    this.registry.set('playerExp', this.player.currentExp);
    this.registry.set('playerExpToNext', this.player.expToNextLevel);
    this.registry.set('gameTime', this.waveManager.getGameTimeFormatted());
    this.registry.set('killCount', this.waveManager.getKillCount());
    this.registry.set('currentWave', this.waveManager.getCurrentWave());
    this.registry.set('goldEarned', this.goldEarned);
  }

  // 충돌 콜백
  private onProjectileHitEnemy(
    projectile: Phaser.GameObjects.GameObject,
    enemy: Phaser.GameObjects.GameObject
  ): void {
    const proj = projectile as Projectile;
    const en = enemy as Enemy;

    if (!proj.active || !en.active) return;

    const enemyId = en.getData('enemyId') || en.getData('objectId');
    const canHit = proj.onHitEnemy(enemyId);

    if (canHit) {
      // 폭발형 무기에서 이미 적이 처리되었을 수 있으므로 재확인
      if (!en.active || !en.scene) return;

      const damage = proj.damage;
      const isDead = en.takeDamage(damage);

      // 데미지 숫자 표시
      if (settingsStore.isShowDamageNumbers()) {
        this.showDamageNumber(en.x, en.y, damage);
      }

      // 넉백
      const knockback = proj.getData('knockback');
      if (knockback && !isDead) {
        const angle = Math.atan2(en.y - proj.y, en.x - proj.x);
        en.x += Math.cos(angle) * knockback;
        en.y += Math.sin(angle) * knockback;
      }

      if (isDead) {
        this.events.emit('enemyKilled', en);
      }
    }
  }

  private onPlayerHitEnemy(
    player: Phaser.GameObjects.GameObject,
    enemy: Phaser.GameObjects.GameObject
  ): void {
    const p = player as Player;
    const e = enemy as Enemy;

    // 이미 게임오버거나 무적이면 무시
    if (this.isGameOver || !e.active || p.isInvincible) return;

    const damage = e.damage;
    const isDead = p.takeDamage(damage);

    // 플레이어 사망 체크
    if (isDead) {
      this.events.emit('playerDied');
      return;
    }

    // 화면 흔들기
    if (settingsStore.isScreenShakeEnabled()) {
      this.cameras.main.shake(100, 0.01);
    }

    getSoundManager()?.playSfx('sfx_hit');
  }

  private onPlayerCollectExp(
    player: Phaser.GameObjects.GameObject,
    gem: Phaser.GameObjects.GameObject
  ): void {
    const g = gem as ExpGem;
    if (!g.active) return;

    const exp = g.expValue;
    this.player.addExp(exp);
    g.destroy();

    getSoundManager()?.playSfx('sfx_pickup');
  }

  private onPlayerCollectDrop(
    player: Phaser.GameObjects.GameObject,
    drop: Phaser.GameObjects.GameObject
  ): void {
    const d = drop as DropItem;
    if (!d.active) return;

    const type = d.dropType;

    switch (type) {
      case 'health':
        this.player.heal(d.value);
        break;
      case 'coin':
        this.goldEarned += d.value;
        break;
      case 'magnet':
        this.collectAllExp();
        break;
      case 'chest':
        // 보물 상자는 레벨업 트리거
        this.events.emit('playerLevelUp');
        break;
    }

    d.destroy();
    getSoundManager()?.playSfx('sfx_pickup');
  }

  // 이벤트 핸들러
  private onEnemyKilled(enemy: Enemy): void {
    const x = enemy.x;
    const y = enemy.y;
    const exp = enemy.expValue;
    const isBoss = enemy.getData('isBoss');

    // 경험치 젬 드랍
    this.spawnExpGem(x, y, exp);

    // 랜덤 드랍
    if (Math.random() < 0.05) {
      this.spawnDrop(x, y);
    }

    // 보스 추가 보상
    if (isBoss) {
      for (let i = 0; i < 10; i++) {
        const offsetX = x + (Math.random() - 0.5) * 100;
        const offsetY = y + (Math.random() - 0.5) * 100;
        this.spawnExpGem(offsetX, offsetY, 10);
      }
      this.goldEarned += 100;
    }

    this.waveManager.registerKill();
    enemy.destroy();

    getSoundManager()?.playSfx('sfx_kill');
  }

  private onPlayerLevelUp(): void {
    // 진화 가능 여부 체크
    const availableEvolutions = this.evolutionSystem.getAvailableEvolutions(
      this.player.getWeapons(),
      this.player.getPassives()
    );

    if (availableEvolutions.length > 0) {
      // 진화 선택 화면
      this.scene.pause();
      this.scene.launch('EvolutionScene', {
        evolutions: availableEvolutions,
        player: this.player,
        evolutionSystem: this.evolutionSystem,
      });
    } else {
      // 일반 레벨업 선택 화면
      this.scene.pause();
      this.scene.launch('LevelUpScene', {
        player: this.player,
      });
    }

    getSoundManager()?.playSfx('sfx_levelup');
  }

  private onPlayerDied(): void {
    this.isGameOver = true;
    this.waveManager.stop();

    getSoundManager()?.playSfx('sfx_death');

    // 결과 저장
    metaStore.recordGameEnd(
      this.waveManager.getGameTime(),
      this.waveManager.getKillCount(),
      this.goldEarned
    );

    // 결과 화면으로
    this.time.delayedCall(1500, () => {
      this.scene.stop('UIScene');
      this.scene.start('ResultsScene', {
        survivalTime: this.waveManager.getGameTime(),
        killCount: this.waveManager.getKillCount(),
        goldEarned: this.goldEarned,
        maxLevel: this.player.level,
      });
    });
  }

  private onWaveChanged(wave: number): void {
    // UI 씬에 알림
    this.registry.set('currentWave', wave);
  }

  private onBossSpawned(bossType: string): void {
    getSoundManager()?.playBgm('bgm_boss');
  }

  private onWeaponEvolved(data: any): void {
    getSoundManager()?.playSfx('sfx_evolution');
  }

  // 유틸리티
  private spawnExpGem(x: number, y: number, value: number): void {
    const gem = new ExpGem(this, x, y, value);
    this.expGems.add(gem);
  }

  private spawnDrop(x: number, y: number): void {
    const types: Array<'health' | 'coin'> = ['health', 'coin'];
    const type = Phaser.Utils.Array.GetRandom(types);
    const value = type === 'health' ? 20 : 10;

    const drop = new DropItem(this, x, y, { type, value });
    this.drops.add(drop);
  }

  private collectAllExp(): void {
    this.expGems.getChildren().forEach(gem => {
      const g = gem as ExpGem;
      g.startCollecting(this.player);
    });
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.add.text(x, y - 20, Math.floor(damage).toString(), {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    text.setOrigin(0.5);
    text.setDepth(DEPTH.EFFECTS);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  private togglePause(): void {
    if (this.isGameOver) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      getSoundManager()?.pauseBgm();
      getSoundManager()?.playSfx('sfx_pause');

      const { width, height } = this.cameras.main;
      const screenCenterX = width / 2;
      const screenCenterY = height / 2;

      // 일시정지 오버레이
      const pauseOverlay = this.add.graphics();
      pauseOverlay.fillStyle(0x000000, 0.85);
      pauseOverlay.fillRect(0, 0, width, height);
      pauseOverlay.setDepth(DEPTH.UI + 10);
      pauseOverlay.setScrollFactor(0);
      pauseOverlay.setName('pauseOverlay');

      // === 상단: 타이틀 ===
      const pauseText = this.add.text(screenCenterX, screenCenterY - 180, 'PAUSED', {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      pauseText.setOrigin(0.5);
      pauseText.setDepth(DEPTH.UI + 11);
      pauseText.setScrollFactor(0);
      pauseText.setName('pauseText');

      // === 슬롯 공통 설정 ===
      const slotSize = 50;
      const spacing = 6;
      const maxSlots = 6;
      const totalSlotsWidth = maxSlots * slotSize + (maxSlots - 1) * spacing;
      const slotsStartX = -totalSlotsWidth / 2 + slotSize / 2;

      // === 무기 슬롯 ===
      const playerWeapons = this.player.getWeapons();
      const weaponsContainer = this.add.container(screenCenterX, screenCenterY - 110);
      weaponsContainer.setDepth(DEPTH.UI + 11);
      weaponsContainer.setScrollFactor(0);
      weaponsContainer.setName('pauseWeaponsContainer');

      // 무기 타이틀
      const weaponsTitle = this.add.text(0, -30, 'WEAPONS', {
        fontSize: '12px',
        color: '#41a6f6',
        fontFamily: 'monospace',
      });
      weaponsTitle.setOrigin(0.5);
      weaponsContainer.add(weaponsTitle);

      // 무기 슬롯들
      for (let i = 0; i < maxSlots; i++) {
        const x = slotsStartX + i * (slotSize + spacing);
        const y = 0;
        const weapon = playerWeapons[i];

        // 슬롯 배경
        const slotBg = this.add.graphics();
        if (weapon) {
          slotBg.fillStyle(0x2a2a3a, 1);
          slotBg.fillRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 6);
          slotBg.lineStyle(2, weapon.isEvolved ? 0xffcd75 : 0x41a6f6, 1);
          slotBg.strokeRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 6);
        } else {
          slotBg.fillStyle(0x1a1a2a, 0.5);
          slotBg.fillRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 6);
          slotBg.lineStyle(1, 0x333344, 0.5);
          slotBg.strokeRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 6);
        }
        weaponsContainer.add(slotBg);

        if (weapon) {
          const weaponInfo = (weaponsData as any).weapons.find((w: any) => w.id === weapon.id);
          const iconKey = weaponInfo?.icon || `weapon_${weapon.id}`;

          if (this.textures.exists(iconKey)) {
            const icon = this.add.sprite(x, y - 6, iconKey);
            icon.setDisplaySize(28, 28);
            weaponsContainer.add(icon);
          }

          const levelText = this.add.text(x, y + 16, `Lv.${weapon.level}`, {
            fontSize: '9px',
            color: weapon.isEvolved ? '#ffcd75' : '#ffffff',
            fontFamily: 'monospace',
          });
          levelText.setOrigin(0.5);
          weaponsContainer.add(levelText);

          if (weapon.isEvolved) {
            const badge = this.add.text(x + slotSize / 2 - 2, y - slotSize / 2 + 2, '★', {
              fontSize: '10px',
              color: '#ffcd75',
            });
            badge.setOrigin(1, 0);
            weaponsContainer.add(badge);
          }
        }
      }

      // === 패시브 슬롯 ===
      const playerPassives = this.player.getPassives();
      const passivesContainer = this.add.container(screenCenterX, screenCenterY - 30);
      passivesContainer.setDepth(DEPTH.UI + 11);
      passivesContainer.setScrollFactor(0);
      passivesContainer.setName('pausePassivesContainer');

      // 패시브 타이틀
      const passivesTitle = this.add.text(0, -30, 'PASSIVES', {
        fontSize: '12px',
        color: '#38b764',
        fontFamily: 'monospace',
      });
      passivesTitle.setOrigin(0.5);
      passivesContainer.add(passivesTitle);

      // 패시브 슬롯들
      for (let i = 0; i < maxSlots; i++) {
        const x = slotsStartX + i * (slotSize + spacing);
        const y = 0;
        const passive = playerPassives[i];

        // 슬롯 배경
        const slotBg = this.add.graphics();
        if (passive) {
          slotBg.fillStyle(0x2a3a2a, 1);
          slotBg.fillRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 6);
          slotBg.lineStyle(2, 0x38b764, 1);
          slotBg.strokeRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 6);
        } else {
          slotBg.fillStyle(0x1a1a2a, 0.5);
          slotBg.fillRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 6);
          slotBg.lineStyle(1, 0x333344, 0.5);
          slotBg.strokeRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 6);
        }
        passivesContainer.add(slotBg);

        if (passive) {
          const passiveInfo = (passivesData as any).passives.find((p: any) => p.id === passive.id);
          const iconKey = passiveInfo?.icon || `passive_${passive.id}`;

          if (this.textures.exists(iconKey)) {
            const icon = this.add.sprite(x, y - 6, iconKey);
            icon.setDisplaySize(28, 28);
            passivesContainer.add(icon);
          }

          const levelText = this.add.text(x, y + 16, `Lv.${passive.level}`, {
            fontSize: '9px',
            color: '#ffffff',
            fontFamily: 'monospace',
          });
          levelText.setOrigin(0.5);
          passivesContainer.add(levelText);
        }
      }

      // === 게임 정보 ===
      const infoContainer = this.add.container(screenCenterX, screenCenterY + 55);
      infoContainer.setDepth(DEPTH.UI + 11);
      infoContainer.setScrollFactor(0);
      infoContainer.setName('pauseInfoContainer');

      const infoBg = this.add.graphics();
      infoBg.fillStyle(0x1a1a2a, 0.9);
      infoBg.fillRoundedRect(-120, -28, 240, 56, 10);
      infoContainer.add(infoBg);

      const goldIcon = this.add.text(-80, 0, '💰', { fontSize: '18px' });
      goldIcon.setOrigin(0.5);
      infoContainer.add(goldIcon);

      const goldText = this.add.text(-50, 0, `${this.goldEarned}`, {
        fontSize: '18px',
        color: '#ffcd75',
        fontFamily: 'monospace',
      });
      goldText.setOrigin(0, 0.5);
      infoContainer.add(goldText);

      const levelIcon = this.add.text(20, 0, '⭐', { fontSize: '18px' });
      levelIcon.setOrigin(0.5);
      infoContainer.add(levelIcon);

      const levelText = this.add.text(50, 0, `Lv.${this.player.level}`, {
        fontSize: '18px',
        color: '#41a6f6',
        fontFamily: 'monospace',
      });
      levelText.setOrigin(0, 0.5);
      infoContainer.add(levelText);

      // === 하단 영역: 버튼 ===
      const buttonY = screenCenterY + 120;

      // Resume 버튼
      const resumeButton = new TouchButton(this, {
        x: screenCenterX,
        y: buttonY,
        width: 200,
        height: 50,
        label: 'Resume',
        fontSize: 20,
        backgroundColor: 0x38b764,
        borderColor: 0x38b764,
      });
      resumeButton.setDepth(DEPTH.UI + 12);
      resumeButton.onRelease(() => {
        getSoundManager()?.playSfx('sfx_button');
        this.togglePause();
      });
      this.pauseButtons.push(resumeButton);

      // Exit 버튼
      const exitButton = new TouchButton(this, {
        x: screenCenterX,
        y: buttonY + 60,
        width: 200,
        height: 50,
        label: 'Exit to Menu',
        fontSize: 18,
        backgroundColor: 0x5d275d,
        borderColor: 0xb13e53,
      });
      exitButton.setDepth(DEPTH.UI + 12);
      exitButton.onRelease(() => {
        getSoundManager()?.playSfx('sfx_button');
        this.exitToMenu();
      });
      this.pauseButtons.push(exitButton);

      // 힌트 텍스트
      const hintText = this.add.text(screenCenterX, height - 30, 'Press ESC to resume', {
        fontSize: '12px',
        color: '#666666',
        fontFamily: 'monospace',
      });
      hintText.setOrigin(0.5);
      hintText.setDepth(DEPTH.UI + 11);
      hintText.setScrollFactor(0);
      hintText.setName('pauseHintText');
    } else {
      this.physics.resume();
      getSoundManager()?.resumeBgm();

      // 오버레이 및 UI 제거
      this.children.getByName('pauseOverlay')?.destroy();
      this.children.getByName('pauseText')?.destroy();
      this.children.getByName('pauseInfoContainer')?.destroy();
      this.children.getByName('pauseHintText')?.destroy();
      this.children.getByName('pauseWeaponsContainer')?.destroy();
      this.children.getByName('pausePassivesContainer')?.destroy();

      // 버튼 제거
      this.pauseButtons.forEach(b => b.destroy());
      this.pauseButtons = [];
    }
  }

  private exitToMenu(): void {
    // 현재까지 획득한 골드 저장
    if (this.goldEarned > 0) {
      metaStore.recordGameEnd(
        this.waveManager.getGameTime(),
        this.waveManager.getKillCount(),
        this.goldEarned
      );
    }

    // 정리
    this.isPaused = false;
    this.physics.resume();

    // 일시정지 UI 제거
    this.children.getByName('pauseOverlay')?.destroy();
    this.children.getByName('pauseText')?.destroy();
    this.children.getByName('pauseInfoContainer')?.destroy();
    this.children.getByName('pauseHintText')?.destroy();
    this.children.getByName('pauseWeaponsContainer')?.destroy();
    this.children.getByName('pausePassivesContainer')?.destroy();
    this.pauseButtons.forEach(b => b.destroy());
    this.pauseButtons = [];

    // 씬 전환
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  shutdown(): void {
    this.events.off('enemyKilled', this.onEnemyKilled, this);
    this.events.off('playerLevelUp', this.onPlayerLevelUp, this);
    this.events.off('playerDied', this.onPlayerDied, this);
    this.events.off('waveChanged', this.onWaveChanged, this);
    this.events.off('bossSpawned', this.onBossSpawned, this);
    this.events.off('weaponEvolved', this.onWeaponEvolved, this);

    // 키보드 이벤트 제거
    this.input.keyboard?.off('keydown-ESC');

    // UI 정리
    this.pauseButtons.forEach(b => b.destroy());
    this.pauseButtons = [];
    this.joystick?.destroy();
  }
}
