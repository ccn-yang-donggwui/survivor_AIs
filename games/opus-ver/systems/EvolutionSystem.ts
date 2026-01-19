// 진화 시스템 - 무기 + 패시브 조합으로 상위 무기 생성

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import type { WeaponState, PassiveState } from '../types/GameTypes';
import evolutionsJson from '../data/evolutions.json';

export interface EvolutionRecipe {
  id: string;
  name: string;
  description: string;
  weaponId: string;
  passiveId: string;
  evolvedWeaponId: string;
  weaponMinLevel: number;
  passiveMinLevel: number;
}

export interface EvolutionResult {
  success: boolean;
  evolvedWeaponId?: string;
  evolvedWeaponName?: string;
  removedWeaponId?: string;
  removedPassiveId?: string;
}

export class EvolutionSystem {
  private scene: Phaser.Scene;
  private recipes: EvolutionRecipe[] = [];
  private evolvedWeapons: Set<string> = new Set();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // 데이터 로드
  async loadEvolutionData(): Promise<void> {
    try {
      // JSON 필드명을 EvolutionRecipe 인터페이스에 맞게 매핑
      this.recipes = evolutionsJson.evolutions.map((e: any) => ({
        id: e.id,
        name: e.name || e.id,
        description: e.description || '',
        weaponId: e.baseWeaponId,
        passiveId: e.requiredPassiveId,
        evolvedWeaponId: e.resultWeaponId,
        weaponMinLevel: e.requiredWeaponLevel,
        passiveMinLevel: e.requiredPassiveLevel,
      }));
    } catch (error) {
      console.error('Failed to load evolution data:', error);
      this.loadDefaultRecipes();
    }
  }

  private loadDefaultRecipes(): void {
    // evolutions.json과 동일하게 유지 (fallback용)
    this.recipes = [
      {
        id: 'thousand_edge',
        name: '천개의 칼날',
        description: '단검이 천 개의 칼날로 진화합니다!',
        weaponId: 'dagger',
        passiveId: 'bracer',
        evolvedWeaponId: 'thousand_edge',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
      {
        id: 'holy_wand',
        name: '홀리 완드',
        description: '마법봉이 신성한 지팡이로 진화합니다!',
        weaponId: 'magic_wand',
        passiveId: 'empty_tome',
        evolvedWeaponId: 'holy_wand',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
      {
        id: 'soul_eater',
        name: '소울 이터',
        description: '활이 영혼을 흡수하는 궁으로 진화합니다!',
        weaponId: 'bow',
        passiveId: 'pummarola',
        evolvedWeaponId: 'soul_eater',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
      {
        id: 'death_spiral',
        name: '죽음의 소용돌이',
        description: '도끼가 죽음의 나선으로 진화합니다!',
        weaponId: 'axe',
        passiveId: 'duplicator',
        evolvedWeaponId: 'death_spiral',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
      {
        id: 'bloody_tear',
        name: '피의 눈물',
        description: '채찍이 피의 눈물로 진화합니다!',
        weaponId: 'whip',
        passiveId: 'hollow_heart',
        evolvedWeaponId: 'bloody_tear',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
      {
        id: 'la_borra',
        name: '라 보라',
        description: '성수가 거대 슬라임으로 진화합니다!',
        weaponId: 'holy_water',
        passiveId: 'candelabrador',
        evolvedWeaponId: 'la_borra',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
      {
        id: 'thunder_loop',
        name: '천둥 고리',
        description: '번개 반지가 천둥 고리로 진화합니다!',
        weaponId: 'lightning_ring',
        passiveId: 'attractorb',
        evolvedWeaponId: 'thunder_loop',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
      {
        id: 'unholy_vespers',
        name: '불경한 성가',
        description: '성경이 불경한 저녁기도로 진화합니다!',
        weaponId: 'bible',
        passiveId: 'spellbinder',
        evolvedWeaponId: 'unholy_vespers',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
      {
        id: 'hellfire',
        name: '지옥불',
        description: '파이어볼이 지옥불로 진화합니다!',
        weaponId: 'fireball',
        passiveId: 'spinach',
        evolvedWeaponId: 'hellfire',
        weaponMinLevel: 5,
        passiveMinLevel: 1,
      },
    ];
  }

  // 진화 가능한 조합 체크
  getAvailableEvolutions(weapons: WeaponState[], passives: PassiveState[]): EvolutionRecipe[] {
    const available: EvolutionRecipe[] = [];

    for (const recipe of this.recipes) {
      // 이미 진화했는지 체크
      if (this.evolvedWeapons.has(recipe.id)) continue;

      // 무기 체크
      const weapon = weapons.find(w => w.id === recipe.weaponId);
      if (!weapon || weapon.level < recipe.weaponMinLevel) continue;

      // 패시브 체크
      const passive = passives.find(p => p.id === recipe.passiveId);
      if (!passive || passive.level < recipe.passiveMinLevel) continue;

      available.push(recipe);
    }

    return available;
  }

  // 진화 조건 충족 여부
  canEvolve(
    recipeId: string,
    weapons: WeaponState[],
    passives: PassiveState[]
  ): boolean {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe) return false;

    if (this.evolvedWeapons.has(recipe.id)) return false;

    const weapon = weapons.find(w => w.id === recipe.weaponId);
    if (!weapon || weapon.level < recipe.weaponMinLevel) return false;

    const passive = passives.find(p => p.id === recipe.passiveId);
    if (!passive || passive.level < recipe.passiveMinLevel) return false;

    return true;
  }

  // 진화 실행
  evolve(
    recipeId: string,
    player: Player
  ): EvolutionResult {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe) {
      return { success: false };
    }

    const weapons = player.getWeapons();
    const passives = player.getPassives();

    if (!this.canEvolve(recipeId, weapons, passives)) {
      return { success: false };
    }

    // 진화 완료 표시
    this.evolvedWeapons.add(recipe.id);

    // 이벤트 발생
    this.scene.events.emit('weaponEvolved', {
      recipe,
      evolvedWeaponId: recipe.evolvedWeaponId,
    });

    return {
      success: true,
      evolvedWeaponId: recipe.evolvedWeaponId,
      evolvedWeaponName: recipe.name,
      removedWeaponId: recipe.weaponId,
      removedPassiveId: recipe.passiveId,
    };
  }

  // 진화 레시피 힌트 (어떤 조합이 가능한지)
  getEvolutionHint(weaponId: string): EvolutionRecipe | null {
    return this.recipes.find(r => r.weaponId === weaponId) || null;
  }

  getPassiveEvolutionHint(passiveId: string): EvolutionRecipe | null {
    return this.recipes.find(r => r.passiveId === passiveId) || null;
  }

  // 모든 레시피 조회
  getAllRecipes(): EvolutionRecipe[] {
    return [...this.recipes];
  }

  // 진화 완료된 무기들
  getEvolvedWeapons(): string[] {
    return Array.from(this.evolvedWeapons);
  }

  // 특정 무기가 진화 무기인지 확인
  isEvolvedWeapon(weaponId: string): boolean {
    return this.recipes.some(r => r.evolvedWeaponId === weaponId);
  }

  // 진화 진행률 (현재 진화 가능한 것 / 전체)
  getEvolutionProgress(weapons: WeaponState[], passives: PassiveState[]): {
    available: number;
    completed: number;
    total: number;
  } {
    const available = this.getAvailableEvolutions(weapons, passives).length;
    const completed = this.evolvedWeapons.size;
    const total = this.recipes.length;

    return { available, completed, total };
  }

  // 레시피 정보로 진화 요구사항 문자열 생성
  getRequirementText(recipe: EvolutionRecipe): string {
    return `${recipe.weaponId} Lv.${recipe.weaponMinLevel} + ${recipe.passiveId} Lv.${recipe.passiveMinLevel}`;
  }

  // 진화에 사용된 무기 ID들 반환
  getUsedWeaponIds(): string[] {
    const usedWeapons: string[] = [];
    this.evolvedWeapons.forEach(recipeId => {
      const recipe = this.recipes.find(r => r.id === recipeId);
      if (recipe) {
        usedWeapons.push(recipe.weaponId);
      }
    });
    return usedWeapons;
  }

  // 진화에 사용된 패시브 ID들 반환
  getUsedPassiveIds(): string[] {
    const usedPassives: string[] = [];
    this.evolvedWeapons.forEach(recipeId => {
      const recipe = this.recipes.find(r => r.id === recipeId);
      if (recipe) {
        usedPassives.push(recipe.passiveId);
      }
    });
    return usedPassives;
  }

  // 리셋
  reset(): void {
    this.evolvedWeapons.clear();
  }
}
