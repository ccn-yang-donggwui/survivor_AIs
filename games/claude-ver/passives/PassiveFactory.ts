import { BasePassive } from './BasePassive';
import {
  Wings,
  ManaCrystal,
  BookOfLife,
  PowerBracelet,
  EmptyTome,
  Hourglass,
  Magnet,
  Crown,
  Armor,
  Spinach
} from './PassiveItems';

interface PassiveInfo {
  name: string;
  icon: string;
  description: string;
}

const PASSIVE_INFO: Record<string, PassiveInfo> = {
  wings: {
    name: '민첩의 날개',
    icon: '🪽',
    description: '이동속도가 10% 증가합니다.'
  },
  mana_crystal: {
    name: '마나 크리스탈',
    icon: '💎',
    description: '공격속도가 8% 증가합니다.'
  },
  book_of_life: {
    name: '생명의 책',
    icon: '📕',
    description: '초당 HP 회복량이 0.3 증가합니다.'
  },
  power_bracelet: {
    name: '힘의 팔찌',
    icon: '💪',
    description: '공격력이 10% 증가합니다.'
  },
  empty_tome: {
    name: '빈 고서',
    icon: '📖',
    description: '공격 범위가 10% 증가합니다.'
  },
  hourglass: {
    name: '시간의 모래',
    icon: '⏳',
    description: '효과 지속시간이 10% 증가합니다.'
  },
  magnet: {
    name: '자석',
    icon: '🧲',
    description: '아이템 픽업 범위가 25 증가합니다.'
  },
  crown: {
    name: '왕관',
    icon: '👑',
    description: '획득 경험치가 10% 증가합니다.'
  },
  armor: {
    name: '갑옷',
    icon: '🛡️',
    description: '최대 HP가 10 증가합니다.'
  },
  spinach: {
    name: '시금치',
    icon: '🥬',
    description: '투사체가 1개 추가됩니다. (1회 획득 가능)'
  }
};

export class PassiveFactory {
  static create(id: string): BasePassive {
    switch (id) {
      case 'wings':
        return new Wings();
      case 'mana_crystal':
        return new ManaCrystal();
      case 'book_of_life':
        return new BookOfLife();
      case 'power_bracelet':
        return new PowerBracelet();
      case 'empty_tome':
        return new EmptyTome();
      case 'hourglass':
        return new Hourglass();
      case 'magnet':
        return new Magnet();
      case 'crown':
        return new Crown();
      case 'armor':
        return new Armor();
      case 'spinach':
        return new Spinach();
      default:
        return new Wings();
    }
  }

  static getAllPassiveIds(): string[] {
    return Object.keys(PASSIVE_INFO);
  }

  static getPassiveInfo(id: string): PassiveInfo {
    return PASSIVE_INFO[id] || PASSIVE_INFO.wings;
  }
}
