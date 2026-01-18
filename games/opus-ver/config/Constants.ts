// 게임 상수 정의

export const GAME = {
  WIDTH: 1280,
  HEIGHT: 720,
  WORLD_WIDTH: 4000,
  WORLD_HEIGHT: 4000,
  WORLD_SIZE: 2000, // 월드 반경 (중심에서 가장자리까지)
  MAX_GAME_TIME: 600000, // 10분 (밀리초)
} as const;

export const PLAYER = {
  BASE_HP: 100,
  BASE_SPEED: 200,
  BASE_HP_REGEN: 0.1,
  BASE_PICKUP_RANGE: 80,
  INVINCIBILITY_TIME: 1000, // 피격 후 무적 시간 (ms)
  MAX_WEAPONS: 6,
  MAX_PASSIVES: 6,
} as const;

export const WEAPONS = {
  MAX_LEVEL: 5,
  MAX_SLOTS: 6,
  LEVEL_DAMAGE_MULT: 0.25, // 레벨당 데미지 증가율 (강화)
  LEVEL_COOLDOWN_REDUCTION: 0.08, // 레벨당 쿨다운 감소율 (강화)
} as const;

export const PASSIVES = {
  MAX_LEVEL: 5,
  MAX_SLOTS: 6,
} as const;

export const EXPERIENCE = {
  BASE_EXP_TO_LEVEL: 10,
  EXP_GROWTH_RATE: 1.2,
  LEVEL_UP_CHOICES: 3,
  SMALL_GEM_VALUE: 1,
  MEDIUM_GEM_VALUE: 5,
  LARGE_GEM_VALUE: 25,
} as const;

export const ENEMIES = {
  MAX_COUNT: 2000,  // 200 → 2000 (대량 스폰 지원)
  SPAWN_MARGIN: 50, // 100 → 50 (더 가까이 스폰)
  DESPAWN_DISTANCE: 600, // 1000 → 600 (더 빨리 제거하여 성능 최적화)
} as const;

export const DEPTH = {
  BACKGROUND: 0,
  TILES: 10,
  DROPS: 20,
  ENEMIES: 30,
  PROJECTILES: 40,
  PLAYER: 50,
  EFFECTS: 60,
  UI: 100,
  OVERLAY: 200,
} as const;

export const COLORS = {
  BACKGROUND: 0x1a1c2c,
  HP_BAR: 0xb13e53,
  HP_BAR_BG: 0x1a1c2c,
  EXP_BAR: 0x41a6f6,
  EXP_BAR_BG: 0x1a1c2c,
  TEXT_PRIMARY: '#f4f4f4',
  TEXT_SECONDARY: '#94b0c2',
  TEXT_HIGHLIGHT: '#ffcd75',
  TEXT_DAMAGE: '#ef7d57',
  TEXT_HEAL: '#a7f070',
  TEXT_EXP: '#41a6f6',
  // UI 색상
  UI_PRIMARY: 0x41a6f6,
  UI_SECONDARY: 0x73eff7,
  UI_BACKGROUND: 0x29366f,
  UI_TEXT: 0xf4f4f4,
  UI_ACCENT: 0xffcd75,
} as const;

export const AUDIO = {
  DEFAULT_MASTER_VOLUME: 0.5,
  DEFAULT_SFX_VOLUME: 0.8,
  DEFAULT_BGM_VOLUME: 0.4,
  FADE_DURATION: 500,
} as const;

export const META = {
  STORAGE_KEY: 'opus-ver-meta',
  SETTINGS_KEY: 'opus-ver-settings',
} as const;

export const SPAWN_WEIGHTS = {
  COMMON: 100,
  UNCOMMON: 50,
  RARE: 25,
  EPIC: 10,
  LEGENDARY: 5,
} as const;
