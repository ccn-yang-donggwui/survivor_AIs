// 레벨업 씬 - 무기/패시브 선택

import Phaser from 'phaser';
import { COLORS, WEAPONS, PASSIVES } from '../config/Constants';
import { TouchButton } from '../ui/TouchButton';
import { Player } from '../entities/Player';
import { getSoundManager } from '../utils/SoundManager';
import weaponsData from '../data/weapons.json';
import passivesData from '../data/passives.json';

interface UpgradeOption {
  type: 'weapon' | 'passive' | 'bonus';
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  isNew: boolean;
  bonusType?: 'heal' | 'gold' | 'damage_buff';
}

export class LevelUpScene extends Phaser.Scene {
  private player!: Player;
  private buttons: TouchButton[] = [];
  private overlay!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'LevelUpScene' });
  }

  init(data: { player: Player }): void {
    this.player = data.player;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 반투명 오버레이
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x000000, 0.85);
    this.overlay.fillRect(0, 0, width, height);

    // 타이틀
    const title = this.add.text(width / 2, 60, 'LEVEL UP!', {
      fontSize: '36px',
      color: '#ffcd75',
      fontFamily: 'monospace',
    });
    title.setOrigin(0.5);

    // 레벨 표시
    const levelText = this.add.text(width / 2, 100, `Level ${this.player.level}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    levelText.setOrigin(0.5);

    // 업그레이드 옵션 생성
    const options = this.generateOptions();

    // 옵션 카드 생성
    this.createOptionCards(options, width, height);

    // 입력 비활성화 방지
    this.input.keyboard?.disableGlobalCapture();
  }

  private generateOptions(): UpgradeOption[] {
    const options: UpgradeOption[] = [];
    const playerWeapons = this.player.getWeapons();
    const playerPassives = this.player.getPassives();

    // 기존 무기 업그레이드 후보
    playerWeapons.forEach(w => {
      if (w.level < WEAPONS.MAX_LEVEL) {
        const data = (weaponsData as any).weapons.find((d: any) => d.id === w.id);
        if (data) {
          options.push({
            type: 'weapon',
            id: w.id,
            name: data.name,
            description: this.getWeaponLevelDescription(data, w.level + 1),
            icon: data.icon,
            level: w.level + 1,
            isNew: false,
          });
        }
      }
    });

    // 기존 패시브 업그레이드 후보
    playerPassives.forEach(p => {
      if (p.level < PASSIVES.MAX_LEVEL) {
        const data = (passivesData as any).passives.find((d: any) => d.id === p.id);
        if (data) {
          options.push({
            type: 'passive',
            id: p.id,
            name: data.name,
            description: this.getPassiveLevelDescription(data, p.level + 1),
            icon: data.icon,
            level: p.level + 1,
            isNew: false,
          });
        }
      }
    });

    // 새 무기 후보 (슬롯에 여유가 있을 때, 진화 무기 제외)
    if (playerWeapons.length < WEAPONS.MAX_SLOTS) {
      const availableWeapons = (weaponsData as any).weapons.filter(
        (w: any) => !playerWeapons.find(pw => pw.id === w.id) && !w.isEvolved
      );
      availableWeapons.forEach((w: any) => {
        options.push({
          type: 'weapon',
          id: w.id,
          name: w.name,
          description: w.description,
          icon: w.icon,
          level: 1,
          isNew: true,
        });
      });
    }

    // 새 패시브 후보 (슬롯에 여유가 있을 때)
    if (playerPassives.length < PASSIVES.MAX_SLOTS) {
      const availablePassives = (passivesData as any).passives.filter(
        (p: any) => !playerPassives.find(pp => pp.id === p.id)
      );
      availablePassives.forEach((p: any) => {
        options.push({
          type: 'passive',
          id: p.id,
          name: p.name,
          description: p.description,
          icon: p.icon,
          level: 1,
          isNew: true,
        });
      });
    }

    // 랜덤으로 3개 선택
    const selectedOptions = Phaser.Utils.Array.Shuffle(options).slice(0, 3);

    // 옵션이 없거나 부족한 경우 보너스 옵션 추가
    if (selectedOptions.length < 3) {
      const bonusOptions = this.generateBonusOptions();
      const neededCount = 3 - selectedOptions.length;
      selectedOptions.push(...bonusOptions.slice(0, neededCount));
    }

    return selectedOptions;
  }

  private generateBonusOptions(): UpgradeOption[] {
    return [
      {
        type: 'bonus',
        id: 'heal_bonus',
        name: '응급 치료',
        description: '최대 체력의 30%를 즉시 회복합니다.',
        icon: 'item_heal',
        level: 0,
        isNew: false,
        bonusType: 'heal',
      },
      {
        type: 'bonus',
        id: 'gold_bonus',
        name: '황금 축복',
        description: '골드 50을 즉시 획득합니다.',
        icon: 'item_coin',
        level: 0,
        isNew: false,
        bonusType: 'gold',
      },
      {
        type: 'bonus',
        id: 'damage_buff',
        name: '전투의 분노',
        description: '15초간 공격력이 50% 증가합니다.',
        icon: 'passive_spinach',
        level: 0,
        isNew: false,
        bonusType: 'damage_buff',
      },
    ];
  }

  private getWeaponLevelDescription(data: any, level: number): string {
    // levelUp은 배열이므로 해당 레벨 정보 찾기
    const bonus = data.levelUp?.find((l: any) => l.level === level);
    if (!bonus) return 'Power Up!';

    // JSON에 description이 있으면 그것 사용
    if (bonus.description) return bonus.description;

    const parts: string[] = [];
    if (bonus.damagePercent) parts.push(`Damage +${bonus.damagePercent}%`);
    if (bonus.damage) parts.push(`Damage +${bonus.damage}`);
    if (bonus.projectiles) parts.push(`Projectiles +${bonus.projectiles}`);
    if (bonus.cooldownPercent) parts.push(`Cooldown -${bonus.cooldownPercent}%`);
    if (bonus.piercing) parts.push(`Piercing +${bonus.piercing}`);
    if (bonus.area) parts.push(`Area +${bonus.area}%`);

    return parts.join(', ') || 'Power Up!';
  }

  private getPassiveLevelDescription(data: any, level: number): string {
    const stat = data.stat;
    const value = data.baseValue + (data.perLevelValue * (level - 1));
    const isMultiplier = data.isMultiplier;

    const statNames: Record<string, string> = {
      damage: '공격력',
      maxHP: '최대 체력',
      hpRegen: '체력 회복',
      area: '공격 범위',
      duration: '지속 시간',
      pickupRange: '수집 범위',
      projectileCount: '투사체 수',
      cooldownReduction: '쿨타임 감소',
      expMultiplier: '경험치',
      moveSpeed: '이동 속도',
      luck: '행운',
    };

    const name = statNames[stat] || stat;

    if (isMultiplier) {
      return `${name} +${Math.round(value * 100)}%`;
    }
    return `${name} +${value}`;
  }

  private createOptionCards(options: UpgradeOption[], width: number, height: number): void {
    const cardWidth = 180;
    const cardHeight = 260;
    const spacing = 20;
    const totalWidth = options.length * cardWidth + (options.length - 1) * spacing;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;

    options.forEach((option, index) => {
      const x = startX + index * (cardWidth + spacing);
      const y = height / 2;

      this.createOptionCard(option, x, y, cardWidth, cardHeight);
    });
  }

  private createOptionCard(
    option: UpgradeOption,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // 카드 배경
    const card = this.add.graphics();
    let bgColor: number;
    if (option.type === 'weapon') {
      bgColor = 0x29366f;
    } else if (option.type === 'passive') {
      bgColor = 0x38b764;
    } else {
      bgColor = 0xb13e53; // 보너스: 빨간색 계열
    }
    const borderColor = option.isNew ? 0xffcd75 : COLORS.UI_PRIMARY;

    card.fillStyle(bgColor, 0.9);
    card.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);

    card.lineStyle(3, borderColor, 1);
    card.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);

    // NEW 배지
    if (option.isNew) {
      const badge = this.add.text(x + width / 2 - 15, y - height / 2 + 10, 'NEW', {
        fontSize: '12px',
        color: '#ffcd75',
        fontFamily: 'monospace',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 },
      });
      badge.setOrigin(1, 0);
    }

    // 타입 라벨
    let typeColor: string;
    let typeText: string;
    if (option.type === 'weapon') {
      typeColor = '#41a6f6';
      typeText = 'WEAPON';
    } else if (option.type === 'passive') {
      typeColor = '#38b764';
      typeText = 'PASSIVE';
    } else {
      typeColor = '#ffcd75';
      typeText = 'BONUS';
    }
    const typeLabel = this.add.text(x, y - height / 2 + 18, typeText, {
      fontSize: '12px',
      color: typeColor,
      fontFamily: 'monospace',
    });
    typeLabel.setOrigin(0.5);

    // 아이콘
    if (option.icon && this.textures.exists(option.icon)) {
      const icon = this.add.sprite(x, y - 55, option.icon);
      icon.setDisplaySize(48, 48);
    }

    // 이름
    const nameText = this.add.text(x, y - 5, option.name, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    nameText.setOrigin(0.5);

    // 레벨 (보너스 타입은 '즉시 효과' 표시)
    const levelDisplay = option.type === 'bonus' ? '즉시 효과' : `Lv.${option.level}`;
    const levelText = this.add.text(x, y + 18, levelDisplay, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });
    levelText.setOrigin(0.5);

    // 설명
    const descText = this.add.text(x, y + 50, option.description, {
      fontSize: '11px',
      color: '#cccccc',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: width - 20 },
    });
    descText.setOrigin(0.5, 0); // 상단 기준으로 배치

    // 선택 버튼
    const button = new TouchButton(this, {
      x,
      y: y + height / 2 - 30,
      width: width - 30,
      height: 35,
      label: 'SELECT',
      fontSize: 14,
      backgroundColor: COLORS.UI_BACKGROUND,
      borderColor,
    });

    button.onRelease(() => {
      this.selectOption(option);
    });

    this.buttons.push(button);
  }

  private selectOption(option: UpgradeOption): void {
    getSoundManager()?.playSfx('sfx_button');

    // addWeapon/addPassive는 이미 있는 경우 자동으로 레벨업 처리
    if (option.type === 'weapon') {
      this.player.addWeapon(option.id);
    } else if (option.type === 'passive') {
      this.player.addPassive(option.id);
    } else if (option.type === 'bonus') {
      this.applyBonusOption(option);
    }

    this.closeScene();
  }

  private applyBonusOption(option: UpgradeOption): void {
    const gameScene = this.scene.get('GameScene') as any;

    switch (option.bonusType) {
      case 'heal': {
        // 최대 체력의 30% 회복
        const healAmount = this.player.stats.maxHP * 0.3;
        this.player.heal(healAmount);
        break;
      }
      case 'gold': {
        // 골드 50 획득
        if (gameScene?.addGold) {
          gameScene.addGold(50);
        }
        break;
      }
      case 'damage_buff': {
        // 15초간 공격력 50% 증가
        this.player.applyTemporaryBuff('damage', 0.5, 15000);
        break;
      }
    }
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
