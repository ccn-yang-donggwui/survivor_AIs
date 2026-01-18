export interface PlayerStats {
    maxHP: number;
    hpRecovery: number; // per second
    moveSpeed: number;
    might: number; // damage multiplier
    cooldown: number; // cooldown reduction multiplier
    area: number; // area of effect multiplier
    duration: number; // effect duration multiplier
    amount: number; // additional projectiles
    growth: number; // exp multiplier
    magnet: number; // pickup range
    luck: number;
}
