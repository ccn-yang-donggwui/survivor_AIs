export interface PlayerStats {
  maxHP: number;
  currentHP: number;
  hpRegen: number;
  moveSpeed: number;
  damage: number;
  attackSpeed: number;
  area: number;
  duration: number;
  projectileCount: number;
  expMultiplier: number;
  pickupRange: number;
}

export interface WeaponData {
  id: string;
  name: string;
  description: string;
  baseDamage: number;
  baseCooldown: number;
  baseProjectileCount: number;
  maxLevel: number;
}

export interface EnemyData {
  id: string;
  name: string;
  hp: number;
  damage: number;
  speed: number;
  expValue: number;
  spawnAfter: number;
}

export interface DropItem {
  type: 'exp' | 'heal' | 'gold' | 'magnet' | 'chest';
  value: number;
  x: number;
  y: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  level: number;
  exp: number;
  expToNextLevel: number;
  kills: number;
  gold: number;
}

export interface SaveData {
  version: string;
  permanentUpgrades: Record<string, number>;
  unlockedCharacters: string[];
  unlockedStages: string[];
  gold: number;
  statistics: {
    totalPlayTime: number;
    totalKills: number;
    totalDeaths: number;
    highestSurvivalTime: number;
    gamesPlayed: number;
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    showDamageNumbers: boolean;
    screenShake: boolean;
  };
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface Vector2 {
  x: number;
  y: number;
}
