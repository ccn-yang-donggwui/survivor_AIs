import Phaser from 'phaser';
import { GAME, COLORS } from './Constants';

// 씬 imports는 나중에 추가
// import { BootScene } from '../scenes/BootScene';
// ...

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  backgroundColor: COLORS.BACKGROUND,
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [], // 씬은 동적으로 추가
  input: {
    activePointers: 2, // 모바일 멀티터치 지원
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};

export function createGameConfig(containerId: string): Phaser.Types.Core.GameConfig {
  return {
    ...GameConfig,
    parent: containerId,
  };
}
