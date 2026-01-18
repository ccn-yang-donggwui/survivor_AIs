export type UpgradeId = "maxHealth" | "moveSpeed" | "pickupRadius" | "regen";

export type MetaState = {
  currency: number;
  upgrades: Record<UpgradeId, number>;
};

type UpgradeConfig = {
  id: UpgradeId;
  label: string;
  description: string;
  step: number;
  maxLevel: number;
  baseCost: number;
  costStep: number;
};

const STORAGE_KEY = "vamseryu.meta";

export const UPGRADE_CONFIG: UpgradeConfig[] = [
  {
    id: "maxHealth",
    label: "Vital Tissue",
    description: "+10 max HP per level",
    step: 10,
    maxLevel: 8,
    baseCost: 60,
    costStep: 40
  },
  {
    id: "moveSpeed",
    label: "Muscle Flex",
    description: "+3% move speed per level",
    step: 0.03,
    maxLevel: 8,
    baseCost: 50,
    costStep: 35
  },
  {
    id: "pickupRadius",
    label: "Chemoreceptors",
    description: "+8 pickup radius per level",
    step: 8,
    maxLevel: 8,
    baseCost: 45,
    costStep: 30
  },
  {
    id: "regen",
    label: "Rapid Healing",
    description: "+0.05 regen per level",
    step: 0.05,
    maxLevel: 6,
    baseCost: 70,
    costStep: 45
  }
];

export const DEFAULT_META: MetaState = {
  currency: 0,
  upgrades: {
    maxHealth: 0,
    moveSpeed: 0,
    pickupRadius: 0,
    regen: 0
  }
};

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_META };
    }
    const parsed = JSON.parse(raw) as MetaState;
    return {
      currency: Number(parsed.currency ?? DEFAULT_META.currency),
      upgrades: {
        maxHealth: Number(parsed.upgrades?.maxHealth ?? 0),
        moveSpeed: Number(parsed.upgrades?.moveSpeed ?? 0),
        pickupRadius: Number(parsed.upgrades?.pickupRadius ?? 0),
        regen: Number(parsed.upgrades?.regen ?? 0)
      }
    };
  } catch {
    return { ...DEFAULT_META };
  }
}

export function saveMeta(state: MetaState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getUpgradeCost(config: UpgradeConfig, level: number) {
  return Math.floor(config.baseCost + config.costStep * level * 1.2);
}

export function applyMetaUpgrade(
  stat: UpgradeId,
  baseValue: number,
  meta: MetaState
): number {
  const config = UPGRADE_CONFIG.find((item) => item.id === stat);
  if (!config) {
    return baseValue;
  }

  const level = meta.upgrades[stat] ?? 0;
  if (stat === "moveSpeed") {
    return baseValue * (1 + config.step * level);
  }

  return baseValue + config.step * level;
}

export function purchaseUpgrade(meta: MetaState, upgradeId: UpgradeId): MetaState {
  const config = UPGRADE_CONFIG.find((item) => item.id === upgradeId);
  if (!config) {
    return meta;
  }

  const currentLevel = meta.upgrades[upgradeId] ?? 0;
  if (currentLevel >= config.maxLevel) {
    return meta;
  }

  const cost = getUpgradeCost(config, currentLevel);
  if (meta.currency < cost) {
    return meta;
  }

  return {
    currency: meta.currency - cost,
    upgrades: {
      ...meta.upgrades,
      [upgradeId]: currentLevel + 1
    }
  };
}
