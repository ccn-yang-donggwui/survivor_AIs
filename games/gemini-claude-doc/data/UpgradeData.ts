export interface UpgradeOption {
    id: string;
    name: string;
    description: string;
    type: 'weapon' | 'passive';
    icon?: string;
}

export const UPGRADE_OPTIONS: UpgradeOption[] = [
    {
        id: 'dagger',
        name: 'Dagger',
        description: 'Fires a dagger at the closest enemy.',
        type: 'weapon'
    },
    {
        id: 'magic_wand',
        name: 'Magic Wand',
        description: 'Fires a magic missile at a random enemy.',
        type: 'weapon'
    },
    {
        id: 'holy_water',
        name: 'Holy Water',
        description: 'Creates a pool of holy water that damages enemies.',
        type: 'weapon'
    },
    // Add more as needed
    {
        id: 'might',
        name: 'Might',
        description: 'Increases damage by 10%.',
        type: 'passive'
    },
    {
        id: 'speed',
        name: 'Speed',
        description: 'Increases move speed by 10%.',
        type: 'passive'
    },
    {
        id: 'area',
        name: 'Area',
        description: 'Increases attack area by 10%.',
        type: 'passive'
    },
    {
        id: 'cooldown',
        name: 'Cooldown',
        description: 'Reduces weapon cooldown by 5%.',
        type: 'passive'
    },
    {
        id: 'magnet',
        name: 'Magnet',
        description: 'Increases pickup range by 25%.',
        type: 'passive'
    }
];
