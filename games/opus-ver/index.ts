import Phaser from 'phaser';
import { createGameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { MenuScene } from './scenes/MenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { LevelUpScene } from './scenes/LevelUpScene';
import { EvolutionScene } from './scenes/EvolutionScene';
import { ResultsScene } from './scenes/ResultsScene';

export interface GameInstance {
  game: Phaser.Game;
  destroy: () => void;
}

export function createGame(containerId: string): GameInstance {
  const config = createGameConfig(containerId);

  // 씬 등록
  config.scene = [
    BootScene,
    PreloadScene,
    TitleScene,
    MenuScene,
    SettingsScene,
    UpgradeScene,
    GameScene,
    UIScene,
    LevelUpScene,
    EvolutionScene,
    ResultsScene,
  ];

  const game = new Phaser.Game(config);

  return {
    game,
    destroy: () => {
      game.destroy(true);
    },
  };
}

export default createGame;
