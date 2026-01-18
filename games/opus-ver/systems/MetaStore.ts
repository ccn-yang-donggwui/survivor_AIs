// 메타 진행 시스템 - localStorage 기반 영구 업그레이드

import { META } from '../config/Constants';
import metaUpgradesJson from '../data/meta-upgrades.json';

export interface MetaUpgrade {
  id: string;
  name: string;
  description: string;
  stat: string;
  valuePerLevel: number;
  maxLevel: number;
  basePrice: number;
  priceIncrement: number;
}

export interface MetaState {
  gold: number;
  upgrades: Record<string, number>;
  totalGamesPlayed: number;
  totalPlayTime: number;
  totalKills: number;
  bestSurvivalTime: number;
  unlockedCharacters: string[];
  unlockedWeapons: string[];
}

const STORAGE_KEY = 'opus-ver-meta';

const DEFAULT_STATE: MetaState = {
  gold: 0,
  upgrades: {},
  totalGamesPlayed: 0,
  totalPlayTime: 0,
  totalKills: 0,
  bestSurvivalTime: 0,
  unlockedCharacters: ['knight'],
  unlockedWeapons: ['dagger'],
};

export class MetaStore {
  private state: MetaState;
  private upgradeData: MetaUpgrade[] = [];

  constructor() {
    this.state = this.loadState();
  }

  // 데이터 로드
  async loadUpgradeData(): Promise<void> {
    try {
      // JSON 필드명을 코드에서 사용하는 필드명으로 매핑
      this.upgradeData = metaUpgradesJson.upgrades.map((u: Record<string, unknown>) => ({
        id: u.id as string,
        name: u.name as string,
        description: u.description as string,
        stat: u.stat as string,
        valuePerLevel: (u.perLevelValue ?? u.valuePerLevel) as number,
        maxLevel: u.maxLevel as number,
        basePrice: (u.baseCost ?? u.basePrice) as number,
        priceIncrement: (u.costPerLevel ?? u.priceIncrement) as number,
      }));
    } catch (error) {
      console.error('Failed to load meta upgrades:', error);
      // 기본값 사용
      this.upgradeData = this.getDefaultUpgrades();
    }
  }

  private getDefaultUpgrades(): MetaUpgrade[] {
    return [
      {
        id: 'might',
        name: '강인함',
        description: 'HP +10',
        stat: 'maxHP',
        valuePerLevel: 10,
        maxLevel: 10,
        basePrice: 50,
        priceIncrement: 30,
      },
      {
        id: 'swiftness',
        name: '민첩성',
        description: '이동속도 +3%',
        stat: 'moveSpeed',
        valuePerLevel: 0.03,
        maxLevel: 8,
        basePrice: 40,
        priceIncrement: 25,
      },
      {
        id: 'magnetism',
        name: '수집력',
        description: '픽업 범위 +10',
        stat: 'pickupRange',
        valuePerLevel: 10,
        maxLevel: 8,
        basePrice: 35,
        priceIncrement: 20,
      },
      {
        id: 'power',
        name: '파괴력',
        description: '데미지 +5%',
        stat: 'damage',
        valuePerLevel: 0.05,
        maxLevel: 10,
        basePrice: 60,
        priceIncrement: 40,
      },
      {
        id: 'haste',
        name: '신속함',
        description: '쿨다운 -3%',
        stat: 'cooldown',
        valuePerLevel: -0.03,
        maxLevel: 8,
        basePrice: 55,
        priceIncrement: 35,
      },
      {
        id: 'recovery',
        name: '재생력',
        description: '초당 HP 회복 +0.1',
        stat: 'hpRegen',
        valuePerLevel: 0.1,
        maxLevel: 6,
        basePrice: 70,
        priceIncrement: 45,
      },
      {
        id: 'luck',
        name: '행운',
        description: '희귀 아이템 확률 +5%',
        stat: 'luck',
        valuePerLevel: 0.05,
        maxLevel: 5,
        basePrice: 80,
        priceIncrement: 50,
      },
      {
        id: 'revive',
        name: '부활',
        description: '부활 횟수 +1',
        stat: 'revives',
        valuePerLevel: 1,
        maxLevel: 2,
        basePrice: 500,
        priceIncrement: 1000,
      },
    ];
  }

  // localStorage에서 상태 로드
  private loadState(): MetaState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load meta state:', error);
    }
    return { ...DEFAULT_STATE };
  }

  // localStorage에 상태 저장
  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save meta state:', error);
    }
  }

  // 골드
  getGold(): number {
    return this.state.gold;
  }

  addGold(amount: number): void {
    this.state.gold += amount;
    this.saveState();
  }

  spendGold(amount: number): boolean {
    if (this.state.gold >= amount) {
      this.state.gold -= amount;
      this.saveState();
      return true;
    }
    return false;
  }

  // 업그레이드
  getUpgradeLevel(upgradeId: string): number {
    return this.state.upgrades[upgradeId] || 0;
  }

  getUpgradePrice(upgradeId: string): number {
    const upgrade = this.upgradeData.find(u => u.id === upgradeId);
    if (!upgrade) return 0;

    const currentLevel = this.getUpgradeLevel(upgradeId);
    return upgrade.basePrice + upgrade.priceIncrement * currentLevel;
  }

  canPurchaseUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgradeData.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    const currentLevel = this.getUpgradeLevel(upgradeId);
    if (currentLevel >= upgrade.maxLevel) return false;

    return this.state.gold >= this.getUpgradePrice(upgradeId);
  }

  purchaseUpgrade(upgradeId: string): boolean {
    if (!this.canPurchaseUpgrade(upgradeId)) return false;

    const price = this.getUpgradePrice(upgradeId);
    if (this.spendGold(price)) {
      this.state.upgrades[upgradeId] = (this.state.upgrades[upgradeId] || 0) + 1;
      this.saveState();
      return true;
    }
    return false;
  }

  getAllUpgrades(): MetaUpgrade[] {
    return this.upgradeData;
  }

  // 메타 스탯 보너스 계산
  getStatBonus(stat: string): number {
    let bonus = 0;

    for (const upgrade of this.upgradeData) {
      if (upgrade.stat === stat) {
        const level = this.getUpgradeLevel(upgrade.id);
        bonus += upgrade.valuePerLevel * level;
      }
    }

    return bonus;
  }

  // 전체 메타 보너스
  getAllStatBonuses(): Record<string, number> {
    const bonuses: Record<string, number> = {};

    for (const upgrade of this.upgradeData) {
      const level = this.getUpgradeLevel(upgrade.id);
      if (level > 0) {
        bonuses[upgrade.stat] = (bonuses[upgrade.stat] || 0) + upgrade.valuePerLevel * level;
      }
    }

    return bonuses;
  }

  // 통계
  recordGameEnd(survivalTime: number, kills: number, goldEarned: number): void {
    this.state.totalGamesPlayed++;
    this.state.totalPlayTime += survivalTime;
    this.state.totalKills += kills;
    this.state.gold += goldEarned;

    if (survivalTime > this.state.bestSurvivalTime) {
      this.state.bestSurvivalTime = survivalTime;
    }

    this.saveState();
  }

  getStats(): {
    totalGamesPlayed: number;
    totalPlayTime: number;
    totalKills: number;
    bestSurvivalTime: number;
  } {
    return {
      totalGamesPlayed: this.state.totalGamesPlayed,
      totalPlayTime: this.state.totalPlayTime,
      totalKills: this.state.totalKills,
      bestSurvivalTime: this.state.bestSurvivalTime,
    };
  }

  // 잠금 해제
  unlockCharacter(characterId: string): void {
    if (!this.state.unlockedCharacters.includes(characterId)) {
      this.state.unlockedCharacters.push(characterId);
      this.saveState();
    }
  }

  unlockWeapon(weaponId: string): void {
    if (!this.state.unlockedWeapons.includes(weaponId)) {
      this.state.unlockedWeapons.push(weaponId);
      this.saveState();
    }
  }

  isCharacterUnlocked(characterId: string): boolean {
    return this.state.unlockedCharacters.includes(characterId);
  }

  isWeaponUnlocked(weaponId: string): boolean {
    return this.state.unlockedWeapons.includes(weaponId);
  }

  getUnlockedCharacters(): string[] {
    return [...this.state.unlockedCharacters];
  }

  getUnlockedWeapons(): string[] {
    return [...this.state.unlockedWeapons];
  }

  // 리셋
  resetProgress(): void {
    this.state = { ...DEFAULT_STATE };
    this.saveState();
  }
}

// 싱글톤 인스턴스
export const metaStore = new MetaStore();
