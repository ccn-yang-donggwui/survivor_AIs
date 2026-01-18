import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';

export interface GameInstance {
  game: Phaser.Game;
  destroy: () => void;
}

export function createGame(containerId: string): GameInstance {
  const config: Phaser.Types.Core.GameConfig = {
    ...GameConfig,
    parent: containerId
  };

  const game = new Phaser.Game(config);

  return {
    game,
    destroy: () => game.destroy(true)
  };
}

export default createGame;
