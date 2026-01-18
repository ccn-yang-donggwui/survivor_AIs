import Phaser from "phaser";
import { gameConfig } from "./config";

let game: Phaser.Game | null = null;

export function startGame(container: HTMLElement | null) {
  if (game) {
    return;
  }

  const config: Phaser.Types.Core.GameConfig = {
    ...gameConfig,
    parent: container ?? undefined
  };

  game = new Phaser.Game(config);
}
