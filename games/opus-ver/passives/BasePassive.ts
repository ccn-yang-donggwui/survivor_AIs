import type { PassiveData } from '../types/DataTypes';
import type { PlayerStats } from '../types/GameTypes';
import { PASSIVES } from '../config/Constants';

export class BasePassive {
  public id: string;
  public name: string;
  public icon: string;
  public level: number = 1;
  public maxLevel: number;

  protected data: PassiveData;
  protected stat: keyof PlayerStats;
  protected baseValue: number;
  protected perLevelValue: number;
  protected isMultiplier: boolean;

  constructor(data: PassiveData) {
    this.data = data;
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.maxLevel = data.maxLevel;
    this.stat = data.stat as keyof PlayerStats;
    this.baseValue = data.baseValue;
    this.perLevelValue = data.perLevelValue;
    this.isMultiplier = data.isMultiplier;
  }

  levelUp(): boolean {
    if (this.level >= this.maxLevel) return false;
    this.level++;
    return true;
  }

  applyToStats(stats: PlayerStats): void {
    const value = this.getValue();

    if (this.isMultiplier) {
      (stats[this.stat] as number) *= (1 + value);
    } else {
      (stats[this.stat] as number) += value;
    }
  }

  getValue(): number {
    return this.baseValue + (this.level - 1) * this.perLevelValue;
  }

  getDescription(): string {
    return this.data.description;
  }

  getLevelDescription(): string {
    const nextValue = this.baseValue + this.level * this.perLevelValue;
    const format = this.isMultiplier ? `+${Math.round(nextValue * 100)}%` : `+${nextValue}`;
    return `${this.name} ${format}`;
  }

  isMaxLevel(): boolean {
    return this.level >= this.maxLevel;
  }

  getLinkedEvolutionId(): string | undefined {
    return this.data.linkedEvolutionId;
  }
}
