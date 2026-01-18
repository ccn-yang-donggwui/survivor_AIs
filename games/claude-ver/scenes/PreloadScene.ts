import Phaser from 'phaser';
import { COLORS } from '../config/Constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // preload에서는 아무것도 하지 않음
  }

  create(): void {
    console.log('PreloadScene: create() called');

    // 텍스처 생성
    this.createPlaceholderAssets();
    console.log('PreloadScene: textures created');

    // 바로 게임 씬으로 전환
    this.scene.start('GameScene');
    console.log('PreloadScene: started GameScene');
  }

  private createPlaceholderAssets(): void {
    // 플레이어 텍스처 생성
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00);
    playerGraphics.fillCircle(16, 16, 14);
    playerGraphics.fillStyle(0x004400);
    playerGraphics.fillCircle(12, 12, 3);
    playerGraphics.fillCircle(20, 12, 3);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 적 텍스처 생성 (슬라임)
    const slimeGraphics = this.add.graphics();
    slimeGraphics.fillStyle(0xff0000);
    slimeGraphics.fillCircle(16, 18, 12);
    slimeGraphics.fillStyle(0x880000);
    slimeGraphics.fillCircle(12, 16, 3);
    slimeGraphics.fillCircle(20, 16, 3);
    slimeGraphics.generateTexture('enemy_slime', 32, 32);
    slimeGraphics.destroy();

    // 적 텍스처 생성 (좀비)
    const zombieGraphics = this.add.graphics();
    zombieGraphics.fillStyle(0x666666);
    zombieGraphics.fillRect(8, 4, 16, 24);
    zombieGraphics.fillStyle(0x444444);
    zombieGraphics.fillCircle(12, 10, 3);
    zombieGraphics.fillCircle(20, 10, 3);
    zombieGraphics.generateTexture('enemy_zombie', 32, 32);
    zombieGraphics.destroy();

    // 적 텍스처 생성 (박쥐)
    const batGraphics = this.add.graphics();
    batGraphics.fillStyle(0x8800aa);
    batGraphics.fillTriangle(16, 8, 4, 24, 28, 24);
    batGraphics.fillStyle(0xffff00);
    batGraphics.fillCircle(12, 16, 2);
    batGraphics.fillCircle(20, 16, 2);
    batGraphics.generateTexture('enemy_bat', 32, 32);
    batGraphics.destroy();

    // 적 텍스처 생성 (스켈레톤)
    const skeletonGraphics = this.add.graphics();
    skeletonGraphics.fillStyle(0xeeeeee);
    skeletonGraphics.fillCircle(16, 8, 6);
    skeletonGraphics.fillRect(14, 14, 4, 14);
    skeletonGraphics.fillRect(8, 16, 16, 3);
    skeletonGraphics.fillStyle(0x000000);
    skeletonGraphics.fillCircle(14, 7, 2);
    skeletonGraphics.fillCircle(18, 7, 2);
    skeletonGraphics.generateTexture('enemy_skeleton', 32, 32);
    skeletonGraphics.destroy();

    // 투사체 텍스처 생성 (단검)
    const daggerGraphics = this.add.graphics();
    daggerGraphics.fillStyle(0xcccccc);
    daggerGraphics.fillTriangle(8, 0, 4, 16, 12, 16);
    daggerGraphics.fillStyle(0x8b4513);
    daggerGraphics.fillRect(6, 12, 4, 6);
    daggerGraphics.generateTexture('projectile_dagger', 16, 18);
    daggerGraphics.destroy();

    // 투사체 텍스처 생성 (마법탄)
    const magicGraphics = this.add.graphics();
    magicGraphics.fillStyle(0x00ffff);
    magicGraphics.fillCircle(8, 8, 6);
    magicGraphics.fillStyle(0xffffff);
    magicGraphics.fillCircle(6, 6, 2);
    magicGraphics.generateTexture('projectile_magic', 16, 16);
    magicGraphics.destroy();

    // 경험치 젬 텍스처 생성
    const expGraphics = this.add.graphics();
    expGraphics.fillStyle(COLORS.EXP);
    expGraphics.fillRect(2, 4, 12, 8);
    expGraphics.fillTriangle(8, 0, 2, 4, 14, 4);
    expGraphics.fillTriangle(8, 16, 2, 12, 14, 12);
    expGraphics.generateTexture('exp_gem', 16, 16);
    expGraphics.destroy();

    // 회복 아이템 텍스처
    const healGraphics = this.add.graphics();
    healGraphics.fillStyle(COLORS.HEALTH);
    healGraphics.fillRect(6, 2, 4, 12);
    healGraphics.fillRect(2, 6, 12, 4);
    healGraphics.generateTexture('heal_item', 16, 16);
    healGraphics.destroy();

    // 배경 타일 텍스처
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1a1a2e);
    bgGraphics.fillRect(0, 0, 64, 64);
    bgGraphics.lineStyle(1, 0x2a2a4e);
    bgGraphics.strokeRect(0, 0, 64, 64);
    bgGraphics.generateTexture('bg_tile', 64, 64);
    bgGraphics.destroy();

    // 투사체 텍스처 생성 (화살)
    const arrowGraphics = this.add.graphics();
    arrowGraphics.fillStyle(0x8b4513);
    arrowGraphics.fillRect(6, 4, 4, 14);
    arrowGraphics.fillStyle(0xcccccc);
    arrowGraphics.fillTriangle(8, 0, 4, 6, 12, 6);
    arrowGraphics.generateTexture('projectile_arrow', 16, 18);
    arrowGraphics.destroy();

    // 투사체 텍스처 생성 (도끼)
    const axeGraphics = this.add.graphics();
    axeGraphics.fillStyle(0x8b4513);
    axeGraphics.fillRect(6, 8, 4, 12);
    axeGraphics.fillStyle(0xaaaaaa);
    axeGraphics.fillRect(2, 2, 12, 8);
    axeGraphics.generateTexture('projectile_axe', 16, 20);
    axeGraphics.destroy();

    // 보스 텍스처
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x440044);
    bossGraphics.fillCircle(64, 64, 50);
    bossGraphics.fillStyle(0xff0000);
    bossGraphics.fillCircle(45, 50, 10);
    bossGraphics.fillCircle(83, 50, 10);
    bossGraphics.fillStyle(0x000000);
    bossGraphics.fillCircle(45, 50, 5);
    bossGraphics.fillCircle(83, 50, 5);
    bossGraphics.lineStyle(4, 0x220022);
    bossGraphics.strokeCircle(64, 64, 50);
    bossGraphics.generateTexture('boss', 128, 128);
    bossGraphics.destroy();

    // 회복 고기 텍스처
    const meatGraphics = this.add.graphics();
    meatGraphics.fillStyle(0x8b4513);
    meatGraphics.fillRect(6, 6, 4, 10);
    meatGraphics.fillStyle(0xcd853f);
    meatGraphics.fillCircle(8, 4, 6);
    meatGraphics.generateTexture('meat', 16, 16);
    meatGraphics.destroy();

    // 보물 상자 텍스처
    const chestGraphics = this.add.graphics();
    chestGraphics.fillStyle(0x8b4513);
    chestGraphics.fillRect(2, 6, 12, 8);
    chestGraphics.fillStyle(0xffd700);
    chestGraphics.fillRect(6, 8, 4, 4);
    chestGraphics.fillStyle(0x654321);
    chestGraphics.fillRect(2, 4, 12, 3);
    chestGraphics.generateTexture('chest', 16, 16);
    chestGraphics.destroy();
  }
}
