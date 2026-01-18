// 32색 HD 픽셀 아트 팔레트 (확장된 PICO-8 스타일)
export const PALETTE = {
  // 기본 16색 (인덱스 0-15)
  0: '#1a1c2c',   // 검정 (배경, 윤곽선)
  1: '#5d275d',   // 짙은 보라 (그림자)
  2: '#b13e53',   // 짙은 빨강 (적, 데미지)
  3: '#ef7d57',   // 주황 (하이라이트)
  4: '#ffcd75',   // 크림/살색
  5: '#a7f070',   // 연두 (힐, 경험치)
  6: '#38b764',   // 녹색 (자연)
  7: '#257179',   // 청록 (물)
  8: '#29366f',   // 짙은 파랑 (밤)
  9: '#3b5dc9',   // 파랑 (마법)
  10: '#41a6f6',  // 하늘색 (이펙트)
  11: '#73eff7',  // 청록 하이라이트
  12: '#f4f4f4',  // 흰색
  13: '#94b0c2',  // 회색 (금속)
  14: '#566c86',  // 어두운 회색
  15: '#333c57',  // 매우 어두운 회색

  // 확장 16색 (인덱스 16-31) - HD 픽셀용
  16: '#0d0e14',  // 딥 블랙 (윤곽선용)
  17: '#3a1f5d',  // 딥 퍼플 (그림자 강화)
  18: '#8a2b45',  // 다크 레드 (적 그림자)
  19: '#d95e3f',  // 다크 오렌지 (중간톤)
  20: '#eab85c',  // 다크 크림 (그림자)
  21: '#7ed356',  // 미드 그린 (중간톤)
  22: '#2a8f50',  // 다크 그린 (그림자)
  23: '#1c4f5c',  // 다크 티얼 (물 그림자)
  24: '#1e2852',  // 딥 네이비 (밤 강화)
  25: '#2a4aa8',  // 미드 블루 (중간톤)
  26: '#2e8fd9',  // 다크 스카이 (중간톤)
  27: '#50d9e8',  // 미드 시안 (중간톤)
  28: '#d8d8d8',  // 라이트 그레이 (하이라이트)
  29: '#7a97a8',  // 미드 그레이 (중간톤)
  30: '#455569',  // 다크 슬레이트 (그림자)
  31: '#242d3d',  // 딥 그레이 (강한 그림자)
} as const;

// 팔레트 배열 (인덱스로 빠른 접근)
export const PALETTE_ARRAY: string[] = Object.values(PALETTE);

// 투명 값 (-1)
export const TRANSPARENT = -1;

// 색상 카테고리 (HD 버전 - 음영 포함)
export const COLORS = {
  // 캐릭터 스킨
  SKIN_LIGHT: 4,
  SKIN: 20,
  SKIN_SHADOW: 3,

  // 머리카락
  HAIR_DARK: 1,
  HAIR_DARK_SHADOW: 17,
  HAIR_LIGHT: 3,
  HAIR_LIGHT_SHADOW: 19,

  // 금속 (갑옷)
  METAL_LIGHT: 12,
  METAL: 13,
  METAL_MID: 29,
  METAL_DARK: 14,
  METAL_SHADOW: 30,

  // 적
  ENEMY_BAT: 1,
  ENEMY_BAT_SHADOW: 17,
  ENEMY_SKELETON: 12,
  ENEMY_SKELETON_SHADOW: 28,
  ENEMY_GHOST: 10,
  ENEMY_GHOST_SHADOW: 26,
  ENEMY_SLIME: 5,
  ENEMY_SLIME_SHADOW: 21,
  ENEMY_BOSS: 2,
  ENEMY_BOSS_SHADOW: 18,

  // 아이템
  EXP_BLUE_LIGHT: 11,
  EXP_BLUE: 10,
  EXP_BLUE_DARK: 9,
  EXP_GREEN_LIGHT: 5,
  EXP_GREEN: 6,
  EXP_GREEN_DARK: 22,
  EXP_RED_LIGHT: 3,
  EXP_RED: 2,
  EXP_RED_DARK: 18,
  HEALTH: 2,
  GOLD_LIGHT: 4,
  GOLD: 3,
  GOLD_DARK: 19,

  // 마법
  MAGIC_LIGHT: 11,
  MAGIC: 10,
  MAGIC_MID: 9,
  MAGIC_DARK: 25,

  // UI
  HP_FILL: 2,
  HP_BG: 0,
  HP_FRAME: 13,

  // 배경
  GRASS_LIGHT: 5,
  GRASS: 6,
  GRASS_DARK: 22,
  STONE_LIGHT: 13,
  STONE: 14,
  STONE_DARK: 30,
  WATER_LIGHT: 10,
  WATER: 7,
  WATER_DARK: 23,

  // 윤곽선
  OUTLINE: 16,
  OUTLINE_LIGHT: 0,
} as const;

// 그라디언트 헬퍼 (음영 팔레트)
export const GRADIENTS = {
  BLUE: [8, 25, 9, 26, 10, 27, 11],
  RED: [18, 2, 3, 4],
  GREEN: [22, 6, 21, 5],
  GRAY: [31, 30, 14, 29, 13, 28, 12],
  GOLD: [19, 3, 4, 12],
  PURPLE: [17, 1, 9, 10],
} as const;