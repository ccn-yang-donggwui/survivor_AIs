// 레벨업 씬 - 무기/패시브 선택

import Phaser from 'phaser';
import { COLORS, WEAPONS, PASSIVES } from '../config/Constants';
import { TouchButton } from '../ui/TouchButton';
import { Player } from '../entities/Player';
import { getSoundManager } from '../utils/SoundManager';
import weaponsData from '../data/weapons.json';
import passivesData from '../data/passives.json';

interface UpgradeOption {
  type: 'weapon' | 'passive' | 'bonus' | 'evolution';
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  isNew: boolean;
  bonusType?: 'heal' | 'gold' | 'damage_buff';
  // 진화 관련 필드
  evolutionRecipeId?: string;
  evolvedWeaponId?: string;
  baseWeaponId?: string;
  requiredPassiveId?: string;
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

    // 진화에 사용된 무기/패시브 ID 가져오기 (더 이상 레벨업 선택지에 나오지 않음)
    const gameScene = this.scene.get('GameScene') as any;
    const usedWeaponIds: string[] = gameScene?.evolutionSystem?.getUsedWeaponIds() || [];
    const usedPassiveIds: string[] = gameScene?.evolutionSystem?.getUsedPassiveIds() || [];

    // 기존 무기 업그레이드 후보 (진화 재료로 사용된 무기 제외)
    playerWeapons.forEach(w => {
      // 진화 재료로 이미 사용된 무기는 업그레이드 선택지에서 제외
      if (usedWeaponIds.includes(w.id)) return;

      const data = (weaponsData as any).weapons.find((d: any) => d.id === w.id);
      if (!data) return;

      // 무기별 maxLevel 사용 (진화 무기는 maxLevel=1이므로 레벨업 불가)
      const weaponMaxLevel = data.maxLevel || WEAPONS.MAX_LEVEL;
      if (w.level < weaponMaxLevel) {
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
    });

    // 기존 패시브 업그레이드 후보 (패시브는 진화에 사용되어도 계속 레벨업 가능)
    playerPassives.forEach(p => {
      const data = (passivesData as any).passives.find((d: any) => d.id === p.id);
      if (!data) return;

      // 패시브별 maxLevel 사용
      const passiveMaxLevel = data.maxLevel || PASSIVES.MAX_LEVEL;
      if (p.level < passiveMaxLevel) {
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
    });

    // 새 무기 후보 (슬롯에 여유가 있을 때, 진화 무기 및 진화 재료로 사용된 무기 제외)
    if (playerWeapons.length < WEAPONS.MAX_SLOTS) {
      const availableWeapons = (weaponsData as any).weapons.filter(
        (w: any) => !playerWeapons.find(pw => pw.id === w.id) &&
                    !w.isEvolved &&
                    !usedWeaponIds.includes(w.id)
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

    // 새 패시브 후보 (슬롯에 여유가 있을 때, 패시브는 진화와 무관하게 획득 가능)
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

    // 진화 가능한 옵션도 일반 옵션에 추가 (다른 스킬과 함께 섞임)
    const evolutionOptions = this.generateEvolutionOptions(gameScene);
    options.push(...evolutionOptions);

    // 모든 옵션에서 랜덤으로 3개 선택
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

  private generateEvolutionOptions(gameScene: any): UpgradeOption[] {
    const options: UpgradeOption[] = [];

    if (!gameScene?.evolutionSystem) return options;

    const playerWeapons = this.player.getWeapons();
    const playerPassives = this.player.getPassives();

    // 진화 가능한 레시피 가져오기
    const availableEvolutions = gameScene.evolutionSystem.getAvailableEvolutions(
      playerWeapons,
      playerPassives
    );

    availableEvolutions.forEach((recipe: any) => {
      // 진화 무기 데이터 가져오기
      const evolvedWeaponData = (weaponsData as any).weapons.find(
        (w: any) => w.id === recipe.evolvedWeaponId
      );

      options.push({
        type: 'evolution',
        id: recipe.id,
        name: recipe.name,
        description: evolvedWeaponData?.description || recipe.description,
        icon: evolvedWeaponData?.icon || 'weapon_dagger', // 진화 무기 아이콘 또는 기본값
        level: 1,
        isNew: false,
        evolutionRecipeId: recipe.id,
        evolvedWeaponId: recipe.evolvedWeaponId,
        baseWeaponId: recipe.weaponId,
        requiredPassiveId: recipe.passiveId,
      });
    });

    return options;
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
    let borderColor: number;

    if (option.type === 'evolution' || option.type === 'weapon') {
      bgColor = 0x29366f; // 무기/진화: 파란색
      borderColor = (option.isNew || option.type === 'evolution') ? 0xffcd75 : COLORS.UI_PRIMARY;
    } else if (option.type === 'passive') {
      bgColor = 0x38b764;
      borderColor = option.isNew ? 0xffcd75 : COLORS.UI_PRIMARY;
    } else {
      bgColor = 0xb13e53; // 보너스: 빨간색 계열
      borderColor = option.isNew ? 0xffcd75 : COLORS.UI_PRIMARY;
    }

    card.fillStyle(bgColor, 0.9);
    card.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);

    card.lineStyle(3, borderColor, 1);
    card.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);

    // NEW 또는 진화 배지
    if (option.type === 'evolution') {
      const badge = this.add.text(x + width / 2 - 15, y - height / 2 + 10, '진화', {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#e040fb',
        padding: { x: 4, y: 2 },
      });
      badge.setOrigin(1, 0);
    } else if (option.isNew) {
      const badge = this.add.text(x + width / 2 - 15, y - height / 2 + 10, 'NEW', {
        fontSize: '12px',
        color: '#ffcd75',
        fontFamily: 'monospace',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 },
      });
      badge.setOrigin(1, 0);
    }

    // 타입 라벨 (진화도 WEAPON으로 표시)
    let typeColor: string;
    let typeText: string;
    if (option.type === 'evolution' || option.type === 'weapon') {
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

    // 레벨 (보너스 타입은 특별 표시, 진화는 Lv.1로 표시)
    let levelDisplay: string;
    if (option.type === 'bonus') {
      levelDisplay = '즉시 효과';
    } else if (option.type === 'evolution') {
      levelDisplay = 'Lv.1';
    } else {
      levelDisplay = `Lv.${option.level}`;
    }
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
    } else if (option.type === 'evolution') {
      this.applyEvolution(option);
    }

    this.closeScene();
  }

  private applyEvolution(option: UpgradeOption): void {
    const gameScene = this.scene.get('GameScene') as any;

    if (!gameScene?.evolutionSystem || !option.evolutionRecipeId) return;

    // 진화 실행
    const result = gameScene.evolutionSystem.evolve(option.evolutionRecipeId, this.player);

    if (result.success && result.evolvedWeaponId) {
      // 기존 무기 제거
      if (result.removedWeaponId) {
        this.player.removeWeapon(result.removedWeaponId);
      }

      // 진화 무기 추가
      this.player.addWeapon(result.evolvedWeaponId);

      // 진화 완료 효과음/이벤트 (GameScene에서 처리)
      gameScene.events?.emit('evolutionComplete', {
        evolvedWeaponId: result.evolvedWeaponId,
        evolvedWeaponName: result.evolvedWeaponName,
      });
    }
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
