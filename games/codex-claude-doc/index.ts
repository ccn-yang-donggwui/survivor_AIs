import Phaser from 'phaser';
import { gameConfig } from './config/GameConfig';
import { SoundManager } from './utils/SoundManager';

export interface GameInstance {
  game: Phaser.Game;
  destroy: () => void;
}

export function createGame(containerId: string): GameInstance {
  const config: Phaser.Types.Core.GameConfig = {
    ...gameConfig,
    parent: containerId
  };

  const game = new Phaser.Game(config);

  return {
    game,
    destroy: () => {
      SoundManager.cleanup();
      game.destroy(true);
    }
  };
}

export default createGame;
