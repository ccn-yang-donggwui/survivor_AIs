export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PLAYER = {
  BASE_HP: 100,
  BASE_SPEED: 200,
  BASE_HP_REGEN: 0.1,
  INVINCIBILITY_TIME: 500,
  SIZE: 32
};

export const ENEMY = {
  SPAWN_DISTANCE: 600,
  DESPAWN_DISTANCE: 800
};

export const WEAPONS = {
  MAX_SLOTS: 6,
  MAX_LEVEL: 8
};

export const PASSIVES = {
  MAX_SLOTS: 6,
  MAX_LEVEL: 5
};

export const EXP = {
  BASE_TO_LEVEL: 10,
  LEVEL_MULTIPLIER: 1.2
};

export const WORLD = {
  WIDTH: 4000,
  HEIGHT: 4000
};

export const COLORS = {
  BACKGROUND: 0x1a1a2e,
  UI_PRIMARY: 0x16213e,
  UI_SECONDARY: 0x0f3460,
  HEALTH: 0xe94560,
  EXP: 0x00ff88,
  GOLD: 0xffd700,
  DAMAGE: 0xff4444,
  HEAL: 0x44ff44
};

export const DEPTH = {
  BACKGROUND: 0,
  DROPS: 10,
  ENEMIES: 20,
  PLAYER: 30,
  PROJECTILES: 40,
  EFFECTS: 50,
  UI: 100
};
