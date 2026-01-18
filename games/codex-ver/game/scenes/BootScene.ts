import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.load.setBaseURL('/games/codex-ver');
    this.load.audio("sfx_shoot", "sfx/shoot.wav");
    this.load.audio("sfx_hit", "sfx/hit.wav");
    this.load.audio("sfx_hurt", "sfx/hurt.wav");
    this.load.audio("sfx_level", "sfx/level.wav");
    this.load.audio("sfx_enemy_shoot", "sfx/enemy_shoot.wav");
  }

  create() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x5fd35f, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture("player", 32, 32);

    graphics.clear();
    graphics.fillStyle(0xd35f5f, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture("enemy", 20, 20);

    graphics.clear();
    graphics.fillStyle(0xf8d14d, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture("projectile", 8, 8);

    graphics.clear();
    graphics.fillStyle(0xff7f66, 1);
    graphics.fillCircle(3, 3, 3);
    graphics.generateTexture("enemy_projectile", 6, 6);

    graphics.clear();
    graphics.fillStyle(0x4db8f8, 1);
    graphics.fillCircle(6, 6, 6);
    graphics.generateTexture("xp", 12, 12);

    graphics.destroy();
    this.scene.start("Menu");
  }
}
