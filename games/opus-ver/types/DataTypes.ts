// JSON 데이터 타입 정의

export interface WeaponData {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'projectile' | 'melee' | 'area' | 'orbit' | 'aura';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  baseDamage: number;
  baseCooldown: number; // ms
  baseProjectileCount: number;
  baseRange?: number;
  basePiercing?: number;
  baseSpeed?: number;
  baseArea?: number;
  baseDuration?: number;
  baseKnockback?: number;
  maxLevel: number;
  levelUp: WeaponLevelUp[];
  evolutionId?: string; // 진화 가능한 경우
  targeting?: 'nearest' | 'homing' | 'cluster' | 'lowest_hp' | 'random' | 'random_screen' | 'radial' | 'player_direction'; // 타겟팅 방식
}

export interface WeaponLevelUp {
  level: number;
  damage?: number; // 절대값 증가
  damagePercent?: number; // 퍼센트 증가
  cooldown?: number; // 절대값 감소 (음수)
  cooldownPercent?: number; // 퍼센트 감소
  projectiles?: number; // 추가 투사체
  range?: number;
  piercing?: number;
  area?: number;
  duration?: number;
  description?: string;
}

export interface PassiveData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  stat: keyof import('./GameTypes').PlayerStats;
  baseValue: number;
  perLevelValue: number;
  isMultiplier: boolean; // true면 곱셈, false면 덧셈
  maxLevel: number;
  linkedEvolutionId?: string; // 연동 진화
}

export interface EvolutionData {
  id: string;
  baseWeaponId: string;
  requiredPassiveId: string;
  resultWeaponId: string;
  requiredWeaponLevel: number;
  requiredPassiveLevel: number;
  description: string;
}

export interface CharacterData {
  id: string;
  name: string;
  description: string;
  sprite: string;
  stats: {
    maxHP: number;
    moveSpeed: number;
    pickupRange: number;
    damage: number;
    cooldownReduction: number;
    area: number;
  };
  startingWeaponId: string;
}

export interface StageData {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  tileKey: string;
  wavesKey: string;
  duration: number; // 게임 시간 (초)
  enemySpeedMultiplier: number;
  enemyHealthMultiplier: number;
}

export interface MetaUpgradeData {
  id: string;
  name: string;
  description: string;
  stat: string;
  baseValue: number;
  perLevelValue: number;
  isMultiplier: boolean;
  maxLevel: number;
  baseCost: number;
  costPerLevel: number;
  costMultiplier: number;
}

export interface EnemyTypeData {
  id: string;
  name: string;
  sprite: string;
  hp: number;
  damage: number;
  speed: number;
  expValue: number;
  scale: number;
  behavior: 'chase' | 'charge' | 'ranged' | 'boss';
}

// JSON 파일 루트 타입
export interface WeaponsJson {
  version: number;
  weapons: WeaponData[];
}

export interface PassivesJson {
  version: number;
  passives: PassiveData[];
}

export interface EvolutionsJson {
  version: number;
  evolutions: EvolutionData[];
}

export interface CharactersJson {
  version: number;
  characters: CharacterData[];
}

export interface StagesJson {
  version: number;
  stages: StageData[];
}

export interface MetaUpgradesJson {
  version: number;
  upgrades: MetaUpgradeData[];
}

export interface WavesJson {
  version: number;
  waves: import('./GameTypes').WaveConfig[];
  bosses: import('./GameTypes').BossSpawn[];
}
