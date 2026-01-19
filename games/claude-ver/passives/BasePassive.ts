import type { PlayerStats } from '../types/GameTypes';

export interface PassiveEffect {
  stat: keyof PlayerStats;
  value: number;
  isMultiplier?: boolean;
}

export abstract class BasePassive {
  public id: string;
  public name: string;
  public icon: string;
  public level: number = 1;
  public maxLevel: number = 5;

  protected baseEffect: PassiveEffect;
  protected effectPerLevel: number;

  constructor(config: {
    id: string;
    name: string;
    icon: string;
    baseEffect: PassiveEffect;
    effectPerLevel: number;
    maxLevel?: number;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.icon = config.icon;
    this.baseEffect = config.baseEffect;
    this.effectPerLevel = config.effectPerLevel;
    if (config.maxLevel) this.maxLevel = config.maxLevel;
  }

  public levelUp(): void {
    if (this.level < this.maxLevel) {
      this.level++;
    }
  }

  public getEffect(): PassiveEffect {
    const totalValue = this.baseEffect.value + (this.level - 1) * this.effectPerLevel;
    return {
      stat: this.baseEffect.stat,
      value: totalValue,
      isMultiplier: this.baseEffect.isMultiplier
    };
  }

  public applyToStats(stats: PlayerStats): void {
    const effect = this.getEffect();

    if (effect.isMultiplier) {
      (stats[effect.stat] as number) *= (1 + effect.value);
    } else {
      (stats[effect.stat] as number) += effect.value;
    }
  }

  public getUpgradeDescription(): string {
    const currentEffect = this.getEffect();
    const nextValue = currentEffect.value + this.effectPerLevel;

    if (currentEffect.isMultiplier) {
      const currentPercent = Math.round(currentEffect.value * 100);
      const nextPercent = Math.round(nextValue * 100);
      return `${this.getStatName(currentEffect.stat)} +${currentPercent}% → +${nextPercent}%`;
    } else {
      return `${this.getStatName(currentEffect.stat)} +${currentEffect.value.toFixed(1)} → +${nextValue.toFixed(1)}`;
    }
  }

  protected getStatName(stat: keyof PlayerStats): string {
    const statNames: Record<keyof PlayerStats, string> = {
      maxHP: '최대 HP',
      currentHP: '현재 HP',
      hpRegen: 'HP 회복',
      moveSpeed: '이동속도',
      damage: '공격력',
      attackSpeed: '공격속도',
      area: '범위',
      duration: '지속시간',
      projectileCount: '투사체',
      expMultiplier: '경험치',
      pickupRange: '픽업 범위'
    };
    return statNames[stat] || stat;
  }
}
