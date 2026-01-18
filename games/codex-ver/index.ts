import Phaser from 'phaser';
import { gameConfig } from './game/config';

export interface GameInstance {
  game: Phaser.Game;
  destroy: () => void;
}

let game: Phaser.Game | null = null;

export function createGame(containerId: string): GameInstance {
  if (game) {
    game.destroy(true);
  }

  const config: Phaser.Types.Core.GameConfig = {
    ...gameConfig,
    parent: containerId
  };

  game = new Phaser.Game(config);

  return {
    game,
    destroy: () => {
      if (game) {
        game.destroy(true);
        game = null;
      }
    }
  };
}

export default createGame;
