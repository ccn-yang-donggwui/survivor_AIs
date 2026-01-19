import Phaser from "phaser";
import charactersData from "../../data/balance/characters.json";
import stagesData from "../../data/balance/stages.json";
import {
  loadMeta,
  purchaseUpgrade,
  saveMeta,
  UPGRADE_CONFIG,
  getUpgradeCost,
  type MetaState,
  type UpgradeId
} from "../meta/MetaStore";

const UI_PANEL_COLOR = 0x0b1512;

type CharacterData = {
  id: string;
  name: string;
  description: string;
  stats: Record<string, number>;
  startingWeaponId: string;
};

type StageData = {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  themeColor: string;
  wavesKey: string;
  duration: number;
  enemyMax: number;
  moveSpeedMultiplier: number;
  slowZones: { x: number; y: number; radius: number; slowMultiplier: number }[];
};

type MenuEntry = {
  id: string;
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
};

type UpgradeEntry = {
  id: UpgradeId;
  text: Phaser.GameObjects.Text;
};

const CHARACTERS = (charactersData as { items: CharacterData[] }).items;
const STAGES = (stagesData as { items: StageData[] }).items;

export class MenuScene extends Phaser.Scene {
  private selectedCharacterId = CHARACTERS[0]?.id ?? "cobra";
  private selectedStageId = STAGES[0]?.id ?? "lab";
  private meta: MetaState = loadMeta();

  private currencyText!: Phaser.GameObjects.Text;
  private characterDescText!: Phaser.GameObjects.Text;
  private stageDescText!: Phaser.GameObjects.Text;
  private characterEntries: MenuEntry[] = [];
  private stageEntries: MenuEntry[] = [];
  private upgradeEntries: UpgradeEntry[] = [];
  private startButton!: Phaser.GameObjects.Rectangle;
  private startText!: Phaser.GameObjects.Text;
  private startHint!: Phaser.GameObjects.Text;

  constructor() {
    super("Menu");
  }

  create() {
    this.cameras.main.setBackgroundColor("#0b1512");

    const { width, height } = this.scale;

    this.add
      .text(width / 2, 48, "VAMSERYU", {
        fontFamily: "monospace",
        fontSize: "36px",
        color: "#5fd35f"
      })
      .setOrigin(0.5);

    this.currencyText = this.add
      .text(width - 32, 28, "", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#d8f7d8"
      })
      .setOrigin(1, 0.5);

    const characterPanel = this.add.rectangle(80, 110, 360, 280, UI_PANEL_COLOR, 0.7).setOrigin(0, 0);
    characterPanel.setStrokeStyle(1, 0x5fd35f);

    this.add
      .text(96, 122, "Character", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#cfe6d6"
      })
      .setOrigin(0, 0);

    this.characterDescText = this.add
      .text(96, 320, "", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#a8c7b4",
        wordWrap: { width: 320 }
      })
      .setOrigin(0, 0);

    this.characterEntries = CHARACTERS.map((character, index) => {
      const y = 150 + index * 52;
      const bg = this.add.rectangle(96, y, 320, 40, 0x14231f, 0.7).setOrigin(0, 0);
      const text = this.add
        .text(110, y + 10, character.name, {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#f0f7e8"
        })
        .setOrigin(0, 0);

      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerdown", () => this.setSelectedCharacter(character.id));

      return { id: character.id, bg, text };
    });

    const stagePanel = this.add.rectangle(width - 440, 110, 360, 280, UI_PANEL_COLOR, 0.7).setOrigin(0, 0);
    stagePanel.setStrokeStyle(1, 0x5fd35f);

    this.add
      .text(width - 424, 122, "Stage", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#cfe6d6"
      })
      .setOrigin(0, 0);

    this.stageDescText = this.add
      .text(width - 424, 320, "", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#a8c7b4",
        wordWrap: { width: 320 }
      })
      .setOrigin(0, 0);

    this.stageEntries = STAGES.map((stage, index) => {
      const y = 150 + index * 52;
      const bg = this.add.rectangle(width - 424, y, 320, 40, 0x14231f, 0.7).setOrigin(0, 0);
      const text = this.add
        .text(width - 410, y + 10, stage.name, {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#f0f7e8"
        })
        .setOrigin(0, 0);

      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerdown", () => this.setSelectedStage(stage.id));

      return { id: stage.id, bg, text };
    });

    const upgradePanelY = height - 220;
    const upgradePanel = this.add.rectangle(80, upgradePanelY, width - 160, 160, UI_PANEL_COLOR, 0.7).setOrigin(0, 0);
    upgradePanel.setStrokeStyle(1, 0x5fd35f);

    this.add
      .text(96, upgradePanelY + 12, "Meta Upgrades", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#cfe6d6"
      })
      .setOrigin(0, 0);

    this.upgradeEntries = UPGRADE_CONFIG.map((upgrade, index) => {
      const y = upgradePanelY + 48 + index * 26;
      const text = this.add
        .text(110, y, "", {
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#f0f7e8"
        })
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

      text.on("pointerdown", () => this.tryPurchaseUpgrade(upgrade.id));

      return { id: upgrade.id, text };
    });

    this.startButton = this.add.rectangle(width / 2, height - 44, 240, 52, 0x5fd35f, 0.95);
    this.startButton.setStrokeStyle(2, 0x143024);
    this.startButton.setInteractive({ useHandCursor: true });
    this.startButton.setDepth(1200);

    this.startText = this.add
      .text(width / 2, height - 44, "START RUN", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#0b1512"
      })
      .setOrigin(0.5)
      .setDepth(1201);

    this.startHint = this.add
      .text(width / 2, height - 84, "Press Enter to start", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#cfe6d6"
      })
      .setOrigin(0.5)
      .setDepth(1201);

    this.startButton.on("pointerdown", () => this.startRun());

    this.input.keyboard?.on("keydown-ENTER", () => this.startRun());

    this.scale.on("resize", this.handleResize, this);

    this.setSelectedCharacter(this.selectedCharacterId);
    this.setSelectedStage(this.selectedStageId);
    this.refreshMetaUI();
  }

  private setSelectedCharacter(id: string) {
    this.selectedCharacterId = id;
    this.characterEntries.forEach((entry) => {
      const isActive = entry.id === id;
      entry.bg.setFillStyle(isActive ? 0x1f3b2e : 0x14231f, isActive ? 0.9 : 0.7);
      entry.bg.setStrokeStyle(isActive ? 2 : 0, 0x5fd35f);
    });

    const selected = CHARACTERS.find((character) => character.id === id);
    this.characterDescText.setText(selected ? selected.description : "");
  }

  private setSelectedStage(id: string) {
    this.selectedStageId = id;
    this.stageEntries.forEach((entry) => {
      const isActive = entry.id === id;
      entry.bg.setFillStyle(isActive ? 0x1f3b2e : 0x14231f, isActive ? 0.9 : 0.7);
      entry.bg.setStrokeStyle(isActive ? 2 : 0, 0x5fd35f);
    });

    const selected = STAGES.find((stage) => stage.id === id);
    this.stageDescText.setText(selected ? selected.description : "");
  }

  private refreshMetaUI() {
    this.currencyText.setText(`Samples: ${this.meta.currency}`);

    this.upgradeEntries.forEach((entry) => {
      const config = UPGRADE_CONFIG.find((item) => item.id === entry.id);
      if (!config) {
        return;
      }
      const level = this.meta.upgrades[config.id] ?? 0;
      const cost = getUpgradeCost(config, level);
      const isMax = level >= config.maxLevel;
      const label = `${config.label} Lv.${level}/${config.maxLevel} - ${config.description}`;
      const suffix = isMax ? "MAX" : `Cost ${cost}`;

      entry.text.setText(`${label} [${suffix}]`);
      entry.text.setColor(isMax || this.meta.currency < cost ? "#6b7f74" : "#f0f7e8");
    });
  }

  private tryPurchaseUpgrade(id: UpgradeId) {
    const updated = purchaseUpgrade(this.meta, id);
    if (updated === this.meta) {
      return;
    }

    this.meta = updated;
    saveMeta(this.meta);
    this.refreshMetaUI();
  }

  private startRun() {
    this.registry.set("selectedCharacterId", this.selectedCharacterId);
    this.registry.set("selectedStageId", this.selectedStageId);
    this.scene.start("Play");
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.currencyText.setPosition(width - 32, 28);
    this.startButton.setPosition(width / 2, height - 44);
    this.startText.setPosition(width / 2, height - 44);
    this.startHint.setPosition(width / 2, height - 84);
  }
}
