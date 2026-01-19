// 게임 타입 정의

export interface PlayerStats {
  maxHP: number;
  currentHP: number;
  hpRegen: number;
  moveSpeed: number;
  damage: number; // 배수 (1.0 = 100%)
  attackSpeed: number; // 배수
  area: number; // 배수
  duration: number; // 배수
  projectileCount: number; // 추가 투사체 수
  piercing: number; // 추가 관통 횟수
  cooldownReduction: number; // 배수
  expMultiplier: number; // 배수
  pickupRange: number;
  luck: number; // 희귀 아이템 확률 보너스
  revives: number; // 남은 부활 횟수
}

export interface WeaponState {
  id: string;
  level: number;
  currentCooldown: number;
}

export interface PassiveState {
  id: string;
  level: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isLevelingUp: boolean;
  isGameOver: boolean;
  elapsedTime: number; // 밀리초
  level: number;
  exp: number;
  expToNextLevel: number;
  kills: number;
  bossKills: number;
  gold: number;
}

export interface EnemyState {
  id: string;
  type: EnemyType;
  hp: number;
  maxHP: number;
  damage: number;
  speed: number;
  expValue: number;
}

export type EnemyType = 'bat' | 'skeleton' | 'ghost' | 'slime' | 'miniboss' | 'boss';

export interface LevelUpChoice {
  type: 'weapon' | 'passive' | 'evolution' | 'heal';
  id: string;
  name: string;
  description: string;
  icon: string;
  isNew?: boolean;
  currentLevel?: number;
}

export interface EvolutionRecipe {
  id: string;
  weaponId: string;
  passiveId: string;
  resultWeaponId: string;
  resultName: string;
  description: string;
}

export interface GameResult {
  survivalTime: number;
  kills: number;
  bossKills: number;
  level: number;
  reward: number;
  isVictory: boolean;
}

export interface SaveData {
  version: number;
  currency: number;
  upgrades: Record<string, number>;
  statistics: GameStatistics;
  settings: GameSettings;
}

export interface GameStatistics {
  totalPlayTime: number;
  totalKills: number;
  totalBossKills: number;
  totalGamesPlayed: number;
  bestSurvivalTime: number;
  highestLevel: number;
  totalGoldEarned: number;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  bgmVolume: number;
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  screenShake: boolean;
  showDamageNumbers: boolean;
}

export interface DropItem {
  type: 'exp_small' | 'exp_medium' | 'exp_large' | 'health' | 'coin' | 'chest' | 'magnet';
  x: number;
  y: number;
  value: number;
}

export interface ProjectileConfig {
  damage: number;
  speed: number;
  piercing: number; // 관통 횟수
  duration: number; // 수명 (ms)
  area: number; // 히트박스 배수
  knockback: number;
}

export interface WaveConfig {
  startTime: number; // 시작 시간 (초)
  endTime: number; // 종료 시간 (초)
  spawnDelay: number; // 스폰 간격 (ms)
  spawnCount: number; // 한 번에 스폰할 적 수
  enemies: WaveEnemy[];
}

export interface WaveEnemy {
  type: EnemyType;
  weight: number; // 스폰 가중치
}

export interface BossSpawn {
  time: number; // 스폰 시간 (초)
  type: 'miniboss' | 'boss';
}

export type Direction = { x: number; y: number };
