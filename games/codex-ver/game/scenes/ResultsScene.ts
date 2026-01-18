import Phaser from "phaser";
import { loadMeta, saveMeta } from "../meta/MetaStore";

export type RunResult = {
  result: "victory" | "defeat";
  timeMs: number;
  level: number;
  kills: number;
  stageId: string;
  characterId: string;
};

const UI_PANEL_COLOR = 0x0b1512;

export class ResultsScene extends Phaser.Scene {
  private result: RunResult | null = null;

  constructor() {
    super("Results");
  }

  init(data: RunResult) {
    this.result = data;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor("#0b1512");

    const panel = this.add.rectangle(width / 2, height / 2, width * 0.6, 320, UI_PANEL_COLOR, 0.9);
    panel.setStrokeStyle(2, 0x5fd35f);

    if (!this.result) {
      this.add
        .text(width / 2, height / 2, "No results", {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#f0f7e8"
        })
        .setOrigin(0.5);
      return;
    }

    const timeSeconds = Math.floor(this.result.timeMs / 1000);
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;

    const baseReward = Math.floor(this.result.kills * 2 + timeSeconds / 6);
    const victoryBonus = this.result.result === "victory" ? 100 : 0;
    const earned = baseReward + victoryBonus;

    const meta = loadMeta();
    meta.currency += earned;
    saveMeta(meta);

    const title = this.result.result === "victory" ? "ESCAPED" : "DEFEATED";
    const titleColor = this.result.result === "victory" ? "#5fd35f" : "#ff7777";

    this.add
      .text(width / 2, height / 2 - 120, title, {
        fontFamily: "monospace",
        fontSize: "28px",
        color: titleColor
      })
      .setOrigin(0.5);

    const lines = [
      `Time ${minutes}:${seconds.toString().padStart(2, "0")}`,
      `Level ${this.result.level}`,
      `Kills ${this.result.kills}`,
      `Samples Earned ${earned}`,
      `Total Samples ${meta.currency}`
    ];

    this.add
      .text(width / 2, height / 2 - 48, lines, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#f0f7e8",
        align: "center"
      })
      .setOrigin(0.5);

    const retryButton = this.add.rectangle(width / 2, height / 2 + 90, 220, 44, 0x1f3b2e, 0.9);
    retryButton.setStrokeStyle(2, 0x5fd35f);
    retryButton.setInteractive({ useHandCursor: true });

    const retryText = this.add
      .text(width / 2, height / 2 + 90, "RETRY", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#f0f7e8"
      })
      .setOrigin(0.5);

    retryButton.on("pointerdown", () => this.scene.start("Play"));

    const menuButton = this.add.rectangle(width / 2, height / 2 + 145, 220, 40, 0x13251e, 0.9);
    menuButton.setStrokeStyle(2, 0x5fd35f);
    menuButton.setInteractive({ useHandCursor: true });

    const menuText = this.add
      .text(width / 2, height / 2 + 145, "MAIN MENU", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#f0f7e8"
      })
      .setOrigin(0.5);

    menuButton.on("pointerdown", () => this.scene.start("Menu"));

    this.input.keyboard?.on("keydown-ENTER", () => this.scene.start("Play"));
    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("Menu"));
  }
}
