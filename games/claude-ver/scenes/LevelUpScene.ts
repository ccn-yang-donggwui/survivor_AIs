import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/Constants';
import { GameScene } from './GameScene';
import { BaseWeapon } from '../weapons/BaseWeapon';
import { BasePassive } from '../passives/BasePassive';
import { WeaponFactory } from '../weapons/WeaponFactory';
import { PassiveFactory } from '../passives/PassiveFactory';

interface UpgradeOption {
  type: 'weapon' | 'passive';
  id: string;
  name: string;
  icon: string;
  description: string;
  isNew: boolean;
  currentLevel?: number;
}

export class LevelUpScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private options: UpgradeOption[] = [];
  private optionContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'LevelUpScene' });
  }

  create(): void {
    this.gameScene = this.scene.get('GameScene') as GameScene;

    // 배경 오버레이
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.7
    );
    overlay.setInteractive();

    // 타이틀
    this.add.text(GAME_WIDTH / 2, 80, 'LEVEL UP!', {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 130, '업그레이드를 선택하세요', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 옵션 생성
    this.options = this.generateOptions();
    this.createOptionCards();

    // 키보드 입력
    this.input.keyboard?.on('keydown-ONE', () => this.selectOption(0));
    this.input.keyboard?.on('keydown-TWO', () => this.selectOption(1));
    this.input.keyboard?.on('keydown-THREE', () => this.selectOption(2));
  }

  private generateOptions(): UpgradeOption[] {
    const player = this.gameScene.player;
    const currentWeapons = player.weapons;
    const currentPassives = player.passives;

    // 가능한 업그레이드 목록 생성
    const possibleUpgrades: UpgradeOption[] = [];

    // 1. 보유 무기 레벨업 옵션
    for (const weapon of currentWeapons) {
      if (weapon.level < weapon.maxLevel) {
        possibleUpgrades.push({
          type: 'weapon',
          id: weapon.id,
          name: weapon.name,
          icon: weapon.icon,
          description: this.getWeaponUpgradeDescription(weapon),
          isNew: false,
          currentLevel: weapon.level
        });
      }
    }

    // 2. 새 무기 획득 옵션 (슬롯이 남아있을 때)
    if (currentWeapons.length < 6) {
      const allWeaponIds = WeaponFactory.getAllWeaponIds();
      const ownedWeaponIds = currentWeapons.map(w => w.id);

      for (const weaponId of allWeaponIds) {
        if (!ownedWeaponIds.includes(weaponId)) {
          const weaponInfo = WeaponFactory.getWeaponInfo(weaponId);
          possibleUpgrades.push({
            type: 'weapon',
            id: weaponId,
            name: weaponInfo.name,
            icon: weaponInfo.icon,
            description: weaponInfo.description,
            isNew: true
          });
        }
      }
    }

    // 3. 보유 패시브 레벨업 옵션
    for (const passive of currentPassives) {
      if (passive.level < passive.maxLevel) {
        possibleUpgrades.push({
          type: 'passive',
          id: passive.id,
          name: passive.name,
          icon: passive.icon,
          description: this.getPassiveUpgradeDescription(passive),
          isNew: false,
          currentLevel: passive.level
        });
      }
    }

    // 4. 새 패시브 획득 옵션 (슬롯이 남아있을 때)
    if (currentPassives.length < 6) {
      const allPassiveIds = PassiveFactory.getAllPassiveIds();
      const ownedPassiveIds = currentPassives.map(p => p.id);

      for (const passiveId of allPassiveIds) {
        if (!ownedPassiveIds.includes(passiveId)) {
          const passiveInfo = PassiveFactory.getPassiveInfo(passiveId);
          possibleUpgrades.push({
            type: 'passive',
            id: passiveId,
            name: passiveInfo.name,
            icon: passiveInfo.icon,
            description: passiveInfo.description,
            isNew: true
          });
        }
      }
    }

    // 랜덤으로 3개 선택
    const shuffled = Phaser.Utils.Array.Shuffle([...possibleUpgrades]);
    return shuffled.slice(0, 3);
  }

  private getWeaponUpgradeDescription(weapon: BaseWeapon): string {
    const nextLevel = weapon.level + 1;
    if (nextLevel % 2 === 0) {
      return `데미지 +20%`;
    } else if (nextLevel === 3 || nextLevel === 6) {
      return `투사체 +1`;
    } else if (nextLevel === 5) {
      return `쿨다운 -10%`;
    } else if (nextLevel === 7) {
      return `데미지 +30%`;
    } else if (nextLevel === 8) {
      return `최종 강화!`;
    }
    return `레벨 ${nextLevel}로 강화`;
  }

  private getPassiveUpgradeDescription(passive: BasePassive): string {
    return passive.getUpgradeDescription();
  }

  private createOptionCards(): void {
    const cardWidth = 280;
    const cardHeight = 350;
    const gap = 40;
    const startX = GAME_WIDTH / 2 - (cardWidth + gap);
    const y = GAME_HEIGHT / 2 + 20;

    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const x = startX + i * (cardWidth + gap);

      const container = this.add.container(x, y);
      this.optionContainers.push(container);

      // 카드 배경
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e, 1);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
      bg.lineStyle(3, option.isNew ? COLORS.EXP : 0x4444aa);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
      container.add(bg);

      // NEW 또는 레벨 표시
      if (option.isNew) {
        const newBadge = this.add.text(0, -cardHeight / 2 + 30, 'NEW!', {
          fontSize: '18px',
          color: '#00ff88',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(newBadge);
      } else {
        const levelText = this.add.text(0, -cardHeight / 2 + 30, `Lv.${option.currentLevel} → Lv.${option.currentLevel! + 1}`, {
          fontSize: '16px',
          color: '#aaaaaa'
        }).setOrigin(0.5);
        container.add(levelText);
      }

      // 아이콘
      const icon = this.add.text(0, -60, option.icon, {
        fontSize: '64px'
      }).setOrigin(0.5);
      container.add(icon);

      // 이름
      const name = this.add.text(0, 20, option.name, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(name);

      // 타입 표시
      const typeText = this.add.text(0, 50, option.type === 'weapon' ? '무기' : '패시브', {
        fontSize: '14px',
        color: option.type === 'weapon' ? '#ff6666' : '#6666ff'
      }).setOrigin(0.5);
      container.add(typeText);

      // 설명
      const desc = this.add.text(0, 90, option.description, {
        fontSize: '16px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: cardWidth - 40 }
      }).setOrigin(0.5);
      container.add(desc);

      // 단축키 표시
      const keyText = this.add.text(0, cardHeight / 2 - 30, `[${i + 1}]`, {
        fontSize: '24px',
        color: '#ffff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(keyText);

      // 클릭 이벤트
      const hitArea = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerover', () => this.highlightOption(i));
      hitArea.on('pointerout', () => this.unhighlightOption(i));
      hitArea.on('pointerdown', () => this.selectOption(i));
      container.add(hitArea);
    }
  }

  private highlightOption(index: number): void {
    const container = this.optionContainers[index];
    this.tweens.add({
      targets: container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100
    });
  }

  private unhighlightOption(index: number): void {
    const container = this.optionContainers[index];
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 100
    });
  }

  private selectOption(index: number): void {
    if (index >= this.options.length) return;

    const option = this.options[index];
    const player = this.gameScene.player;

    if (option.type === 'weapon') {
      if (option.isNew) {
        // 새 무기 획득
        const weapon = WeaponFactory.create(option.id, this.gameScene);
        player.addWeapon(weapon);
      } else {
        // 무기 레벨업
        player.levelUpWeapon(option.id);
      }
    } else {
      if (option.isNew) {
        // 새 패시브 획득
        const passive = PassiveFactory.create(option.id);
        player.addPassive(passive);
      } else {
        // 패시브 레벨업
        player.levelUpPassive(option.id);
      }
    }

    // 씬 종료 및 게임 재개
    this.scene.stop();
    this.gameScene.resumeGame();
  }
}
