import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.load.setBaseURL('/games/codex-claude-doc');
    this.load.svg('player', 'assets/images/characters/player-knight.svg');
    this.load.svg('player-mage', 'assets/images/characters/player-mage.svg');
    this.load.svg('enemy', 'assets/images/enemies/enemy-slime.svg');
    this.load.svg('enemy-slime', 'assets/images/enemies/enemy-slime.svg');
    this.load.svg('enemy-bat', 'assets/images/enemies/enemy-bat.svg');
    this.load.svg('enemy-skull', 'assets/images/enemies/enemy-skull.svg');
    this.load.svg('projectile', 'assets/images/skills/projectile-dagger.svg');
    this.load.svg('projectile-orb', 'assets/images/skills/projectile-orb.svg');
    this.load.svg('projectile-wave', 'assets/images/skills/projectile-wave.svg');
    this.load.svg('exp-gem', 'assets/images/items/exp-gem.svg');
  }

  create(): void {
    this.createTextures();
    this.scene.start('TitleScene');
  }

  private createTextures(): void {
    const tileSize = 64;
    const base = this.add.graphics();

    base.fillStyle(0x1b2130, 1);
    base.fillRect(0, 0, tileSize, tileSize);
    base.lineStyle(1, 0x2f3a4f, 0.7);
    base.strokeRect(0, 0, tileSize, tileSize);
    base.generateTexture('bg-tile', tileSize, tileSize);

    if (!this.textures.exists('player')) {
      base.clear();
      base.fillStyle(0x6dd6ff, 1);
      base.fillRoundedRect(0, 0, 26, 26, 6);
      base.generateTexture('player', 26, 26);
    }

    if (!this.textures.exists('enemy')) {
      base.clear();
      base.fillStyle(0xff6b6b, 1);
      base.fillCircle(12, 12, 12);
      base.lineStyle(2, 0xffb3b3, 0.9);
      base.strokeCircle(12, 12, 12);
      base.generateTexture('enemy', 24, 24);
    }

    if (!this.textures.exists('projectile')) {
      base.clear();
      base.fillStyle(0xfff173, 1);
      base.fillCircle(5, 5, 5);
      base.lineStyle(1, 0xfff8b3, 0.9);
      base.strokeCircle(5, 5, 5);
      base.generateTexture('projectile', 10, 10);
    }

    if (!this.textures.exists('exp-gem')) {
      base.clear();
      base.fillStyle(0x7cffb2, 1);
      base.fillRoundedRect(0, 0, 14, 14, 3);
      base.lineStyle(1, 0xbaffd7, 0.9);
      base.strokeRoundedRect(0, 0, 14, 14, 3);
      base.generateTexture('exp-gem', 14, 14);
    }

    base.destroy();
  }
}
