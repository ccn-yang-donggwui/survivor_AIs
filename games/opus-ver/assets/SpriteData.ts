import { TRANSPARENT as T } from './ColorPalette';
import { HD_SPRITES, HD_SPRITE_KEYS } from './SpriteDataHD';

// 픽셀 데이터 타입: 2D 배열 (행 × 열), 값은 팔레트 인덱스 또는 -1(투명)
export type PixelData = number[][];

// HD 모드 플래그 (true = 32x32 HD 스프라이트 사용)
export const USE_HD_SPRITES = true;

// =====================================================
// 플레이어 캐릭터 (16x16)
// =====================================================

export const PLAYER_KNIGHT: PixelData = [
  [T,T,T,T,T,13,13,13,13,13,T,T,T,T,T,T],
  [T,T,T,T,13,14,14,14,14,14,13,T,T,T,T,T],
  [T,T,T,13,14,12,12,12,12,12,14,13,T,T,T,T],
  [T,T,T,13,4,4,0,4,4,0,4,13,T,T,T,T],
  [T,T,T,13,4,4,4,4,4,4,4,13,T,T,T,T],
  [T,T,T,T,13,4,2,2,2,4,13,T,T,T,T,T],
  [T,T,T,T,T,13,13,13,13,13,T,T,T,T,T,T],
  [T,T,T,13,13,9,9,9,9,9,13,13,T,T,T,T],
  [T,T,13,13,9,9,9,9,9,9,9,13,13,T,T,T],
  [T,T,13,4,13,9,9,9,9,9,13,4,13,T,T,T],
  [T,T,T,4,T,13,9,9,9,13,T,4,T,T,T,T],
  [T,T,T,T,T,13,9,9,9,13,T,T,T,T,T,T],
  [T,T,T,T,T,13,13,T,13,13,T,T,T,T,T,T],
  [T,T,T,T,T,13,13,T,13,13,T,T,T,T,T,T],
  [T,T,T,T,13,13,T,T,T,13,13,T,T,T,T,T],
  [T,T,T,T,0,0,T,T,T,0,0,T,T,T,T,T],
];

export const PLAYER_MAGE: PixelData = [
  [T,T,T,T,T,9,9,9,9,9,T,T,T,T,T,T],
  [T,T,T,T,9,8,8,10,8,8,9,T,T,T,T,T],
  [T,T,T,9,8,8,10,10,10,8,8,9,T,T,T,T],
  [T,T,T,9,4,4,0,4,4,0,4,9,T,T,T,T],
  [T,T,T,9,4,4,4,4,4,4,4,9,T,T,T,T],
  [T,T,T,T,9,4,2,2,2,4,9,T,T,T,T,T],
  [T,T,T,T,T,9,9,9,9,9,T,T,T,T,T,T],
  [T,T,T,9,9,1,1,1,1,1,9,9,T,T,T,T],
  [T,T,9,9,1,1,10,1,10,1,1,9,9,T,T,T],
  [T,T,9,4,9,1,1,1,1,1,9,4,9,T,T,T],
  [T,T,T,4,T,9,1,1,1,9,T,4,T,T,T,T],
  [T,T,T,T,T,9,1,1,1,9,T,T,T,T,T,T],
  [T,T,T,T,T,9,9,T,9,9,T,T,T,T,T,T],
  [T,T,T,T,T,1,1,T,1,1,T,T,T,T,T,T],
  [T,T,T,T,1,1,T,T,T,1,1,T,T,T,T,T],
  [T,T,T,T,0,0,T,T,T,0,0,T,T,T,T,T],
];

export const PLAYER_ROGUE: PixelData = [
  [T,T,T,T,T,0,0,0,0,0,T,T,T,T,T,T],
  [T,T,T,T,0,15,15,15,15,15,0,T,T,T,T,T],
  [T,T,T,0,15,15,15,15,15,15,15,0,T,T,T,T],
  [T,T,T,0,4,4,0,4,4,0,4,0,T,T,T,T],
  [T,T,T,0,4,4,4,4,4,4,4,0,T,T,T,T],
  [T,T,T,T,0,4,4,4,4,4,0,T,T,T,T,T],
  [T,T,T,T,T,0,0,0,0,0,T,T,T,T,T,T],
  [T,T,T,0,0,14,14,14,14,14,0,0,T,T,T,T],
  [T,T,0,0,14,14,14,14,14,14,14,0,0,T,T,T],
  [T,T,0,4,0,14,14,14,14,14,0,4,0,T,T,T],
  [T,T,T,4,T,0,14,14,14,0,T,4,T,T,T,T],
  [T,T,T,T,T,0,14,14,14,0,T,T,T,T,T,T],
  [T,T,T,T,T,0,0,T,0,0,T,T,T,T,T,T],
  [T,T,T,T,T,14,14,T,14,14,T,T,T,T,T,T],
  [T,T,T,T,14,14,T,T,T,14,14,T,T,T,T,T],
  [T,T,T,T,0,0,T,T,T,0,0,T,T,T,T,T],
];

// =====================================================
// 적 몬스터
// =====================================================

// 박쥐 (12x12)
export const ENEMY_BAT: PixelData = [
  [T,T,1,T,T,T,T,T,T,1,T,T],
  [T,1,1,1,T,T,T,T,1,1,1,T],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [T,1,1,1,12,1,1,12,1,1,1,T],
  [T,T,1,1,1,1,1,1,1,1,T,T],
  [T,T,T,1,1,2,2,1,1,T,T,T],
  [T,T,T,T,1,1,1,1,T,T,T,T],
  [T,T,T,T,T,1,1,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T],
];

// 스켈레톤 (16x16)
export const ENEMY_SKELETON: PixelData = [
  [T,T,T,T,T,12,12,12,12,12,T,T,T,T,T,T],
  [T,T,T,T,12,0,12,12,12,0,12,T,T,T,T,T],
  [T,T,T,12,12,12,12,12,12,12,12,12,T,T,T,T],
  [T,T,T,12,0,0,12,12,12,0,0,12,T,T,T,T],
  [T,T,T,12,12,12,0,0,0,12,12,12,T,T,T,T],
  [T,T,T,T,12,12,12,12,12,12,12,T,T,T,T,T],
  [T,T,T,T,T,12,12,12,12,12,T,T,T,T,T,T],
  [T,T,12,12,12,12,12,12,12,12,12,12,T,T,T,T],
  [T,12,T,T,12,12,12,12,12,12,T,T,12,T,T,T],
  [T,12,T,T,T,12,12,12,12,12,T,T,12,T,T,T],
  [T,T,T,T,T,12,12,12,12,12,T,T,T,T,T,T],
  [T,T,T,T,T,12,T,T,T,12,T,T,T,T,T,T],
  [T,T,T,T,T,12,T,T,T,12,T,T,T,T,T,T],
  [T,T,T,T,12,12,T,T,T,12,12,T,T,T,T,T],
  [T,T,T,T,12,T,T,T,T,T,12,T,T,T,T,T],
  [T,T,T,T,12,12,T,T,T,12,12,T,T,T,T,T],
];

// 유령 (14x14)
export const ENEMY_GHOST: PixelData = [
  [T,T,T,T,10,10,10,10,10,10,T,T,T,T],
  [T,T,T,10,11,11,11,11,11,11,10,T,T,T],
  [T,T,10,11,11,11,11,11,11,11,11,10,T,T],
  [T,10,11,0,0,11,11,11,0,0,11,11,10,T],
  [T,10,11,0,0,11,11,11,0,0,11,11,10,T],
  [T,10,11,11,11,11,11,11,11,11,11,11,10,T],
  [T,10,11,11,11,8,8,8,11,11,11,11,10,T],
  [T,10,11,11,11,11,11,11,11,11,11,11,10,T],
  [T,10,11,11,11,11,11,11,11,11,11,11,10,T],
  [T,10,11,11,11,11,11,11,11,11,11,11,10,T],
  [T,T,10,11,11,11,11,11,11,11,11,10,T,T],
  [T,T,10,11,T,11,T,T,11,T,11,10,T,T],
  [T,T,T,10,T,10,T,T,10,T,10,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 슬라임 (14x14)
export const ENEMY_SLIME: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,5,5,5,5,T,T,T,T,T],
  [T,T,T,T,5,6,6,6,6,5,T,T,T,T],
  [T,T,T,5,6,6,6,6,6,6,5,T,T,T],
  [T,T,5,6,12,12,6,6,12,12,6,5,T,T],
  [T,T,5,6,0,12,6,6,0,12,6,5,T,T],
  [T,5,6,6,6,6,6,6,6,6,6,6,5,T],
  [T,5,6,6,6,6,6,6,6,6,6,6,5,T],
  [T,5,6,6,6,6,0,0,6,6,6,6,5,T],
  [5,6,6,6,6,6,6,6,6,6,6,6,6,5],
  [5,6,6,6,6,6,6,6,6,6,6,6,6,5],
  [5,6,6,6,6,6,6,6,6,6,6,6,6,5],
  [T,5,5,5,5,5,5,5,5,5,5,5,5,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 미니보스 (24x24)
export const ENEMY_MINIBOSS: PixelData = [
  [T,T,T,T,T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,2,3,3,3,3,3,3,3,3,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,3,3,3,3,3,3,3,3,3,3,2,T,T,T,T,T,T],
  [T,T,T,T,T,2,3,3,3,3,3,3,3,3,3,3,3,3,2,T,T,T,T,T],
  [T,T,T,T,2,3,3,0,0,3,3,3,3,0,0,3,3,3,3,2,T,T,T,T],
  [T,T,T,T,2,3,3,12,0,3,3,3,3,12,0,3,3,3,3,2,T,T,T,T],
  [T,T,T,T,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,T,T,T,T],
  [T,T,T,T,2,3,3,3,3,0,0,0,0,0,0,3,3,3,3,2,T,T,T,T],
  [T,T,T,T,T,2,3,3,3,3,3,3,3,3,3,3,3,3,2,T,T,T,T,T],
  [T,T,T,T,T,T,2,2,2,2,2,2,2,2,2,2,2,2,T,T,T,T,T,T],
  [T,T,T,2,2,2,2,1,1,1,1,1,1,1,1,1,1,2,2,2,2,T,T,T],
  [T,T,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,T,T],
  [T,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,T],
  [T,2,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,2,T],
  [T,2,3,T,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,T,3,2,T],
  [T,T,3,T,T,2,1,1,1,1,1,1,1,1,1,1,1,1,2,T,T,3,T,T],
  [T,T,T,T,T,2,1,1,1,1,1,1,1,1,1,1,1,1,2,T,T,T,T,T],
  [T,T,T,T,T,T,2,1,1,1,T,T,T,T,1,1,1,2,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,1,1,T,T,T,T,T,T,1,1,2,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,1,1,T,T,T,T,T,T,1,1,2,T,T,T,T,T,T],
  [T,T,T,T,T,2,2,1,1,T,T,T,T,T,T,1,1,2,2,T,T,T,T,T],
  [T,T,T,T,T,2,T,1,1,T,T,T,T,T,T,1,1,T,2,T,T,T,T,T],
  [T,T,T,T,T,2,T,1,1,T,T,T,T,T,T,1,1,T,2,T,T,T,T,T],
  [T,T,T,T,T,T,2,2,2,T,T,T,T,T,T,2,2,2,T,T,T,T,T,T],
];

// 보스 (32x32)
export const ENEMY_BOSS: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,3,3,3,3,3,3,3,3,3,3,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,3,4,4,4,4,4,4,4,4,4,4,3,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,3,4,4,4,4,4,4,4,4,4,4,4,4,3,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,3,4,4,4,0,0,0,4,4,4,4,4,4,0,0,0,4,4,4,3,T,T,T,T,T,T,T],
  [T,T,T,T,T,3,4,4,4,0,12,0,4,4,4,4,4,4,0,12,0,4,4,4,3,T,T,T,T,T,T],
  [T,T,T,T,T,3,4,4,4,0,0,0,4,4,4,4,4,4,0,0,0,4,4,4,3,T,T,T,T,T,T],
  [T,T,T,T,T,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,T,T,T,T,T,T],
  [T,T,T,T,T,T,3,4,4,4,4,4,0,0,0,0,0,0,4,4,4,4,4,3,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,3,3,3,3,3,3,3,3,3,3,3,3,3,3,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,T,T,T,T,T],
  [T,T,T,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,T,T,T,T],
  [T,T,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,T,T,T],
  [T,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,T,T],
  [T,2,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,2,T,T],
  [T,2,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,2,T,T],
  [T,T,3,3,T,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,T,3,3,T,T,T],
  [T,T,T,T,T,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,1,1,1,1,1,T,T,T,T,T,T,1,1,1,1,1,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,1,1,1,1,T,T,T,T,T,T,T,T,1,1,1,1,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,1,1,1,T,T,T,T,T,T,T,T,T,T,1,1,1,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,2,2,1,1,1,T,T,T,T,T,T,T,T,T,T,1,1,1,2,2,T,T,T,T,T,T],
  [T,T,T,T,T,2,T,1,1,1,T,T,T,T,T,T,T,T,T,T,1,1,1,T,2,T,T,T,T,T,T],
  [T,T,T,T,T,2,T,1,1,T,T,T,T,T,T,T,T,T,T,T,T,1,1,T,2,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,2,2,T,T,T,T,T,T,T,T,T,T,T,T,2,2,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// =====================================================
// 무기 아이콘 (16x16)
// =====================================================

export const WEAPON_DAGGER: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,13,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,13,12,13,T],
  [T,T,T,T,T,T,T,T,T,T,T,13,12,12,T,T],
  [T,T,T,T,T,T,T,T,T,T,13,12,12,T,T,T],
  [T,T,T,T,T,T,T,T,T,13,12,12,T,T,T,T],
  [T,T,T,T,T,T,T,T,13,12,12,T,T,T,T,T],
  [T,T,T,T,T,T,T,13,12,12,T,T,T,T,T,T],
  [T,T,T,T,T,T,13,12,12,T,T,T,T,T,T,T],
  [T,T,T,T,T,13,12,12,T,T,T,T,T,T,T,T],
  [T,T,T,T,3,13,12,T,T,T,T,T,T,T,T,T],
  [T,T,T,3,4,3,T,T,T,T,T,T,T,T,T,T],
  [T,T,3,4,4,T,T,T,T,T,T,T,T,T,T,T],
  [T,3,4,4,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,3,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const WEAPON_MAGIC_WAND: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,10,11,10,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,11,10,11,T],
  [T,T,T,T,T,T,T,T,T,T,T,10,11,10,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,9,9,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,9,9,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,9,9,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,9,9,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,9,9,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,9,9,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,9,9,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,9,9,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,9,9,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,9,9,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,9,9,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const WEAPON_BOW: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,4,4,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,4,4,4,T,T,T],
  [T,T,T,T,T,T,T,T,T,4,4,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,4,4,T,T,13,T,T,T],
  [T,T,T,T,T,T,T,4,4,T,T,13,13,T,T,T],
  [T,T,T,T,T,T,4,4,T,T,13,13,T,T,T,T],
  [T,T,T,T,T,4,4,T,T,13,13,T,T,T,T,T],
  [T,T,T,T,T,4,T,T,13,13,T,T,T,T,T,T],
  [T,T,T,T,T,4,T,13,13,T,T,T,T,T,T,T],
  [T,T,T,T,T,4,4,T,T,13,13,T,T,T,T,T],
  [T,T,T,T,T,T,4,4,T,T,13,13,T,T,T,T],
  [T,T,T,T,T,T,T,4,4,T,T,13,13,T,T,T],
  [T,T,T,T,T,T,T,T,4,4,T,T,13,T,T,T],
  [T,T,T,T,T,T,T,T,T,4,4,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,4,4,4,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,4,4,T,T,T],
];

export const WEAPON_AXE: PixelData = [
  [T,T,T,T,T,T,T,T,T,13,13,13,T,T,T,T],
  [T,T,T,T,T,T,T,T,13,14,14,14,13,T,T,T],
  [T,T,T,T,T,T,T,13,14,12,12,14,13,T,T,T],
  [T,T,T,T,T,T,13,14,12,12,14,13,T,T,T,T],
  [T,T,T,T,T,13,14,12,12,14,13,T,T,T,T,T],
  [T,T,T,T,T,13,14,14,14,13,T,T,T,T,T,T],
  [T,T,T,T,T,T,13,13,13,4,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,4,4,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,4,4,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,4,4,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,4,4,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,4,4,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,4,4,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,4,4,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,4,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const WEAPON_WHIP: PixelData = [
  [T,T,T,4,4,4,T,T,T,T,T,T,T,T,T,T],
  [T,T,4,4,4,4,4,T,T,T,T,T,T,T,T,T],
  [T,T,4,4,4,4,4,T,T,T,T,T,T,T,T,T],
  [T,T,T,4,4,4,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,1,1,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,1,1,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,1,1,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,1,1,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,1,1,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,1,1,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,1,1,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,1,1,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,1,1,T,T,T,T,3,T,T,T,T,T,T],
  [T,T,T,1,T,T,T,T,3,3,3,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,3,3,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const WEAPON_HOLY_WATER: PixelData = [
  [T,T,T,T,T,T,T,11,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,11,11,11,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,11,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,9,9,9,T,T,T,T,T,T,T],
  [T,T,T,T,T,9,10,10,10,9,T,T,T,T,T,T],
  [T,T,T,T,9,10,10,10,10,10,9,T,T,T,T,T],
  [T,T,T,T,9,10,10,10,10,10,9,T,T,T,T,T],
  [T,T,T,9,10,10,11,11,10,10,10,9,T,T,T,T],
  [T,T,T,9,10,10,11,11,10,10,10,9,T,T,T,T],
  [T,T,T,9,10,10,10,10,10,10,10,9,T,T,T,T],
  [T,T,T,9,10,10,10,10,10,10,10,9,T,T,T,T],
  [T,T,T,9,10,10,10,10,10,10,10,9,T,T,T,T],
  [T,T,T,T,9,10,10,10,10,10,9,T,T,T,T,T],
  [T,T,T,T,T,9,9,9,9,9,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const WEAPON_GARLIC: PixelData = [
  [T,T,T,T,T,T,T,6,6,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,6,6,6,6,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,6,6,T,T,T,T,T,T,T],
  [T,T,T,T,T,12,12,12,12,12,T,T,T,T,T,T],
  [T,T,T,T,12,4,4,4,4,4,12,T,T,T,T,T],
  [T,T,T,12,4,12,4,4,4,12,4,12,T,T,T,T],
  [T,T,T,12,4,12,4,4,4,12,4,12,T,T,T,T],
  [T,T,12,4,4,12,4,4,4,12,4,4,12,T,T,T],
  [T,T,12,4,4,12,4,4,4,12,4,4,12,T,T,T],
  [T,T,12,4,4,4,12,12,12,4,4,4,12,T,T,T],
  [T,T,12,4,4,4,4,4,4,4,4,4,12,T,T,T],
  [T,T,T,12,4,4,4,4,4,4,4,12,T,T,T,T],
  [T,T,T,T,12,4,4,4,4,4,12,T,T,T,T,T],
  [T,T,T,T,T,12,12,12,12,12,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const WEAPON_LIGHTNING_RING: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,3,3,3,3,T,T,T,T,T,T],
  [T,T,T,T,T,3,4,4,4,4,3,T,T,T,T,T],
  [T,T,T,T,3,4,3,3,3,3,4,3,T,T,T,T],
  [T,T,T,3,4,3,T,T,T,T,3,4,3,T,T,T],
  [T,T,T,3,4,3,T,10,T,T,3,4,3,T,T,T],
  [T,T,3,4,3,T,10,10,10,T,T,3,4,3,T,T],
  [T,T,3,4,3,T,T,10,T,T,T,3,4,3,T,T],
  [T,T,3,4,3,T,T,10,T,T,T,3,4,3,T,T],
  [T,T,3,4,3,T,T,10,10,T,T,3,4,3,T,T],
  [T,T,T,3,4,3,T,T,10,T,3,4,3,T,T,T],
  [T,T,T,3,4,3,T,T,T,T,3,4,3,T,T,T],
  [T,T,T,T,3,4,3,3,3,3,4,3,T,T,T,T],
  [T,T,T,T,T,3,4,4,4,4,3,T,T,T,T,T],
  [T,T,T,T,T,T,3,3,3,3,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const WEAPON_BIBLE: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T],
  [T,T,T,2,1,1,1,1,1,1,1,1,2,T,T,T],
  [T,T,T,2,1,12,12,12,12,12,1,1,2,T,T,T],
  [T,T,T,2,1,12,3,12,3,12,1,1,2,T,T,T],
  [T,T,T,2,1,12,3,3,3,12,1,1,2,T,T,T],
  [T,T,T,2,1,12,3,12,3,12,1,1,2,T,T,T],
  [T,T,T,2,1,12,12,12,12,12,1,1,2,T,T,T],
  [T,T,T,2,1,12,12,12,12,12,1,1,2,T,T,T],
  [T,T,T,2,1,12,12,12,12,12,1,1,2,T,T,T],
  [T,T,T,2,1,12,12,12,12,12,1,1,2,T,T,T],
  [T,T,T,2,1,12,12,12,12,12,1,1,2,T,T,T],
  [T,T,T,2,1,1,1,1,1,1,1,1,2,T,T,T],
  [T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const WEAPON_FIREBALL: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,3,3,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,3,4,4,3,T,T,T,T,T,T],
  [T,T,T,T,T,3,4,4,4,4,3,T,T,T,T,T],
  [T,T,T,T,3,4,4,3,3,4,4,3,T,T,T,T],
  [T,T,T,3,4,4,3,2,2,3,4,4,3,T,T,T],
  [T,T,T,3,4,3,2,2,2,2,3,4,3,T,T,T],
  [T,T,3,4,4,3,2,2,2,2,3,4,4,3,T,T],
  [T,T,3,4,4,3,2,2,2,2,3,4,4,3,T,T],
  [T,T,T,3,4,3,2,2,2,2,3,4,3,T,T,T],
  [T,T,T,3,4,4,3,2,2,3,4,4,3,T,T,T],
  [T,T,T,T,3,4,4,3,3,4,4,3,T,T,T,T],
  [T,T,T,T,T,3,4,4,4,4,3,T,T,T,T,T],
  [T,T,T,T,T,T,3,4,4,3,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,3,3,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// =====================================================
// 진화 무기 (16x16)
// =====================================================

// 천개의 칼날 (단검 진화) - 여러 칼날이 방사형으로 퍼진 형태
export const WEAPON_THOUSAND_EDGE: PixelData = [
  [T,T,T,13,T,T,T,T,T,T,T,T,13,T,T,T],
  [T,T,13,12,13,T,T,T,T,T,13,12,13,T,T,T],
  [T,13,12,12,T,13,T,T,T,13,T,12,12,13,T,T],
  [13,12,12,T,T,T,13,T,13,T,T,T,12,12,13,T],
  [T,13,T,T,T,T,T,10,T,T,T,T,T,13,T,T],
  [T,T,13,T,T,T,10,10,10,T,T,T,13,T,T,T],
  [T,T,T,13,T,10,3,3,3,10,T,13,T,T,T,T],
  [T,T,T,T,10,3,4,4,4,3,10,T,T,T,T,T],
  [T,T,T,T,10,3,4,4,4,3,10,T,T,T,T,T],
  [T,T,T,13,T,10,3,3,3,10,T,13,T,T,T,T],
  [T,T,13,T,T,T,10,10,10,T,T,T,13,T,T,T],
  [T,13,T,T,T,T,T,10,T,T,T,T,T,13,T,T],
  [13,12,12,T,T,T,13,T,13,T,T,T,12,12,13,T],
  [T,13,12,12,T,13,T,T,T,13,T,12,12,13,T,T],
  [T,T,13,12,13,T,T,T,T,T,13,12,13,T,T,T],
  [T,T,T,13,T,T,T,T,T,T,T,T,13,T,T,T],
];

// 홀리 완드 (마법봉 진화) - 신성한 빛을 뿜는 지팡이
export const WEAPON_HOLY_WAND: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,3,10,3,T],
  [T,T,T,T,T,T,T,T,T,T,T,3,10,11,10,3],
  [T,T,T,T,T,T,T,T,T,T,3,10,11,10,3,T],
  [T,T,T,T,T,T,T,T,T,T,T,3,10,3,T,T],
  [T,T,T,T,T,T,T,T,T,T,9,9,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,9,10,9,T,T,T,T],
  [T,T,T,T,T,T,T,T,9,10,9,T,T,T,T,T],
  [T,T,T,T,T,T,T,9,10,9,T,T,T,T,T,T],
  [T,T,T,T,T,T,9,10,9,T,T,T,T,T,T,T],
  [T,T,T,T,T,9,10,9,T,T,T,T,T,T,T,T],
  [T,T,T,T,9,10,9,T,T,T,T,T,T,T,T,T],
  [T,T,T,9,10,9,T,T,T,T,T,T,T,T,T,T],
  [T,T,9,10,9,T,T,T,T,T,T,T,T,T,T,T],
  [T,9,10,9,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,3,9,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 소울 이터 (활 진화) - 영혼을 흡수하는 검은 활
export const WEAPON_SOUL_EATER: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,1,1,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,1,9,1,T,T,T],
  [T,T,T,T,T,T,T,T,T,1,9,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,1,9,T,T,13,T,T,T],
  [T,T,T,T,T,T,T,1,9,T,T,13,12,T,T,T],
  [T,T,T,T,T,T,1,9,T,T,13,12,T,T,T,T],
  [T,T,T,T,T,1,9,T,T,13,12,T,T,T,T,T],
  [T,T,T,T,T,1,T,T,13,12,T,T,T,T,T,T],
  [T,T,T,T,T,1,T,13,12,T,T,T,T,T,T,T],
  [T,T,T,T,T,1,9,T,T,13,12,T,T,T,T,T],
  [T,T,T,T,T,T,1,9,T,T,13,12,T,T,T,T],
  [T,T,T,T,T,T,T,1,9,T,T,13,12,T,T,T],
  [T,T,T,T,T,T,T,T,1,9,T,T,13,T,T,T],
  [T,T,T,T,T,T,T,T,T,1,9,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,1,9,1,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,1,1,T,T,T],
];

// 죽음의 소용돌이 (도끼 진화) - 거대한 회전 도끼
export const WEAPON_DEATH_SPIRAL: PixelData = [
  [T,T,T,T,T,1,1,1,1,1,1,T,T,T,T,T],
  [T,T,T,T,1,14,14,14,14,14,14,1,T,T,T,T],
  [T,T,T,1,14,12,12,12,12,12,14,1,T,T,T,T],
  [T,T,1,14,12,12,12,12,12,12,14,1,T,T,T,T],
  [T,1,14,12,12,12,1,1,12,12,12,14,1,T,T,T],
  [1,14,12,12,12,1,4,4,1,12,12,12,14,1,T,T],
  [1,14,12,12,1,4,4,4,4,1,12,12,14,1,T,T],
  [1,14,12,12,1,4,4,4,4,1,12,12,14,1,T,T],
  [1,14,12,12,1,4,4,4,4,1,12,12,14,1,T,T],
  [1,14,12,12,12,1,4,4,1,12,12,12,14,1,T,T],
  [T,1,14,12,12,12,1,1,12,12,12,14,1,T,T,T],
  [T,T,1,14,12,12,12,12,12,12,14,1,T,T,T,T],
  [T,T,T,1,14,12,12,12,12,12,14,1,T,T,T,T],
  [T,T,T,T,1,14,14,14,14,14,14,1,T,T,T,T],
  [T,T,T,T,T,1,1,1,1,1,1,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 피의 눈물 (채찍 진화) - 붉은 피가 흐르는 채찍
export const WEAPON_BLOODY_TEAR: PixelData = [
  [T,T,T,2,2,2,T,T,T,T,T,T,T,T,T,T],
  [T,T,2,2,3,2,2,T,T,T,T,T,T,T,T,T],
  [T,T,2,3,3,3,2,T,T,T,T,T,T,T,T,T],
  [T,T,T,2,2,2,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,2,2,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,2,2,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,2,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,2,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,2,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,2,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,2,2,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,2,2,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,2,2,T,T,T,T,2,T,T,T,T,T,T],
  [T,T,T,2,T,T,T,T,2,3,2,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,2,2,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 라 보라 (성수 진화) - 거대한 신성 오라
export const WEAPON_LA_BORRA: PixelData = [
  [T,T,T,T,T,10,10,10,10,10,T,T,T,T,T,T],
  [T,T,T,10,10,11,11,11,11,11,10,10,T,T,T,T],
  [T,T,10,11,11,10,10,10,10,10,11,11,10,T,T,T],
  [T,10,11,10,10,10,11,11,11,10,10,10,11,10,T,T],
  [T,10,11,10,11,11,11,11,11,11,11,10,11,10,T,T],
  [10,11,10,10,11,11,10,10,10,11,11,10,10,11,10,T],
  [10,11,10,11,11,10,10,10,10,10,11,11,10,11,10,T],
  [10,11,10,11,11,10,10,10,10,10,11,11,10,11,10,T],
  [10,11,10,11,11,10,10,10,10,10,11,11,10,11,10,T],
  [10,11,10,10,11,11,10,10,10,11,11,10,10,11,10,T],
  [T,10,11,10,11,11,11,11,11,11,11,10,11,10,T,T],
  [T,10,11,10,10,10,11,11,11,10,10,10,11,10,T,T],
  [T,T,10,11,11,10,10,10,10,10,11,11,10,T,T,T],
  [T,T,T,10,10,11,11,11,11,11,10,10,T,T,T,T],
  [T,T,T,T,T,10,10,10,10,10,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 천둥 고리 (번개 반지 진화) - 연쇄 번개 반지
export const WEAPON_THUNDER_LOOP: PixelData = [
  [T,T,T,T,T,T,T,10,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,3,3,10,3,3,T,T,T,T,T,T],
  [T,T,T,T,3,4,10,10,10,4,3,T,T,T,T,T],
  [T,T,T,3,4,3,10,10,10,3,4,3,T,T,T,T],
  [T,T,3,4,3,T,T,10,T,T,3,4,3,T,T,T],
  [T,3,4,3,T,T,10,10,10,T,T,3,4,3,T,T],
  [T,3,10,10,T,10,T,T,T,10,T,10,10,3,T,T],
  [10,10,10,10,10,10,T,T,T,10,10,10,10,10,10,T],
  [T,3,10,10,T,10,T,T,T,10,T,10,10,3,T,T],
  [T,3,4,3,T,T,10,10,10,T,T,3,4,3,T,T],
  [T,T,3,4,3,T,T,10,T,T,3,4,3,T,T,T],
  [T,T,T,3,4,3,10,10,10,3,4,3,T,T,T,T],
  [T,T,T,T,3,4,10,10,10,4,3,T,T,T,T,T],
  [T,T,T,T,T,3,3,10,3,3,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,10,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 불경한 성가 (성경 진화) - 악마의 힘을 받은 성경
export const WEAPON_UNHOLY_VESPERS: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,1,1,1,1,1,1,1,1,T,T,T,T],
  [T,T,T,1,9,9,9,9,9,9,9,9,1,T,T,T],
  [T,T,T,1,9,0,0,0,0,0,9,9,1,T,T,T],
  [T,T,T,1,9,0,2,0,2,0,9,9,1,T,T,T],
  [T,T,T,1,9,0,2,2,2,0,9,9,1,T,T,T],
  [T,T,T,1,9,0,2,0,2,0,9,9,1,T,T,T],
  [T,T,T,1,9,0,0,0,0,0,9,9,1,T,T,T],
  [T,T,T,1,9,0,0,0,0,0,9,9,1,T,T,T],
  [T,T,T,1,9,0,0,0,0,0,9,9,1,T,T,T],
  [T,T,T,1,9,0,0,0,0,0,9,9,1,T,T,T],
  [T,T,T,1,9,0,0,0,0,0,9,9,1,T,T,T],
  [T,T,T,1,9,9,9,9,9,9,9,9,1,T,T,T],
  [T,T,T,T,1,1,1,1,1,1,1,1,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 지옥불 (파이어볼 진화) - 거대한 지옥 화염
export const WEAPON_HELLFIRE: PixelData = [
  [T,T,T,T,T,T,T,2,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,3,3,2,T,T,T,T,T,T],
  [T,T,T,T,T,2,3,3,3,3,2,T,T,T,T,T],
  [T,T,T,T,2,3,3,4,4,3,3,2,T,T,T,T],
  [T,T,T,2,3,3,4,4,4,4,3,3,2,T,T,T],
  [T,T,2,3,3,4,4,3,3,4,4,3,3,2,T,T],
  [T,T,2,3,4,4,3,2,2,3,4,4,3,2,T,T],
  [T,2,3,3,4,3,2,2,2,2,3,4,3,3,2,T],
  [T,2,3,3,4,3,2,2,2,2,3,4,3,3,2,T],
  [T,T,2,3,4,4,3,2,2,3,4,4,3,2,T,T],
  [T,T,2,3,3,4,4,3,3,4,4,3,3,2,T,T],
  [T,T,T,2,3,3,4,4,4,4,3,3,2,T,T,T],
  [T,T,T,T,2,3,3,4,4,3,3,2,T,T,T,T],
  [T,T,T,T,T,2,3,3,3,3,2,T,T,T,T,T],
  [T,T,T,T,T,T,2,3,3,2,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,2,2,T,T,T,T,T,T,T],
];

// =====================================================
// 패시브 아이콘 (16x16)
// =====================================================

export const PASSIVE_BRACER: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,13,13,13,13,13,13,13,T,T,T,T,T],
  [T,T,T,13,14,14,14,14,14,14,14,13,T,T,T,T],
  [T,T,13,14,3,3,14,14,14,3,3,14,13,T,T,T],
  [T,T,13,14,3,3,14,14,14,3,3,14,13,T,T,T],
  [T,T,13,14,14,14,14,14,14,14,14,14,13,T,T,T],
  [T,T,13,14,14,14,14,14,14,14,14,14,13,T,T,T],
  [T,T,13,14,14,14,14,14,14,14,14,14,13,T,T,T],
  [T,T,13,14,14,14,14,14,14,14,14,14,13,T,T,T],
  [T,T,13,14,14,14,14,14,14,14,14,14,13,T,T,T],
  [T,T,T,13,14,14,14,14,14,14,14,13,T,T,T,T],
  [T,T,T,T,13,13,13,13,13,13,13,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const PASSIVE_HOLLOW_HEART: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,2,2,T,T,T,T,T,2,2,T,T,T,T],
  [T,T,2,3,3,2,T,T,T,2,3,3,2,T,T,T],
  [T,2,3,3,3,3,2,T,2,3,3,3,3,2,T,T],
  [T,2,3,3,T,3,3,2,3,3,T,3,3,2,T,T],
  [T,2,3,T,T,T,3,3,3,T,T,T,3,2,T,T],
  [T,T,2,3,T,T,T,3,T,T,T,3,2,T,T,T],
  [T,T,T,2,3,T,T,T,T,T,3,2,T,T,T,T],
  [T,T,T,T,2,3,T,T,T,3,2,T,T,T,T,T],
  [T,T,T,T,T,2,3,T,3,2,T,T,T,T,T,T],
  [T,T,T,T,T,T,2,3,2,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,2,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const PASSIVE_PUMMAROLA: PixelData = [
  [T,T,T,T,T,T,T,6,6,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,6,6,6,6,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,6,6,T,T,T,T,T,T,T],
  [T,T,T,T,T,2,2,2,2,2,T,T,T,T,T,T],
  [T,T,T,T,2,3,3,3,3,3,2,T,T,T,T,T],
  [T,T,T,2,3,3,3,3,3,3,3,2,T,T,T,T],
  [T,T,T,2,3,12,3,3,3,3,3,2,T,T,T,T],
  [T,T,2,3,3,12,3,3,3,3,3,3,2,T,T,T],
  [T,T,2,3,3,3,3,3,3,3,3,3,2,T,T,T],
  [T,T,2,3,3,3,3,3,3,3,3,3,2,T,T,T],
  [T,T,2,3,3,3,3,3,3,3,3,3,2,T,T,T],
  [T,T,T,2,3,3,3,3,3,3,3,2,T,T,T,T],
  [T,T,T,T,2,3,3,3,3,3,2,T,T,T,T,T],
  [T,T,T,T,T,2,2,2,2,2,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const PASSIVE_EMPTY_TOME: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,1,1,1,1,1,1,1,1,T,T,T,T],
  [T,T,T,1,4,4,4,4,4,4,4,4,1,T,T,T],
  [T,T,T,1,4,4,4,4,4,4,4,4,1,T,T,T],
  [T,T,T,1,4,14,14,14,14,14,4,4,1,T,T,T],
  [T,T,T,1,4,14,14,14,14,14,4,4,1,T,T,T],
  [T,T,T,1,4,14,14,14,14,14,4,4,1,T,T,T],
  [T,T,T,1,4,14,14,14,14,14,4,4,1,T,T,T],
  [T,T,T,1,4,14,14,14,14,14,4,4,1,T,T,T],
  [T,T,T,1,4,14,14,14,14,14,4,4,1,T,T,T],
  [T,T,T,1,4,14,14,14,14,14,4,4,1,T,T,T],
  [T,T,T,1,4,4,4,4,4,4,4,4,1,T,T,T],
  [T,T,T,T,1,1,1,1,1,1,1,1,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const PASSIVE_CANDELABRADOR: PixelData = [
  [T,T,T,T,T,T,T,3,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,3,4,3,T,T,T,T,T,T,T],
  [T,T,T,3,T,T,T,3,T,T,T,3,T,T,T,T],
  [T,T,3,4,3,T,T,3,T,T,3,4,3,T,T,T],
  [T,T,T,3,T,T,T,3,T,T,T,3,T,T,T,T],
  [T,T,T,3,3,3,3,3,3,3,3,3,T,T,T,T],
  [T,T,T,T,T,T,T,3,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,3,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,3,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,3,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,3,3,3,T,T,T,T,T,T,T],
  [T,T,T,T,T,3,3,3,3,3,T,T,T,T,T,T],
  [T,T,T,T,T,T,3,3,3,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const PASSIVE_ATTRACTORB: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,9,9,9,9,T,T,T,T,T,T],
  [T,T,T,T,T,9,10,10,10,10,9,T,T,T,T,T],
  [T,T,T,T,9,10,10,10,10,10,10,9,T,T,T,T],
  [T,T,T,9,10,10,8,8,8,10,10,10,9,T,T,T],
  [T,T,T,9,10,8,8,8,8,8,10,10,9,T,T,T],
  [T,T,9,10,10,8,8,8,8,8,10,10,10,9,T,T],
  [T,T,9,10,10,8,8,8,8,8,10,10,10,9,T,T],
  [T,T,9,10,10,8,8,8,8,8,10,10,10,9,T,T],
  [T,T,T,9,10,8,8,8,8,8,10,10,9,T,T,T],
  [T,T,T,9,10,10,8,8,8,10,10,10,9,T,T,T],
  [T,T,T,T,9,10,10,10,10,10,10,9,T,T,T,T],
  [T,T,T,T,T,9,10,10,10,10,9,T,T,T,T,T],
  [T,T,T,T,T,T,9,9,9,9,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// 뾰족한 화살촉 (관통력 증가)
export const PASSIVE_DUPLICATOR: PixelData = [
  [T,T,T,T,T,T,T,0,0,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,0,12,13,0,T,T,T,T,T,T],
  [T,T,T,T,T,0,12,13,14,13,0,T,T,T,T,T],
  [T,T,T,T,0,12,13,14,14,13,12,0,T,T,T,T],
  [T,T,T,0,12,13,14,14,14,14,13,12,0,T,T,T],
  [T,T,T,0,13,14,14,0,0,14,14,13,0,T,T,T],
  [T,T,T,T,0,14,0,T,T,0,14,0,T,T,T,T],
  [T,T,T,T,T,0,T,T,T,T,0,T,T,T,T,T],
  [T,T,T,T,T,0,T,T,T,T,0,T,T,T,T,T],
  [T,T,T,T,0,14,0,T,T,0,14,0,T,T,T,T],
  [T,T,T,0,14,14,14,0,0,14,14,14,0,T,T,T],
  [T,T,T,0,3,3,0,T,T,0,3,3,0,T,T,T],
  [T,T,T,T,0,0,T,T,T,T,0,0,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const PASSIVE_SPELLBINDER: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,1,1,1,1,1,1,1,1,T,T,T,T],
  [T,T,T,1,2,2,2,2,2,2,2,2,1,T,T,T],
  [T,T,T,1,2,10,10,10,10,2,2,2,1,T,T,T],
  [T,T,T,1,2,10,10,10,10,2,2,2,1,T,T,T],
  [T,T,T,1,2,10,10,10,10,2,2,2,1,T,T,T],
  [T,T,T,1,2,10,10,10,10,2,2,2,1,T,T,T],
  [T,T,T,1,2,10,10,10,10,2,2,2,1,T,T,T],
  [T,T,T,1,2,10,10,10,10,2,2,2,1,T,T,T],
  [T,T,T,1,2,10,10,10,10,2,2,2,1,T,T,T],
  [T,T,T,1,2,2,2,2,2,2,2,2,1,T,T,T],
  [T,T,T,T,1,1,1,1,1,1,1,1,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const PASSIVE_SPINACH: PixelData = [
  [T,T,T,T,T,T,T,T,6,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,6,6,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,6,5,6,T,T,T,T,T,T,T],
  [T,T,T,T,T,6,5,5,5,6,T,T,T,T,T,T],
  [T,T,T,T,6,5,5,5,5,5,6,T,T,T,T,T],
  [T,T,T,6,5,5,5,5,5,5,5,6,T,T,T,T],
  [T,T,6,5,5,5,6,5,5,5,5,5,6,T,T,T],
  [T,6,5,5,5,6,6,6,5,5,5,5,5,6,T,T],
  [T,T,6,5,5,6,6,6,5,5,5,5,6,T,T,T],
  [T,T,T,6,5,5,6,5,5,5,5,6,T,T,T,T],
  [T,T,T,T,6,5,5,5,5,5,6,T,T,T,T,T],
  [T,T,T,T,T,6,5,5,5,6,T,T,T,T,T,T],
  [T,T,T,T,T,T,6,5,6,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,6,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

export const PASSIVE_CROWN: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,3,T,T,T,3,T,T,T,3,T,T,T,T],
  [T,T,T,3,T,T,T,3,T,T,T,3,T,T,T,T],
  [T,T,3,4,3,T,3,4,3,T,3,4,3,T,T,T],
  [T,T,3,4,4,3,3,4,3,3,4,4,3,T,T,T],
  [T,T,3,4,4,4,4,4,4,4,4,4,3,T,T,T],
  [T,T,3,4,2,4,4,2,4,4,2,4,3,T,T,T],
  [T,T,3,4,4,4,4,4,4,4,4,4,3,T,T,T],
  [T,T,T,3,4,4,4,4,4,4,4,3,T,T,T,T],
  [T,T,T,T,3,3,3,3,3,3,3,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// =====================================================
// 아이템 (경험치 젬, 체력 오브, 코인, 상자)
// =====================================================

// 경험치 젬 (극소) 6x6 연파랑
export const ITEM_EXP_TINY: PixelData = [
  [T,T,8,8,T,T],
  [T,8,9,9,8,T],
  [8,9,10,10,9,8],
  [8,9,10,10,9,8],
  [T,8,9,9,8,T],
  [T,T,8,8,T,T],
];

// 경험치 젬 (소) 8x8 파랑
export const ITEM_EXP_SMALL: PixelData = [
  [T,T,T,9,9,T,T,T],
  [T,T,9,10,10,9,T,T],
  [T,9,10,10,10,10,9,T],
  [9,10,10,11,10,10,10,9],
  [9,10,10,11,10,10,10,9],
  [T,9,10,10,10,10,9,T],
  [T,T,9,10,10,9,T,T],
  [T,T,T,9,9,T,T,T],
];

// 경험치 젬 (중) 10x10 녹색
export const ITEM_EXP_MEDIUM: PixelData = [
  [T,T,T,T,6,6,T,T,T,T],
  [T,T,T,6,5,5,6,T,T,T],
  [T,T,6,5,5,5,5,6,T,T],
  [T,6,5,5,5,5,5,5,6,T],
  [6,5,5,5,12,5,5,5,5,6],
  [6,5,5,5,12,5,5,5,5,6],
  [T,6,5,5,5,5,5,5,6,T],
  [T,T,6,5,5,5,5,6,T,T],
  [T,T,T,6,5,5,6,T,T,T],
  [T,T,T,T,6,6,T,T,T,T],
];

// 경험치 젬 (대) 12x12 빨강
export const ITEM_EXP_LARGE: PixelData = [
  [T,T,T,T,T,2,2,T,T,T,T,T],
  [T,T,T,T,2,3,3,2,T,T,T,T],
  [T,T,T,2,3,3,3,3,2,T,T,T],
  [T,T,2,3,3,3,3,3,3,2,T,T],
  [T,2,3,3,3,3,3,3,3,3,2,T],
  [2,3,3,3,3,12,3,3,3,3,3,2],
  [2,3,3,3,3,12,3,3,3,3,3,2],
  [T,2,3,3,3,3,3,3,3,3,2,T],
  [T,T,2,3,3,3,3,3,3,2,T,T],
  [T,T,T,2,3,3,3,3,2,T,T,T],
  [T,T,T,T,2,3,3,2,T,T,T,T],
  [T,T,T,T,T,2,2,T,T,T,T,T],
];

// 경험치 젬 (극대) 14x14 보라/금색
export const ITEM_EXP_HUGE: PixelData = [
  [T,T,T,T,T,T,1,1,T,T,T,T,T,T],
  [T,T,T,T,T,1,9,9,1,T,T,T,T,T],
  [T,T,T,T,1,9,10,10,9,1,T,T,T,T],
  [T,T,T,1,9,10,10,10,10,9,1,T,T,T],
  [T,T,1,9,10,10,10,10,10,10,9,1,T,T],
  [T,1,9,10,10,10,10,10,10,10,10,9,1,T],
  [1,9,10,10,10,10,4,4,10,10,10,10,9,1],
  [1,9,10,10,10,10,4,4,10,10,10,10,9,1],
  [T,1,9,10,10,10,10,10,10,10,10,9,1,T],
  [T,T,1,9,10,10,10,10,10,10,9,1,T,T],
  [T,T,T,1,9,10,10,10,10,9,1,T,T,T],
  [T,T,T,T,1,9,10,10,9,1,T,T,T,T],
  [T,T,T,T,T,1,9,9,1,T,T,T,T,T],
  [T,T,T,T,T,T,1,1,T,T,T,T,T,T],
];

// 체력 오브 10x10 분홍/빨강
export const ITEM_HEALTH: PixelData = [
  [T,T,2,2,T,T,2,2,T,T],
  [T,2,3,3,2,2,3,3,2,T],
  [2,3,3,3,3,3,3,3,3,2],
  [2,3,12,3,3,3,3,3,3,2],
  [2,3,12,3,3,3,3,3,3,2],
  [2,3,3,3,3,3,3,3,3,2],
  [T,2,3,3,3,3,3,3,2,T],
  [T,T,2,3,3,3,3,2,T,T],
  [T,T,T,2,3,3,2,T,T,T],
  [T,T,T,T,2,2,T,T,T,T],
];

// 코인 8x8 금색
export const ITEM_COIN: PixelData = [
  [T,T,3,3,3,3,T,T],
  [T,3,4,4,4,4,3,T],
  [3,4,4,3,3,4,4,3],
  [3,4,3,4,4,3,4,3],
  [3,4,3,4,4,3,4,3],
  [3,4,4,3,3,4,4,3],
  [T,3,4,4,4,4,3,T],
  [T,T,3,3,3,3,T,T],
];

// 상자 16x16 갈색
export const ITEM_CHEST: PixelData = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,1,1,1,1,1,1,1,1,1,1,1,1,T,T],
  [T,1,4,4,4,4,4,4,4,4,4,4,4,4,1,T],
  [T,1,4,3,3,3,3,3,3,3,3,3,3,4,1,T],
  [T,1,4,3,3,3,3,3,3,3,3,3,3,4,1,T],
  [T,1,4,3,3,3,3,3,3,3,3,3,3,4,1,T],
  [T,1,1,1,1,1,3,3,3,1,1,1,1,1,1,T],
  [T,1,4,4,4,4,3,3,3,4,4,4,4,4,1,T],
  [T,1,4,4,4,4,4,4,4,4,4,4,4,4,1,T],
  [T,1,4,4,4,4,4,4,4,4,4,4,4,4,1,T],
  [T,1,4,4,4,4,4,4,4,4,4,4,4,4,1,T],
  [T,1,4,4,4,4,4,4,4,4,4,4,4,4,1,T],
  [T,1,4,4,4,4,4,4,4,4,4,4,4,4,1,T],
  [T,T,1,1,1,1,1,1,1,1,1,1,1,1,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
];

// =====================================================
// 배경 타일 (16x16)
// =====================================================

export const TILE_GRASS: PixelData = [
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,5,6,6,6,6,5,6,6,6,6,6,5,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,5,6,6,6,6,6,6],
  [6,6,6,5,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,5,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,5,6,6,6,6],
  [6,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,5,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,5,6,6,6],
  [6,6,5,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,5,6,6,6,6,6],
  [6,6,6,6,6,5,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,5,6],
];

export const TILE_STONE: PixelData = [
  [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
  [14,13,13,13,14,13,13,14,14,13,13,13,14,13,13,14],
  [14,13,13,14,14,13,14,14,14,13,13,14,14,13,14,14],
  [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
  [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
  [14,13,14,14,13,13,13,14,14,13,14,14,13,13,13,14],
  [14,14,14,14,13,13,14,14,14,14,14,14,13,13,14,14],
  [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
  [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
  [14,13,13,13,14,13,13,14,14,13,13,13,14,13,13,14],
  [14,13,13,14,14,13,14,14,14,13,13,14,14,13,14,14],
  [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
  [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
  [14,13,14,14,13,13,13,14,14,13,14,14,13,13,13,14],
  [14,14,14,14,13,13,14,14,14,14,14,14,13,13,14,14],
  [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
];

export const TILE_WATER: PixelData = [
  [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  [7,10,7,7,7,7,10,7,7,7,7,7,10,7,7,7],
  [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,7,7,7,7,10,7,7,7,7,7,7],
  [7,7,7,10,7,7,7,7,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,7,7,7,7,7,7,7,7,7,10,7],
  [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,7,7,7,7,7,7,10,7,7,7,7],
  [7,10,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,7,7,10,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,7,7,7,7,7,7,7,10,7,7,7],
  [7,7,10,7,7,7,7,7,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,7,7,7,7,7,10,7,7,7,7,7],
  [7,7,7,7,7,10,7,7,7,7,7,7,7,7,7,7],
  [7,7,7,7,7,7,7,7,7,7,7,7,7,7,10,7],
];

// =====================================================
// 투사체 (8x8)
// =====================================================

export const PROJECTILE_DEFAULT: PixelData = [
  [T,T,T,12,12,T,T,T],
  [T,T,12,12,12,12,T,T],
  [T,12,12,12,12,12,12,T],
  [12,12,12,12,12,12,12,12],
  [12,12,12,12,12,12,12,12],
  [T,12,12,12,12,12,12,T],
  [T,T,12,12,12,12,T,T],
  [T,T,T,12,12,T,T,T],
];

export const PROJECTILE_MAGIC: PixelData = [
  [T,T,T,9,9,T,T,T],
  [T,T,9,10,10,9,T,T],
  [T,9,10,11,11,10,9,T],
  [9,10,11,11,11,11,10,9],
  [9,10,11,11,11,11,10,9],
  [T,9,10,11,11,10,9,T],
  [T,T,9,10,10,9,T,T],
  [T,T,T,9,9,T,T,T],
];

// 파이어볼 투사체 (8x8) - 아주 작은 불꽃
export const PROJECTILE_FIRE: PixelData = [
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,3,T,T,T],
  [T,T,3,4,2,4,T,T],
  [T,T,3,4,2,4,T,T],
  [T,T,T,T,3,T,T,T],
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
];

// 단검 투사체 (8x8) - 오른쪽(→)을 향하는 날카로운 단검
export const PROJECTILE_DAGGER: PixelData = [
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
  [6,6,12,12,13,13,13,12],
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
];

// 화살 투사체 (8x8) - 얇은 화살 (깃털+촉)
export const PROJECTILE_ARROW: PixelData = [
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
  [2,T,T,T,T,T,T,13],
  [T,2,19,3,3,13,12,12],
  [T,2,19,3,3,13,12,12],
  [2,T,T,T,T,T,T,13],
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T],
];

// 도끼 투사체 (8x8) - 작은 도끼
export const PROJECTILE_AXE: PixelData = [
  [T,T,T,T,T,T,T,T],
  [T,T,T,T,13,13,T,T],
  [T,T,T,13,14,12,13,T],
  [T,T,T,13,12,14,13,T],
  [T,T,T,T,13,13,4,T],
  [T,T,T,T,T,4,4,T],
  [T,T,T,T,4,4,T,T],
  [T,T,T,T,T,T,T,T],
];

// =====================================================
// 스프라이트 키 매핑
// =====================================================

export const SPRITE_KEYS = {
  // 플레이어
  PLAYER_KNIGHT: 'player_knight',
  PLAYER_MAGE: 'player_mage',
  PLAYER_ROGUE: 'player_rogue',

  // 적
  ENEMY_BAT: 'enemy_bat',
  ENEMY_SKELETON: 'enemy_skeleton',
  ENEMY_GHOST: 'enemy_ghost',
  ENEMY_SLIME: 'enemy_slime',
  ENEMY_MINIBOSS: 'enemy_miniboss',
  ENEMY_BOSS: 'enemy_boss',

  // 무기
  WEAPON_DAGGER: 'weapon_dagger',
  WEAPON_MAGIC_WAND: 'weapon_magic_wand',
  WEAPON_BOW: 'weapon_bow',
  WEAPON_AXE: 'weapon_axe',
  WEAPON_WHIP: 'weapon_whip',
  WEAPON_HOLY_WATER: 'weapon_holy_water',
  WEAPON_GARLIC: 'weapon_garlic',
  WEAPON_LIGHTNING_RING: 'weapon_lightning_ring',
  WEAPON_BIBLE: 'weapon_bible',
  WEAPON_FIREBALL: 'weapon_fireball',

  // 진화 무기
  WEAPON_THOUSAND_EDGE: 'weapon_thousand_edge',
  WEAPON_HOLY_WAND: 'weapon_holy_wand',
  WEAPON_SOUL_EATER: 'weapon_soul_eater',
  WEAPON_DEATH_SPIRAL: 'weapon_death_spiral',
  WEAPON_BLOODY_TEAR: 'weapon_bloody_tear',
  WEAPON_LA_BORRA: 'weapon_la_borra',
  WEAPON_THUNDER_LOOP: 'weapon_thunder_loop',
  WEAPON_UNHOLY_VESPERS: 'weapon_unholy_vespers',
  WEAPON_HELLFIRE: 'weapon_hellfire',

  // 패시브
  PASSIVE_BRACER: 'passive_bracer',
  PASSIVE_HOLLOW_HEART: 'passive_hollow_heart',
  PASSIVE_PUMMAROLA: 'passive_pummarola',
  PASSIVE_EMPTY_TOME: 'passive_empty_tome',
  PASSIVE_CANDELABRADOR: 'passive_candelabrador',
  PASSIVE_ATTRACTORB: 'passive_attractorb',
  PASSIVE_DUPLICATOR: 'passive_duplicator',
  PASSIVE_SPELLBINDER: 'passive_spellbinder',
  PASSIVE_SPINACH: 'passive_spinach',
  PASSIVE_CROWN: 'passive_crown',

  // 아이템
  ITEM_EXP_TINY: 'item_exp_tiny',
  ITEM_EXP_SMALL: 'item_exp_small',
  ITEM_EXP_MEDIUM: 'item_exp_medium',
  ITEM_EXP_LARGE: 'item_exp_large',
  ITEM_EXP_HUGE: 'item_exp_huge',
  ITEM_HEALTH: 'item_health',
  ITEM_COIN: 'item_coin',
  ITEM_CHEST: 'item_chest',

  // 타일
  TILE_GRASS: 'tile_grass',
  TILE_STONE: 'tile_stone',
  TILE_WATER: 'tile_water',

  // 투사체
  PROJECTILE_DEFAULT: 'projectile_default',
  PROJECTILE_MAGIC: 'projectile_magic',
  PROJECTILE_FIRE: 'projectile_fire',
  PROJECTILE_DAGGER: 'projectile_dagger',
  PROJECTILE_ARROW: 'projectile_arrow',
  PROJECTILE_AXE: 'projectile_axe',
} as const;

// SD 스프라이트 데이터 매핑 (16x16 원본)
const SD_SPRITES: Record<string, PixelData> = {
  [SPRITE_KEYS.PLAYER_KNIGHT]: PLAYER_KNIGHT,
  [SPRITE_KEYS.PLAYER_MAGE]: PLAYER_MAGE,
  [SPRITE_KEYS.PLAYER_ROGUE]: PLAYER_ROGUE,
  [SPRITE_KEYS.ENEMY_BAT]: ENEMY_BAT,
  [SPRITE_KEYS.ENEMY_SKELETON]: ENEMY_SKELETON,
  [SPRITE_KEYS.ENEMY_GHOST]: ENEMY_GHOST,
  [SPRITE_KEYS.ENEMY_SLIME]: ENEMY_SLIME,
  [SPRITE_KEYS.ENEMY_MINIBOSS]: ENEMY_MINIBOSS,
  [SPRITE_KEYS.ENEMY_BOSS]: ENEMY_BOSS,
  [SPRITE_KEYS.WEAPON_DAGGER]: WEAPON_DAGGER,
  [SPRITE_KEYS.WEAPON_MAGIC_WAND]: WEAPON_MAGIC_WAND,
  [SPRITE_KEYS.WEAPON_BOW]: WEAPON_BOW,
  [SPRITE_KEYS.WEAPON_AXE]: WEAPON_AXE,
  [SPRITE_KEYS.WEAPON_WHIP]: WEAPON_WHIP,
  [SPRITE_KEYS.WEAPON_HOLY_WATER]: WEAPON_HOLY_WATER,
  [SPRITE_KEYS.WEAPON_GARLIC]: WEAPON_GARLIC,
  [SPRITE_KEYS.WEAPON_LIGHTNING_RING]: WEAPON_LIGHTNING_RING,
  [SPRITE_KEYS.WEAPON_BIBLE]: WEAPON_BIBLE,
  [SPRITE_KEYS.WEAPON_FIREBALL]: WEAPON_FIREBALL,
  [SPRITE_KEYS.WEAPON_THOUSAND_EDGE]: WEAPON_THOUSAND_EDGE,
  [SPRITE_KEYS.WEAPON_HOLY_WAND]: WEAPON_HOLY_WAND,
  [SPRITE_KEYS.WEAPON_SOUL_EATER]: WEAPON_SOUL_EATER,
  [SPRITE_KEYS.WEAPON_DEATH_SPIRAL]: WEAPON_DEATH_SPIRAL,
  [SPRITE_KEYS.WEAPON_BLOODY_TEAR]: WEAPON_BLOODY_TEAR,
  [SPRITE_KEYS.WEAPON_LA_BORRA]: WEAPON_LA_BORRA,
  [SPRITE_KEYS.WEAPON_THUNDER_LOOP]: WEAPON_THUNDER_LOOP,
  [SPRITE_KEYS.WEAPON_UNHOLY_VESPERS]: WEAPON_UNHOLY_VESPERS,
  [SPRITE_KEYS.WEAPON_HELLFIRE]: WEAPON_HELLFIRE,
  [SPRITE_KEYS.PASSIVE_BRACER]: PASSIVE_BRACER,
  [SPRITE_KEYS.PASSIVE_HOLLOW_HEART]: PASSIVE_HOLLOW_HEART,
  [SPRITE_KEYS.PASSIVE_PUMMAROLA]: PASSIVE_PUMMAROLA,
  [SPRITE_KEYS.PASSIVE_EMPTY_TOME]: PASSIVE_EMPTY_TOME,
  [SPRITE_KEYS.PASSIVE_CANDELABRADOR]: PASSIVE_CANDELABRADOR,
  [SPRITE_KEYS.PASSIVE_ATTRACTORB]: PASSIVE_ATTRACTORB,
  [SPRITE_KEYS.PASSIVE_DUPLICATOR]: PASSIVE_DUPLICATOR,
  [SPRITE_KEYS.PASSIVE_SPELLBINDER]: PASSIVE_SPELLBINDER,
  [SPRITE_KEYS.PASSIVE_SPINACH]: PASSIVE_SPINACH,
  [SPRITE_KEYS.PASSIVE_CROWN]: PASSIVE_CROWN,
  [SPRITE_KEYS.ITEM_EXP_TINY]: ITEM_EXP_TINY,
  [SPRITE_KEYS.ITEM_EXP_SMALL]: ITEM_EXP_SMALL,
  [SPRITE_KEYS.ITEM_EXP_MEDIUM]: ITEM_EXP_MEDIUM,
  [SPRITE_KEYS.ITEM_EXP_LARGE]: ITEM_EXP_LARGE,
  [SPRITE_KEYS.ITEM_EXP_HUGE]: ITEM_EXP_HUGE,
  [SPRITE_KEYS.ITEM_HEALTH]: ITEM_HEALTH,
  [SPRITE_KEYS.ITEM_COIN]: ITEM_COIN,
  [SPRITE_KEYS.ITEM_CHEST]: ITEM_CHEST,
  [SPRITE_KEYS.TILE_GRASS]: TILE_GRASS,
  [SPRITE_KEYS.TILE_STONE]: TILE_STONE,
  [SPRITE_KEYS.TILE_WATER]: TILE_WATER,
  [SPRITE_KEYS.PROJECTILE_DEFAULT]: PROJECTILE_DEFAULT,
  [SPRITE_KEYS.PROJECTILE_MAGIC]: PROJECTILE_MAGIC,
  [SPRITE_KEYS.PROJECTILE_FIRE]: PROJECTILE_FIRE,
  [SPRITE_KEYS.PROJECTILE_DAGGER]: PROJECTILE_DAGGER,
  [SPRITE_KEYS.PROJECTILE_ARROW]: PROJECTILE_ARROW,
  [SPRITE_KEYS.PROJECTILE_AXE]: PROJECTILE_AXE,
};

// 모든 스프라이트 데이터 매핑 (HD 모드에 따라 자동 선택)
export const ALL_SPRITES: Record<string, PixelData> = USE_HD_SPRITES
  ? { ...SD_SPRITES, ...HD_SPRITES } // HD 스프라이트로 오버라이드
  : SD_SPRITES;

// HD 스프라이트 키 재export
export { HD_SPRITES, HD_SPRITE_KEYS };
