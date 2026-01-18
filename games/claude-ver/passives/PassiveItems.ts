import { BasePassive } from './BasePassive';

// 민첩의 날개 - 이동속도 증가
export class Wings extends BasePassive {
  constructor() {
    super({
      id: 'wings',
      name: '민첩의 날개',
      icon: '🪽',
      baseEffect: { stat: 'moveSpeed', value: 0.1, isMultiplier: true },
      effectPerLevel: 0.1
    });
  }
}

// 마나 크리스탈 - 쿨다운 감소 (공격속도 증가)
export class ManaCrystal extends BasePassive {
  constructor() {
    super({
      id: 'mana_crystal',
      name: '마나 크리스탈',
      icon: '💎',
      baseEffect: { stat: 'attackSpeed', value: 0.08, isMultiplier: true },
      effectPerLevel: 0.08
    });
  }
}

// 생명의 책 - HP 회복 증가
export class BookOfLife extends BasePassive {
  constructor() {
    super({
      id: 'book_of_life',
      name: '생명의 책',
      icon: '📕',
      baseEffect: { stat: 'hpRegen', value: 0.3, isMultiplier: false },
      effectPerLevel: 0.3
    });
  }
}

// 힘의 팔찌 - 공격력 증가
export class PowerBracelet extends BasePassive {
  constructor() {
    super({
      id: 'power_bracelet',
      name: '힘의 팔찌',
      icon: '💪',
      baseEffect: { stat: 'damage', value: 0.1, isMultiplier: true },
      effectPerLevel: 0.1
    });
  }
}

// 빈 고서 - 범위 증가
export class EmptyTome extends BasePassive {
  constructor() {
    super({
      id: 'empty_tome',
      name: '빈 고서',
      icon: '📖',
      baseEffect: { stat: 'area', value: 0.1, isMultiplier: true },
      effectPerLevel: 0.1
    });
  }
}

// 시간의 모래 - 지속시간 증가
export class Hourglass extends BasePassive {
  constructor() {
    super({
      id: 'hourglass',
      name: '시간의 모래',
      icon: '⏳',
      baseEffect: { stat: 'duration', value: 0.1, isMultiplier: true },
      effectPerLevel: 0.1
    });
  }
}

// 자석 - 픽업 범위 증가
export class Magnet extends BasePassive {
  constructor() {
    super({
      id: 'magnet',
      name: '자석',
      icon: '🧲',
      baseEffect: { stat: 'pickupRange', value: 25, isMultiplier: false },
      effectPerLevel: 25
    });
  }
}

// 왕관 - 경험치 획득 증가
export class Crown extends BasePassive {
  constructor() {
    super({
      id: 'crown',
      name: '왕관',
      icon: '👑',
      baseEffect: { stat: 'expMultiplier', value: 0.1, isMultiplier: true },
      effectPerLevel: 0.1
    });
  }
}

// 갑옷 - 최대 HP 증가
export class Armor extends BasePassive {
  constructor() {
    super({
      id: 'armor',
      name: '갑옷',
      icon: '🛡️',
      baseEffect: { stat: 'maxHP', value: 10, isMultiplier: false },
      effectPerLevel: 10
    });
  }
}

// 스피넬 - 추가 투사체
export class Spinach extends BasePassive {
  constructor() {
    super({
      id: 'spinach',
      name: '시금치',
      icon: '🥬',
      baseEffect: { stat: 'projectileCount', value: 1, isMultiplier: false },
      effectPerLevel: 0,
      maxLevel: 1
    });
  }
}
