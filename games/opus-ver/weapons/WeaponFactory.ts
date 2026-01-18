import Phaser from 'phaser';
import type { WeaponData } from '../types/DataTypes';
import { BaseWeapon } from './BaseWeapon';
import { Dagger } from './implementations/Dagger';
import { MagicWand } from './implementations/MagicWand';
import { Bow } from './implementations/Bow';
import { Axe } from './implementations/Axe';
import { Whip } from './implementations/Whip';
import { HolyWater } from './implementations/HolyWater';
import { Garlic } from './implementations/Garlic';
import { LightningRing } from './implementations/LightningRing';
import { Bible } from './implementations/Bible';
import { Fireball } from './implementations/Fireball';

// 진화 무기
import { ThousandEdge } from './implementations/evolved/ThousandEdge';
import { HolyWand } from './implementations/evolved/HolyWand';
import { SoulEater } from './implementations/evolved/SoulEater';
import { DeathSpiral } from './implementations/evolved/DeathSpiral';
import { BloodyTear } from './implementations/evolved/BloodyTear';
import { LaBorra } from './implementations/evolved/LaBorra';
import { ThunderLoop } from './implementations/evolved/ThunderLoop';
import { UnholyVespers } from './implementations/evolved/UnholyVespers';
import { Hellfire } from './implementations/evolved/Hellfire';

import weaponsJson from '../data/weapons.json';

// 무기 데이터 캐시
const WEAPONS_DATA: Map<string, WeaponData> = new Map();

// JSON에서 무기 데이터 로드
function loadWeaponsData(): void {
  if (WEAPONS_DATA.size > 0) return;

  weaponsJson.weapons.forEach(weapon => {
    WEAPONS_DATA.set(weapon.id, weapon as WeaponData);
  });
}

export class WeaponFactory {
  static create(scene: Phaser.Scene, weaponId: string): BaseWeapon | null {
    loadWeaponsData();

    const data = WEAPONS_DATA.get(weaponId);
    if (!data) {
      console.warn(`Unknown weapon: ${weaponId}`);
      return null;
    }

    switch (weaponId) {
      // 기본 무기
      case 'dagger':
        return new Dagger(scene, data);
      case 'magic_wand':
        return new MagicWand(scene, data);
      case 'bow':
        return new Bow(scene, data);
      case 'axe':
        return new Axe(scene, data);
      case 'whip':
        return new Whip(scene, data);
      case 'holy_water':
        return new HolyWater(scene, data);
      case 'garlic':
        return new Garlic(scene, data);
      case 'lightning_ring':
        return new LightningRing(scene, data);
      case 'bible':
        return new Bible(scene, data);
      case 'fireball':
        return new Fireball(scene, data);

      // 진화 무기
      case 'thousand_edge':
        return new ThousandEdge(scene, data);
      case 'holy_wand':
        return new HolyWand(scene, data);
      case 'soul_eater':
        return new SoulEater(scene, data);
      case 'death_spiral':
        return new DeathSpiral(scene, data);
      case 'bloody_tear':
        return new BloodyTear(scene, data);
      case 'la_borra':
        return new LaBorra(scene, data);
      case 'thunder_loop':
        return new ThunderLoop(scene, data);
      case 'unholy_vespers':
        return new UnholyVespers(scene, data);
      case 'hellfire':
        return new Hellfire(scene, data);

      default:
        console.warn(`No implementation for weapon: ${weaponId}`);
        return null;
    }
  }

  static getWeaponData(weaponId: string): WeaponData | undefined {
    loadWeaponsData();
    return WEAPONS_DATA.get(weaponId);
  }

  static getAllWeaponIds(): string[] {
    loadWeaponsData();
    return Array.from(WEAPONS_DATA.keys());
  }

  static getAllWeapons(): WeaponData[] {
    loadWeaponsData();
    return Array.from(WEAPONS_DATA.values());
  }

  static getWeaponsByRarity(rarity: string): WeaponData[] {
    loadWeaponsData();
    return Array.from(WEAPONS_DATA.values()).filter(w => w.rarity === rarity);
  }

  static getRandomWeapon(excludeIds: string[] = []): WeaponData | null {
    loadWeaponsData();

    const available = Array.from(WEAPONS_DATA.values())
      .filter(w => !excludeIds.includes(w.id));

    if (available.length === 0) return null;

    // rarity 기반 가중치
    const weighted: WeaponData[] = [];
    available.forEach(weapon => {
      let weight = 1;
      switch (weapon.rarity) {
        case 'common': weight = 10; break;
        case 'uncommon': weight = 6; break;
        case 'rare': weight = 3; break;
        case 'epic': weight = 1; break;
        case 'legendary': weight = 0.5; break;
      }
      for (let i = 0; i < weight * 10; i++) {
        weighted.push(weapon);
      }
    });

    return weighted[Math.floor(Math.random() * weighted.length)];
  }
}
