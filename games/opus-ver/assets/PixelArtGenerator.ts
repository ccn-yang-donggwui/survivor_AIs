import Phaser from 'phaser';
import { PALETTE_ARRAY } from './ColorPalette';
import type { PixelData } from './SpriteData';
import { ALL_SPRITES, SPRITE_KEYS, USE_HD_SPRITES } from './SpriteData';

/**
 * 런타임에 픽셀 아트 텍스처를 생성하는 유틸리티 클래스
 */
export class PixelArtGenerator {
  /**
   * 픽셀 데이터를 Phaser 텍스처로 변환
   */
  static generateTexture(
    scene: Phaser.Scene,
    key: string,
    pixelData: PixelData,
    scale: number = 1
  ): void {
    const height = pixelData.length;
    const width = pixelData[0]?.length || 0;

    if (width === 0 || height === 0) {
      console.warn(`Invalid pixel data for key: ${key}`);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.warn(`Could not get canvas context for key: ${key}`);
      return;
    }

    // 픽셀 아트 스타일 유지
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const colorIndex = pixelData[y][x];

        // -1은 투명
        if (colorIndex >= 0 && colorIndex < PALETTE_ARRAY.length) {
          ctx.fillStyle = PALETTE_ARRAY[colorIndex];
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    // 기존 텍스처가 있으면 제거
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    scene.textures.addCanvas(key, canvas);
  }

  /**
   * 모든 스프라이트를 한 번에 생성
   */
  static generateAllTextures(scene: Phaser.Scene, scale: number = 1): void {
    Object.entries(ALL_SPRITES).forEach(([key, pixelData]) => {
      this.generateTexture(scene, key, pixelData, scale);
    });

    console.log(`Generated ${Object.keys(ALL_SPRITES).length} textures`);
  }

  /**
   * 특정 카테고리의 텍스처만 생성
   */
  static generateCategoryTextures(
    scene: Phaser.Scene,
    category: 'player' | 'enemy' | 'weapon' | 'passive' | 'item' | 'tile' | 'projectile',
    scale: number = 1
  ): void {
    const prefix = {
      player: 'player_',
      enemy: 'enemy_',
      weapon: 'weapon_',
      passive: 'passive_',
      item: 'item_',
      tile: 'tile_',
      projectile: 'projectile_',
    }[category];

    Object.entries(ALL_SPRITES)
      .filter(([key]) => key.startsWith(prefix))
      .forEach(([key, pixelData]) => {
        this.generateTexture(scene, key, pixelData, scale);
      });
  }

  /**
   * 애니메이션용 스프라이트시트 생성 (단순 깜빡임 효과)
   * 플레이어나 적에게 간단한 애니메이션 적용
   */
  static generateAnimatedTexture(
    scene: Phaser.Scene,
    key: string,
    pixelData: PixelData,
    frames: number = 2,
    scale: number = 1
  ): void {
    const height = pixelData.length;
    const width = pixelData[0]?.length || 0;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale * frames;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // 여러 프레임 생성 (약간의 밝기 변화)
    for (let frame = 0; frame < frames; frame++) {
      const offsetX = frame * width * scale;
      const brightnessOffset = frame * 0.1; // 프레임별 밝기 조절

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const colorIndex = pixelData[y][x];

          if (colorIndex >= 0 && colorIndex < PALETTE_ARRAY.length) {
            const baseColor = PALETTE_ARRAY[colorIndex];
            // 간단한 밝기 조절
            const color = this.adjustBrightness(baseColor, brightnessOffset);
            ctx.fillStyle = color;
            ctx.fillRect(offsetX + x * scale, y * scale, scale, scale);
          }
        }
      }
    }

    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    scene.textures.addSpriteSheet(key, canvas as unknown as HTMLImageElement, {
      frameWidth: width * scale,
      frameHeight: height * scale,
    });
  }

  /**
   * 색상 밝기 조절 헬퍼
   */
  private static adjustBrightness(hexColor: string, amount: number): string {
    const hex = hexColor.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.substr(0, 2), 16) + amount * 255));
    const g = Math.min(255, Math.max(0, parseInt(hex.substr(2, 2), 16) + amount * 255));
    const b = Math.min(255, Math.max(0, parseInt(hex.substr(4, 2), 16) + amount * 255));

    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }

  /**
   * UI용 프로그래매틱 텍스처 생성
   */
  static generateUITextures(scene: Phaser.Scene): void {
    // HP바 배경
    this.generateRectTexture(scene, 'ui_hp_bg', 100, 12, '#1a1c2c');

    // HP바 채움
    this.generateRectTexture(scene, 'ui_hp_fill', 1, 10, '#b13e53');

    // HP바 프레임
    this.generateBorderTexture(scene, 'ui_hp_frame', 100, 12, '#94b0c2', 1);

    // 버튼 배경
    this.generateRectTexture(scene, 'ui_button', 120, 32, '#29366f');

    // 버튼 호버
    this.generateRectTexture(scene, 'ui_button_hover', 120, 32, '#3b5dc9');

    // 무기 슬롯
    this.generateBorderTexture(scene, 'ui_slot', 24, 24, '#94b0c2', 2);

    // 경험치바 배경
    this.generateRectTexture(scene, 'ui_exp_bg', 200, 8, '#1a1c2c');

    // 경험치바 채움
    this.generateRectTexture(scene, 'ui_exp_fill', 1, 6, '#41a6f6');

    console.log('Generated UI textures');
  }

  /**
   * 단색 사각형 텍스처 생성
   */
  static generateRectTexture(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    color: string
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    scene.textures.addCanvas(key, canvas);
  }

  /**
   * 테두리만 있는 텍스처 생성
   */
  static generateBorderTexture(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    color: string,
    borderWidth: number = 1
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(
      borderWidth / 2,
      borderWidth / 2,
      width - borderWidth,
      height - borderWidth
    );

    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    scene.textures.addCanvas(key, canvas);
  }

  /**
   * 그라데이션 원형 텍스처 (파티클용)
   */
  static generateGlowTexture(
    scene: Phaser.Scene,
    key: string,
    radius: number,
    color: string
  ): void {
    const size = radius * 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const gradient = ctx.createRadialGradient(
      radius, radius, 0,
      radius, radius, radius
    );

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    scene.textures.addCanvas(key, canvas);
  }

  /**
   * 간단한 파티클 텍스처들 생성
   */
  static generateParticleTextures(scene: Phaser.Scene): void {
    // 히트 파티클
    this.generateGlowTexture(scene, 'particle_hit', 8, '#ef7d57');

    // 경험치 파티클
    this.generateGlowTexture(scene, 'particle_exp', 6, '#41a6f6');

    // 힐 파티클
    this.generateGlowTexture(scene, 'particle_heal', 8, '#a7f070');

    // 레벨업 파티클
    this.generateGlowTexture(scene, 'particle_levelup', 12, '#ffcd75');

    // 진화 파티클
    this.generateGlowTexture(scene, 'particle_evolve', 16, '#73eff7');

    console.log('Generated particle textures');
  }
}

// 편의용 함수들
export function generateAllGameTextures(scene: Phaser.Scene, scale: number = 2): void {
  // HD 스프라이트는 이미 32x32이므로 scale을 절반으로
  // SD 스프라이트는 16x16이므로 그대로 사용
  // 결과: 둘 다 약 32x32로 렌더링됨
  const actualScale = USE_HD_SPRITES ? Math.max(1, scale / 2) : scale;

  PixelArtGenerator.generateAllTextures(scene, actualScale);
  PixelArtGenerator.generateUITextures(scene);
  PixelArtGenerator.generateParticleTextures(scene);

  console.log(`Textures generated in ${USE_HD_SPRITES ? 'HD' : 'SD'} mode with scale ${actualScale}`);
}

export { SPRITE_KEYS };
