// 진화 씬 - 무기 진화 선택

import Phaser from 'phaser';
import { COLORS } from '../config/Constants';
import { TouchButton } from '../ui/TouchButton';
import { Player } from '../entities/Player';
import type { EvolutionRecipe } from '../systems/EvolutionSystem';
import { EvolutionSystem } from '../systems/EvolutionSystem';
import { getSoundManager } from '../utils/SoundManager';

export class EvolutionScene extends Phaser.Scene {
  private player!: Player;
  private evolutionSystem!: EvolutionSystem;
  private evolutions!: EvolutionRecipe[];
  private buttons: TouchButton[] = [];
  private overlay!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'EvolutionScene' });
  }

  init(data: {
    player: Player;
    evolutionSystem: EvolutionSystem;
    evolutions: EvolutionRecipe[];
  }): void {
    this.player = data.player;
    this.evolutionSystem = data.evolutionSystem;
    this.evolutions = data.evolutions;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 반투명 오버레이
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x000000, 0.9);
    this.overlay.fillRect(0, 0, width, height);

    // 타이틀 효과
    this.createTitleEffect(width);

    // 진화 옵션 표시
    this.createEvolutionCards(width, height);

    // 스킵 버튼 (일반 레벨업으로)
    const skipButton = new TouchButton(this, {
      x: width / 2,
      y: height - 60,
      width: 180,
      height: 40,
      label: 'Skip to Level Up',
      fontSize: 14,
      backgroundColor: COLORS.UI_BACKGROUND,
      borderColor: 0x666666,
    });

    skipButton.onRelease(() => {
      this.skipToLevelUp();
    });

    this.buttons.push(skipButton);
  }

  private createTitleEffect(width: number): void {
    // 진화 타이틀
    const title = this.add.text(width / 2, 50, 'EVOLUTION!', {
      fontSize: '42px',
      color: '#ffcd75',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setShadow(3, 3, '#000000', 5);

    // 글로우 효과
    this.tweens.add({
      targets: title,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 서브타이틀
    const subtitle = this.add.text(width / 2, 95, 'Combine weapons to create ultimate power!', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });
    subtitle.setOrigin(0.5);
  }

  private createEvolutionCards(width: number, height: number): void {
    const cardWidth = 280;
    const cardHeight = 180;
    const spacing = 30;
    const totalWidth = this.evolutions.length * cardWidth + (this.evolutions.length - 1) * spacing;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    const y = height / 2 - 20;

    this.evolutions.forEach((evolution, index) => {
      const x = startX + index * (cardWidth + spacing);
      this.createEvolutionCard(evolution, x, y, cardWidth, cardHeight);
    });
  }

  private createEvolutionCard(
    evolution: EvolutionRecipe,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // 카드 배경 (황금색 테두리)
    const card = this.add.graphics();

    // 그라데이션 효과 (단색으로 대체)
    card.fillStyle(0x29366f, 0.95);
    card.fillRoundedRect(x - width / 2, y - height / 2, width, height, 12);

    // 황금 테두리
    card.lineStyle(4, 0xffcd75, 1);
    card.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 12);

    // 내부 글로우
    card.lineStyle(2, 0xef7d57, 0.5);
    card.strokeRoundedRect(x - width / 2 + 6, y - height / 2 + 6, width - 12, height - 12, 8);

    // 조합 표시: 무기 + 패시브 = 진화 무기
    const combineY = y - 40;

    // 무기 아이콘
    const weaponKey = `weapon_${evolution.weaponId}`;
    if (this.textures.exists(weaponKey)) {
      const weaponIcon = this.add.sprite(x - 70, combineY, weaponKey);
      weaponIcon.setDisplaySize(36, 36);
    }

    // + 기호
    this.add.text(x - 35, combineY, '+', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 패시브 아이콘
    const passiveKey = `passive_${evolution.passiveId}`;
    if (this.textures.exists(passiveKey)) {
      const passiveIcon = this.add.sprite(x, combineY, passiveKey);
      passiveIcon.setDisplaySize(36, 36);
    }

    // = 기호
    this.add.text(x + 35, combineY, '=', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // 진화 무기 아이콘 (반짝임 효과)
    const evolvedKey = `weapon_${evolution.evolvedWeaponId}`;
    if (this.textures.exists(evolvedKey)) {
      const evolvedIcon = this.add.sprite(x + 70, combineY, evolvedKey);
      evolvedIcon.setDisplaySize(42, 42);

      // 반짝임 애니메이션
      this.tweens.add({
        targets: evolvedIcon,
        alpha: { from: 0.7, to: 1 },
        scale: { from: 1.1, to: 1.2 },
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    }

    // 진화 무기 이름
    const nameText = this.add.text(x, y + 20, evolution.name, {
      fontSize: '20px',
      color: '#ffcd75',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    nameText.setOrigin(0.5);

    // 설명
    const descText = this.add.text(x, y + 45, evolution.description, {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: width - 30 },
    });
    descText.setOrigin(0.5);

    // 선택 버튼
    const button = new TouchButton(this, {
      x,
      y: y + height / 2 - 25,
      width: width - 40,
      height: 35,
      label: 'EVOLVE',
      fontSize: 16,
      backgroundColor: 0x38b764,
      borderColor: 0xffcd75,
    });

    button.onRelease(() => {
      this.selectEvolution(evolution);
    });

    this.buttons.push(button);
  }

  private selectEvolution(evolution: EvolutionRecipe): void {
    getSoundManager()?.playSfx('sfx_evolution');

    // 진화 실행
    const result = this.evolutionSystem.evolve(evolution.id, this.player);

    if (result.success) {
      // 기존 무기 제거 및 진화 무기 추가
      this.player.removeWeapon(result.removedWeaponId!);
      this.player.addWeapon(result.evolvedWeaponId!);

      // 진화 효과 표시
      this.showEvolutionEffect(evolution.name);
    }
  }

  private showEvolutionEffect(name: string): void {
    const { width, height } = this.cameras.main;

    // 화면 플래시
    this.cameras.main.flash(500, 255, 205, 117);

    // 큰 텍스트 표시
    const effectText = this.add.text(width / 2, height / 2, name, {
      fontSize: '48px',
      color: '#ffcd75',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    effectText.setOrigin(0.5);
    effectText.setAlpha(0);
    effectText.setScale(0.5);

    this.tweens.add({
      targets: effectText,
      alpha: 1,
      scale: 1.5,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: effectText,
          alpha: 0,
          scale: 2,
          duration: 500,
          delay: 500,
          onComplete: () => {
            effectText.destroy();
            this.closeScene();
          },
        });
      },
    });
  }

  private skipToLevelUp(): void {
    getSoundManager()?.playSfx('sfx_button');

    // 버튼 정리
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];

    // 레벨업 씬으로 전환
    this.scene.start('LevelUpScene', { player: this.player });
  }

  private closeScene(): void {
    // 버튼 정리
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];

    // GameScene 재개
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  shutdown(): void {
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];
  }
}
