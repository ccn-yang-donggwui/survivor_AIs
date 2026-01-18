import type { PassiveData } from '../types/DataTypes';
import { BasePassive } from './BasePassive';

import passivesJson from '../data/passives.json';

// 패시브 데이터 캐시
const PASSIVES_DATA: Map<string, PassiveData> = new Map();

function loadPassivesData(): void {
  if (PASSIVES_DATA.size > 0) return;

  passivesJson.passives.forEach(passive => {
    PASSIVES_DATA.set(passive.id, passive as PassiveData);
  });
}

export class PassiveFactory {
  static create(passiveId: string): BasePassive | null {
    loadPassivesData();

    const data = PASSIVES_DATA.get(passiveId);
    if (!data) {
      console.warn(`Unknown passive: ${passiveId}`);
      return null;
    }

    return new BasePassive(data);
  }

  static getPassiveData(passiveId: string): PassiveData | undefined {
    loadPassivesData();
    return PASSIVES_DATA.get(passiveId);
  }

  static getAllPassiveIds(): string[] {
    loadPassivesData();
    return Array.from(PASSIVES_DATA.keys());
  }

  static getAllPassives(): PassiveData[] {
    loadPassivesData();
    return Array.from(PASSIVES_DATA.values());
  }

  static getPassivesByRarity(rarity: string): PassiveData[] {
    loadPassivesData();
    return Array.from(PASSIVES_DATA.values()).filter(p => p.rarity === rarity);
  }

  static getRandomPassive(excludeIds: string[] = []): PassiveData | null {
    loadPassivesData();

    const available = Array.from(PASSIVES_DATA.values())
      .filter(p => !excludeIds.includes(p.id));

    if (available.length === 0) return null;

    // rarity 기반 가중치
    const weighted: PassiveData[] = [];
    available.forEach(passive => {
      let weight = 1;
      switch (passive.rarity) {
        case 'common': weight = 10; break;
        case 'uncommon': weight = 6; break;
        case 'rare': weight = 3; break;
        case 'epic': weight = 1; break;
      }
      for (let i = 0; i < weight * 10; i++) {
        weighted.push(passive);
      }
    });

    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  static getPassiveForEvolution(evolutionId: string): PassiveData | undefined {
    loadPassivesData();
    return Array.from(PASSIVES_DATA.values())
      .find(p => p.linkedEvolutionId === evolutionId);
  }
}
