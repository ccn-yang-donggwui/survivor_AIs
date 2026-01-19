// 웨이브 매니저 - 적 스폰 및 난이도 관리

import Phaser from 'phaser';
import { GAME, ENEMIES } from '../config/Constants';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import type { BossAbility } from '../entities/Boss';
import { Player } from '../entities/Player';
import wavesJson from '../data/waves.json';

export interface EnemyConfig {
  id: string;
  texture: string;
  hp: number;
  damage: number;
  speed: number;
  exp: number;
  behavior: 'chase' | 'charger' | 'ranged' | 'boss';
  scale?: number;
}

export interface WaveConfig {
  time: number;
  enemies: string[];
  spawnRate: number;
  maxEnemies: number;
  bossSpawn?: string;
  rushWave?: boolean;      // 러시 웨이브 여부
  spawnCount?: number;     // 한번에 스폰할 적 수 (기본 1)
}

// JSON 파일의 실제 구조
interface JsonWaveConfig {
  startTime: number;
  endTime: number;
  spawnDelay: number;
  spawnCount: number;
  enemies: { type: string; weight: number }[];
}

export class WaveManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemies: Phaser.Physics.Arcade.Group;

  private waveConfigs: WaveConfig[] = [];
  private enemyConfigs: Record<string, EnemyConfig> = {};

  private currentWaveIndex: number = 0;
  private gameTime: number = 0;
  private spawnTimer: number = 0;
  private killCount: number = 0;

  private difficultyMultiplier: number = 1;
  private isActive: boolean = false;

  constructor(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
  }

  // 데이터 로드 - 항상 기본 데이터 사용 (빠른 템포 설정 적용)
  async loadWaveData(): Promise<void> {
    // JSON 대신 수정된 기본 데이터 사용
    this.loadDefaultData();
  }

  private loadDefaultData(): void {
    // =====================================================
    // 몬스터 설정
    // =====================================================
    // 목표: 10분에 레벨 60 도달 (모든 스킬 맥스 가능)
    // 필요 총 경험치: ~5,300 / 예상 킬 수: ~3,000마리 / 평균 경험치: ~2
    this.enemyConfigs = {
      // === 일반 몬스터 ===
      bat: {
        id: 'bat',
        texture: 'enemy_bat',
        hp: 10,
        damage: 5,
        speed: 120,
        exp: 1,
        behavior: 'chase',
      },
      skeleton: {
        id: 'skeleton',
        texture: 'enemy_skeleton',
        hp: 30,
        damage: 8,
        speed: 95,
        exp: 2,
        behavior: 'charger',
      },
      ghost: {
        id: 'ghost',
        texture: 'enemy_ghost',
        hp: 18,
        damage: 6,
        speed: 80,
        exp: 2,
        behavior: 'ranged',
      },
      slime: {
        id: 'slime',
        texture: 'enemy_slime',
        hp: 45,
        damage: 10,
        speed: 55,
        exp: 3,
        behavior: 'chase',
      },

      // === 엘리트 몬스터 (6분 이후 등장) ===
      elite_bat: {
        id: 'elite_bat',
        texture: 'enemy_bat',
        hp: 35,
        damage: 10,
        speed: 140,
        exp: 3,
        behavior: 'chase',
        scale: 1.3,
      },
      elite_skeleton: {
        id: 'elite_skeleton',
        texture: 'enemy_skeleton',
        hp: 80,
        damage: 14,
        speed: 110,
        exp: 5,
        behavior: 'charger',
        scale: 1.3,
      },
      elite_ghost: {
        id: 'elite_ghost',
        texture: 'enemy_ghost',
        hp: 50,
        damage: 11,
        speed: 95,
        exp: 4,
        behavior: 'ranged',
        scale: 1.3,
      },
      elite_slime: {
        id: 'elite_slime',
        texture: 'enemy_slime',
        hp: 120,
        damage: 16,
        speed: 70,
        exp: 7,
        behavior: 'chase',
        scale: 1.4,
      },

      // === 보스 ===
      miniboss: {
        id: 'miniboss',
        texture: 'enemy_miniboss',
        hp: 350,
        damage: 15,
        speed: 65,
        exp: 30,
        behavior: 'boss',
        scale: 1.5,
      },
      boss: {
        id: 'boss',
        texture: 'enemy_boss',
        hp: 1000,
        damage: 22,
        speed: 55,
        exp: 80,
        behavior: 'boss',
        scale: 2,
      },
    };

    // =====================================================
    // 웨이브 설정 (10분 = 600초)
    // =====================================================
    // 5단계 구성: 입문 → 초반 → 중반 → 후반 → 클라이막스
    // 목표: 레벨 60 도달 → 모든 스킬(무기6+패시브6) 맥스 가능
    this.waveConfigs = [
      // ===== 1단계: 입문 (0-2분) =====
      // 목표: 무기 2~3개, 패시브 1개, 레벨 10~12
      { time: 0, enemies: ['bat'], spawnRate: 500, maxEnemies: 15, spawnCount: 1 },
      { time: 30, enemies: ['bat'], spawnRate: 400, maxEnemies: 25, spawnCount: 2 },
      { time: 60, enemies: ['bat', 'ghost'], spawnRate: 350, maxEnemies: 35, spawnCount: 3 },
      { time: 90, enemies: ['bat', 'ghost'], spawnRate: 300, maxEnemies: 45, spawnCount: 4, rushWave: true },

      // ===== 2단계: 초반 (2-4분) =====
      // 목표: 무기 4개, 패시브 2~3개, 레벨 20~24
      // 3분: 첫 번째 미니보스
      { time: 120, enemies: ['bat', 'skeleton', 'ghost'], spawnRate: 280, maxEnemies: 55, spawnCount: 4 },
      { time: 150, enemies: ['skeleton', 'ghost'], spawnRate: 250, maxEnemies: 65, spawnCount: 5 },
      { time: 180, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 220, maxEnemies: 75, spawnCount: 5, bossSpawn: 'miniboss' },
      { time: 210, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 200, maxEnemies: 85, spawnCount: 6, rushWave: true },

      // ===== 3단계: 중반 (4-6분) =====
      // 목표: 무기 5개, 패시브 4개, 레벨 32~38
      // 5분: 두 번째 미니보스
      { time: 240, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 180, maxEnemies: 95, spawnCount: 6 },
      { time: 270, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 160, maxEnemies: 105, spawnCount: 7 },
      { time: 300, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 140, maxEnemies: 115, spawnCount: 7, bossSpawn: 'miniboss' },
      { time: 330, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 120, maxEnemies: 125, spawnCount: 8, rushWave: true },

      // ===== 4단계: 후반 (6-8분) =====
      // 목표: 무기 6개, 패시브 5개, 레벨 44~50, 진화 시작
      // 7분: 세 번째 미니보스, 엘리트 등장
      { time: 360, enemies: ['skeleton', 'slime', 'elite_bat'], spawnRate: 110, maxEnemies: 135, spawnCount: 8 },
      { time: 390, enemies: ['slime', 'elite_bat', 'elite_skeleton'], spawnRate: 100, maxEnemies: 145, spawnCount: 9 },
      { time: 420, enemies: ['elite_bat', 'elite_skeleton', 'elite_ghost'], spawnRate: 90, maxEnemies: 155, spawnCount: 9, bossSpawn: 'miniboss' },
      { time: 450, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 80, maxEnemies: 165, spawnCount: 10, rushWave: true },

      // ===== 5단계: 클라이막스 (8-10분) =====
      // 목표: 모든 스킬 맥스, 레벨 55~60+
      // 9분: 최종 보스
      { time: 480, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 70, maxEnemies: 180, spawnCount: 10 },
      { time: 510, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 60, maxEnemies: 200, spawnCount: 12, rushWave: true },
      { time: 540, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 60, maxEnemies: 220, spawnCount: 12, bossSpawn: 'boss' },
      { time: 570, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 50, maxEnemies: 250, spawnCount: 14, rushWave: true },
    ];
  }

  start(): void {
    this.isActive = true;
    this.gameTime = 0;
    this.currentWaveIndex = 0;
    this.killCount = 0;
    this.difficultyMultiplier = 1;
  }

  stop(): void {
    this.isActive = false;
  }

  pause(): void {
    this.isActive = false;
  }

  resume(): void {
    this.isActive = true;
  }

  update(time: number, delta: number): void {
    if (!this.isActive) return;

    this.gameTime += delta;
    this.spawnTimer += delta;

    // 난이도 증가 (부드러운 곡선)
    // 0분: 1.0x → 2분: 1.2x → 4분: 1.5x → 6분: 2.0x → 8분: 2.5x → 10분: 3.0x
    const minutes = this.gameTime / 60000;
    this.difficultyMultiplier = 1 + (minutes * 0.2) + (minutes * minutes * 0.01);

    // 웨이브 진행 체크
    this.checkWaveProgression();

    // 적 스폰
    this.checkSpawn();
  }

  private checkWaveProgression(): void {
    const currentWave = this.waveConfigs[this.currentWaveIndex];
    const nextWave = this.waveConfigs[this.currentWaveIndex + 1];

    if (nextWave && this.gameTime / 1000 >= nextWave.time) {
      this.currentWaveIndex++;

      // 보스 스폰
      if (nextWave.bossSpawn) {
        this.spawnBoss(nextWave.bossSpawn);
      }

      // 러시 웨이브 시작
      if (nextWave.rushWave) {
        this.scene.events.emit('rushWaveStarted', this.currentWaveIndex + 1);
        // 러시 웨이브 시작 시 즉시 대량 스폰
        const rushCount = (nextWave.spawnCount || 1) * 3;
        this.spawnSwarm(Phaser.Utils.Array.GetRandom(nextWave.enemies), rushCount);
        // 화면 효과
        this.scene.cameras.main.flash(200, 255, 100, 100, false);
      }

      this.scene.events.emit('waveChanged', this.currentWaveIndex + 1);
    }
  }

  private checkSpawn(): void {
    const currentWave = this.waveConfigs[this.currentWaveIndex];
    if (!currentWave) return;

    // 최대 적 수 체크
    const activeEnemies = this.enemies.getChildren().filter(e => (e as Enemy).active).length;
    if (activeEnemies >= currentWave.maxEnemies) return;

    // 스폰 타이머
    const adjustedSpawnRate = currentWave.spawnRate / this.difficultyMultiplier;
    if (this.spawnTimer < adjustedSpawnRate) return;

    this.spawnTimer = 0;

    // 한번에 스폰할 적 수 (기본 1, rushWave면 추가 보너스)
    let spawnCount = currentWave.spawnCount || 1;
    if (currentWave.rushWave) {
      spawnCount = Math.floor(spawnCount * 1.5); // 러시 웨이브는 50% 추가
    }

    // 남은 여유 공간만큼만 스폰
    const remainingSlots = currentWave.maxEnemies - activeEnemies;
    spawnCount = Math.min(spawnCount, remainingSlots);

    // spawnCount가 1이면 단일 개체 스폰 (클러스터 없음)
    if (spawnCount <= 1) {
      const enemyType = Phaser.Utils.Array.GetRandom(currentWave.enemies);
      this.spawnEnemy(enemyType);
      return;
    }

    // 2마리 이상이면 클러스터 스폰 (2~4개 그룹으로 나눠서)
    const clusterCount = Math.min(4, Math.ceil(spawnCount / 5)); // 5마리당 1개 클러스터
    const enemiesPerCluster = Math.ceil(spawnCount / clusterCount);

    for (let c = 0; c < clusterCount; c++) {
      // 클러스터 중심점 결정
      const clusterCenter = this.getSpawnPosition();
      const clusterEnemies = Math.min(enemiesPerCluster, spawnCount - c * enemiesPerCluster);

      for (let i = 0; i < clusterEnemies; i++) {
        const enemyType = Phaser.Utils.Array.GetRandom(currentWave.enemies);
        // 클러스터 중심에서 약간 흩어진 위치에 스폰
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = (Math.random() - 0.5) * 60;
        this.spawnEnemyAt(enemyType, clusterCenter.x + offsetX, clusterCenter.y + offsetY);
      }
    }
  }

  private spawnEnemy(enemyType: string): void {
    const spawnPos = this.getSpawnPosition();
    this.spawnEnemyAt(enemyType, spawnPos.x, spawnPos.y);
  }

  private spawnEnemyAt(enemyType: string, x: number, y: number): void {
    const config = this.enemyConfigs[enemyType];
    if (!config) {
      console.warn(`Enemy config not found: ${enemyType}`);
      return;
    }

    // 시간 기반 추가 체력 보너스 계산
    // 3분 이후: +30%, 5분 이후: +60%, 7분 이후: +100%, 9분 이후: +150%
    const minutes = this.gameTime / 60000;
    let healthBonus = 1;
    if (minutes >= 9) healthBonus = 2.5;
    else if (minutes >= 7) healthBonus = 2.0;
    else if (minutes >= 5) healthBonus = 1.6;
    else if (minutes >= 3) healthBonus = 1.3;

    // 최종 체력 = 기본 체력 * 난이도 배율 * 시간 보너스
    const finalHP = Math.floor(config.hp * this.difficultyMultiplier * healthBonus);
    const finalDamage = Math.floor(config.damage * this.difficultyMultiplier);

    // Enemy 생성자에 맞는 EnemyConfig 구조로 전달
    const enemy = new Enemy(
      this.scene,
      x,
      y,
      {
        id: config.id,
        name: config.id,
        sprite: config.texture,
        hp: finalHP,
        damage: finalDamage,
        speed: config.speed,
        expValue: config.exp,
        scale: config.scale || 1,
        behavior: config.behavior === 'charger' ? 'charge' : config.behavior,
      }
    );

    enemy.setTarget(this.player);
    enemy.setData('isEnemy', true);
    this.enemies.add(enemy);
  }

  private spawnBoss(bossType: string): void {
    const config = this.enemyConfigs[bossType];
    if (!config) {
      console.warn(`Boss config not found: ${bossType}`);
      return;
    }

    // 시간 기반 추가 체력 보너스 (보스는 더 강화)
    const minutes = this.gameTime / 60000;
    let healthBonus = 1;
    if (minutes >= 9) healthBonus = 2.5;
    else if (minutes >= 7) healthBonus = 2.0;
    else if (minutes >= 5) healthBonus = 1.6;
    else if (minutes >= 3) healthBonus = 1.3;

    const spawnPos = this.getSpawnPosition();

    // 보스 타입별 능력 설정
    const bossAbilities = this.getBossAbilities(bossType);
    const bossName = this.getBossName(bossType);

    const boss = new Boss(
      this.scene,
      spawnPos.x,
      spawnPos.y,
      config.texture,
      {
        hp: Math.floor(config.hp * this.difficultyMultiplier * healthBonus),
        damage: Math.floor(config.damage * this.difficultyMultiplier),
        speed: config.speed,
        exp: config.exp,
        abilities: bossAbilities,
      },
      bossName
    );

    boss.setTarget(this.player);
    boss.setData('isEnemy', true);
    this.enemies.add(boss);

    // 보스 스폰 이벤트
    this.scene.events.emit('bossSpawned', bossType);
  }

  // 보스 타입별 능력 설정
  private getBossAbilities(bossType: string): BossAbility[] {
    switch (bossType) {
      case 'miniboss':
        // 미니보스: 돌진 + 투사체
        return ['charge', 'projectile'];
      case 'boss':
        // 최종 보스: 모든 능력
        return ['charge', 'summon', 'projectile', 'aoe'];
      default:
        return ['charge', 'projectile'];
    }
  }

  // 보스 이름 설정
  private getBossName(bossType: string): string {
    switch (bossType) {
      case 'miniboss':
        return 'ELITE GUARDIAN';
      case 'boss':
        return 'DEATH LORD';
      default:
        return 'BOSS';
    }
  }

  // 보스 소환 능력으로 미니언 스폰
  public spawnMinions(x: number, y: number, count: number): void {
    const minionTypes = ['bat', 'skeleton', 'ghost'];

    for (let i = 0; i < count; i++) {
      // 보스 주변 랜덤 위치
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const dist = 50 + Math.random() * 30;
      const spawnX = x + Math.cos(angle) * dist;
      const spawnY = y + Math.sin(angle) * dist;

      // 랜덤 미니언 타입
      const minionType = Phaser.Utils.Array.GetRandom(minionTypes);
      const config = this.enemyConfigs[minionType];

      if (config) {
        const enemy = new Enemy(
          this.scene,
          spawnX,
          spawnY,
          {
            id: config.id,
            name: config.id,
            sprite: config.texture,
            hp: Math.floor(config.hp * this.difficultyMultiplier * 0.5), // 미니언은 약하게
            damage: Math.floor(config.damage * this.difficultyMultiplier * 0.5),
            speed: config.speed * 1.2, // 약간 빠르게
            expValue: Math.floor(config.exp * 0.5),
            scale: (config.scale || 1) * 0.8, // 작게
            behavior: config.behavior === 'charger' ? 'charge' : config.behavior,
          }
        );

        enemy.setTarget(this.player);
        enemy.setData('isEnemy', true);
        enemy.setData('isMinion', true);
        this.enemies.add(enemy);
      }
    }
  }

  private getSpawnPosition(): { x: number; y: number } {
    // 플레이어 주변 원형 스폰 (뱀서 스타일)
    // 화면 가장자리 바로 밖에서 스폰하여 빠르게 접근
    const playerX = this.player.x;
    const playerY = this.player.y;

    // 스폰 거리: 화면 대각선 절반 + 약간의 여유 (플레이어 기준)
    // 화면 크기가 1280x720이므로 대각선 절반은 약 367
    // 300~400 정도면 화면 가장자리 바로 밖에서 스폰
    const minDistance = 280;  // 최소 스폰 거리 (화면 안쪽 가장자리)
    const maxDistance = 380;  // 최대 스폰 거리 (화면 바깥)

    // 랜덤 각도 (0 ~ 2π)
    const angle = Math.random() * Math.PI * 2;

    // 랜덤 거리
    const distance = Phaser.Math.Between(minDistance, maxDistance);

    // 위치 계산
    const x = playerX + Math.cos(angle) * distance;
    const y = playerY + Math.sin(angle) * distance;

    return { x, y };
  }

  // 킬 등록
  registerKill(): void {
    this.killCount++;
  }

  // 게터
  getCurrentWave(): number {
    return this.currentWaveIndex + 1;
  }

  getGameTime(): number {
    return this.gameTime;
  }

  getGameTimeFormatted(): string {
    const totalSeconds = Math.floor(this.gameTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getKillCount(): number {
    return this.killCount;
  }

  getDifficultyMultiplier(): number {
    return this.difficultyMultiplier;
  }

  getActiveEnemyCount(): number {
    return this.enemies.getChildren().filter(e => (e as Enemy).active).length;
  }

  // 특수 이벤트
  spawnSwarm(enemyType: string, count: number): void {
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        this.spawnEnemy(enemyType);
      });
    }
  }

  clearAllEnemies(): void {
    this.enemies.getChildren().forEach(enemy => {
      (enemy as Enemy).destroy();
    });
  }
}
