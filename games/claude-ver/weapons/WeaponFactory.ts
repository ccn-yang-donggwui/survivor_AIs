import { GameScene } from '../scenes/GameScene';
import { BaseWeapon } from './BaseWeapon';
import { Dagger } from './Dagger';
import { MagicWand } from './MagicWand';
import { HolyWater } from './HolyWater';
import { Bow } from './Bow';
import { Axe } from './Axe';
import { Whip } from './Whip';
import { Garlic } from './Garlic';
import { LightningRing } from './LightningRing';

interface WeaponInfo {
  name: string;
  icon: string;
  description: string;
}

const WEAPON_INFO: Record<string, WeaponInfo> = {
  dagger: {
    name: '단검',
    icon: '🗡️',
    description: '가장 가까운 적에게 단검을 발사합니다.'
  },
  magic_wand: {
    name: '마법봉',
    icon: '🪄',
    description: '랜덤한 적에게 마법탄을 발사합니다.'
  },
  holy_water: {
    name: '성수',
    icon: '💧',
    description: '랜덤 위치에 성수 웅덩이를 생성합니다.'
  },
  bow: {
    name: '활',
    icon: '🏹',
    description: '적을 관통하는 화살을 발사합니다.'
  },
  axe: {
    name: '도끼',
    icon: '🪓',
    description: '높이 날아가는 도끼를 던집니다.'
  },
  whip: {
    name: '채찍',
    icon: '⚡',
    description: '넓은 범위를 가로로 공격합니다.'
  },
  garlic: {
    name: '마늘',
    icon: '🧄',
    description: '주변 적에게 지속 데미지를 줍니다.'
  },
  lightning_ring: {
    name: '번개 반지',
    icon: '💍',
    description: '화면 내 랜덤 적에게 번개를 내립니다.'
  }
};

export class WeaponFactory {
  static create(id: string, scene: GameScene): BaseWeapon {
    switch (id) {
      case 'dagger':
        return new Dagger(scene);
      case 'magic_wand':
        return new MagicWand(scene);
      case 'holy_water':
        return new HolyWater(scene);
      case 'bow':
        return new Bow(scene);
      case 'axe':
        return new Axe(scene);
      case 'whip':
        return new Whip(scene);
      case 'garlic':
        return new Garlic(scene);
      case 'lightning_ring':
        return new LightningRing(scene);
      default:
        return new Dagger(scene);
    }
  }

  static getAllWeaponIds(): string[] {
    return Object.keys(WEAPON_INFO);
  }

  static getWeaponInfo(id: string): WeaponInfo {
    return WEAPON_INFO[id] || WEAPON_INFO.dagger;
  }
}
