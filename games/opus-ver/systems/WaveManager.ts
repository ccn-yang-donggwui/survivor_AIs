// 웨이브 매니저 - 적 스폰 및 난이도 관리

import Phaser from 'phaser';
import { GAME, ENEMIES } from '../config/Constants';
import { Enemy } from '../entities/Enemy';
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
    // 기본 적 설정 (체력 밸런스 상향 조정)
    // 경험치: tiny: 1-2, small: 3-6, medium: 7-14, large: 15-29, huge: 30+
    // 체력 상향: 후반 스킬 성장에 맞춰 기본 체력 2배 증가
    this.enemyConfigs = {
      bat: {
        id: 'bat',
        texture: 'enemy_bat',
        hp: 15,        // 8 → 15 (기본 몹도 어느정도 버팀)
        damage: 5,
        speed: 140,
        exp: 2,
        behavior: 'chase',
      },
      skeleton: {
        id: 'skeleton',
        texture: 'enemy_skeleton',
        hp: 40,        // 20 → 40 (탱커형)
        damage: 10,    // 8 → 10
        speed: 110,
        exp: 5,
        behavior: 'charger',
      },
      ghost: {
        id: 'ghost',
        texture: 'enemy_ghost',
        hp: 25,        // 15 → 25
        damage: 8,     // 7 → 8
        speed: 95,
        exp: 4,
        behavior: 'ranged',
      },
      slime: {
        id: 'slime',
        texture: 'enemy_slime',
        hp: 70,        // 35 → 70 (높은 체력)
        damage: 12,    // 10 → 12
        speed: 70,
        exp: 8,
        behavior: 'chase',
      },
      miniboss: {
        id: 'miniboss',
        texture: 'enemy_miniboss',
        hp: 350,       // 150 → 350
        damage: 20,    // 15 → 20
        speed: 80,
        exp: 35,
        behavior: 'boss',
        scale: 1.5,
      },
      boss: {
        id: 'boss',
        texture: 'enemy_boss',
        hp: 1000,      // 400 → 1000
        damage: 30,    // 25 → 30
        speed: 70,
        exp: 100,      // 80 → 100
        behavior: 'boss',
        scale: 2,
      },
      // 엘리트 몬스터 (후반용 강화 버전)
      elite_bat: {
        id: 'elite_bat',
        texture: 'enemy_bat',
        hp: 50,        // 강화 박쥐
        damage: 12,
        speed: 160,    // 더 빠름
        exp: 6,
        behavior: 'chase',
        scale: 1.3,    // 약간 큼
      },
      elite_skeleton: {
        id: 'elite_skeleton',
        texture: 'enemy_skeleton',
        hp: 120,       // 강화 해골
        damage: 18,
        speed: 130,
        exp: 12,
        behavior: 'charger',
        scale: 1.3,
      },
      elite_ghost: {
        id: 'elite_ghost',
        texture: 'enemy_ghost',
        hp: 80,        // 강화 유령
        damage: 15,
        speed: 110,
        exp: 10,
        behavior: 'ranged',
        scale: 1.3,
      },
      elite_slime: {
        id: 'elite_slime',
        texture: 'enemy_slime',
        hp: 200,       // 강화 슬라임
        damage: 20,
        speed: 85,
        exp: 20,
        behavior: 'chase',
        scale: 1.4,
      },
    };

    // 기본 웨이브 설정 (점진적 난이도 상승)
    // spawnRate: 스폰 간격 (ms), spawnCount: 한번에 스폰할 적 수
    // rushWave: 러시 웨이브 (몬스터 대거 출현)
    // 후반부터 엘리트 몬스터 등장 (elite_ 접두사)
    this.waveConfigs = [
      // 초반 (0-60초): 단일 개체로 여유롭게
      { time: 0, enemies: ['bat'], spawnRate: 500, maxEnemies: 15, spawnCount: 1 },
      { time: 15, enemies: ['bat'], spawnRate: 450, maxEnemies: 20, spawnCount: 1 },
      { time: 30, enemies: ['bat'], spawnRate: 400, maxEnemies: 25, spawnCount: 1 },
      { time: 45, enemies: ['bat', 'ghost'], spawnRate: 380, maxEnemies: 30, spawnCount: 1 },

      // 중반 초입 (60-120초): 골격병 등장, 소규모 무리 시작
      { time: 60, enemies: ['bat', 'skeleton'], spawnRate: 350, maxEnemies: 35, spawnCount: 2 },
      { time: 75, enemies: ['bat', 'skeleton'], spawnRate: 300, maxEnemies: 45, rushWave: true, spawnCount: 4 },
      { time: 90, enemies: ['bat', 'skeleton', 'ghost'], spawnRate: 320, maxEnemies: 40, spawnCount: 2 },

      // 중반 (120-240초): 슬라임 등장, 첫 미니보스
      { time: 120, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 220, maxEnemies: 55, spawnCount: 4 },
      { time: 140, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 180, maxEnemies: 70, rushWave: true, spawnCount: 8 },
      { time: 160, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 200, maxEnemies: 60, bossSpawn: 'miniboss', spawnCount: 5 },
      { time: 190, enemies: ['skeleton', 'ghost', 'slime'], spawnRate: 180, maxEnemies: 75, spawnCount: 5 },
      { time: 220, enemies: ['ghost', 'slime'], spawnRate: 150, maxEnemies: 90, rushWave: true, spawnCount: 10 },

      // 후반 초입 (240-360초): 엘리트 몬스터 등장 시작
      { time: 250, enemies: ['skeleton', 'ghost', 'slime', 'elite_bat'], spawnRate: 160, maxEnemies: 100, spawnCount: 6 },
      { time: 280, enemies: ['skeleton', 'ghost', 'slime', 'elite_bat'], spawnRate: 130, maxEnemies: 120, rushWave: true, spawnCount: 12 },
      { time: 310, enemies: ['skeleton', 'slime', 'elite_skeleton', 'elite_ghost'], spawnRate: 150, maxEnemies: 110, bossSpawn: 'miniboss', spawnCount: 7 },
      { time: 340, enemies: ['slime', 'elite_skeleton', 'elite_ghost'], spawnRate: 130, maxEnemies: 130, spawnCount: 8 },

      // 후반 (360-480초): 엘리트 몬스터 비중 증가
      { time: 370, enemies: ['elite_bat', 'elite_skeleton', 'elite_ghost', 'slime'], spawnRate: 110, maxEnemies: 150, rushWave: true, spawnCount: 14 },
      { time: 400, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 110, maxEnemies: 160, spawnCount: 10 },
      { time: 430, enemies: ['elite_ghost', 'elite_slime'], spawnRate: 100, maxEnemies: 180, bossSpawn: 'miniboss', spawnCount: 10 },
      { time: 460, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 80, maxEnemies: 200, rushWave: true, spawnCount: 16 },

      // 클라이막스 (480-600초): 엘리트 몬스터 위주 + 최종 보스
      { time: 490, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 80, maxEnemies: 220, spawnCount: 12 },
      { time: 520, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 60, maxEnemies: 250, rushWave: true, spawnCount: 18 },
      { time: 550, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 60, maxEnemies: 280, bossSpawn: 'boss', spawnCount: 15 },
      { time: 580, enemies: ['elite_skeleton', 'elite_ghost', 'elite_slime'], spawnRate: 50, maxEnemies: 320, rushWave: true, spawnCount: 22 },
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

    // 난이도 증가 (15초마다 10% 증가 + 시간 보너스)
    // 기본: 15초마다 10% 증가
    // 보너스: 3분 이후부터 추가 50% 가속, 5분 이후부터 추가 100% 가속
    const baseMultiplier = 1 + Math.floor(this.gameTime / 15000) * 0.10;
    const timeBonus = this.gameTime > 300000 ? 0.5 : (this.gameTime > 180000 ? 0.25 : 0);
    this.difficultyMultiplier = baseMultiplier * (1 + timeBonus);

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

    const boss = new Enemy(
      this.scene,
      spawnPos.x,
      spawnPos.y,
      {
        id: config.id,
        name: config.id,
        sprite: config.texture,
        hp: Math.floor(config.hp * this.difficultyMultiplier * healthBonus),
        damage: Math.floor(config.damage * this.difficultyMultiplier),
        speed: config.speed,
        expValue: config.exp,
        scale: config.scale || 1,
        behavior: config.behavior === 'charger' ? 'charge' : config.behavior,
      }
    );

    boss.setTarget(this.player);
    boss.setData('isEnemy', true);
    boss.setData('isBoss', true);
    this.enemies.add(boss);

    // 보스 스폰 이벤트
    this.scene.events.emit('bossSpawned', bossType);

    // 화면 효과
    this.scene.cameras.main.shake(300, 0.01);
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
