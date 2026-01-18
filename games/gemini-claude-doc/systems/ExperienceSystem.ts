export class ExperienceSystem {
    private level: number = 1;
    private currentExp: number = 0;
    private nextLevelExp: number = 5; // Base exp for level 2

    constructor() {
        this.calculateNextLevelExp();
    }

    public addExperience(amount: number): boolean {
        this.currentExp += amount;
        if (this.currentExp >= this.nextLevelExp) {
            this.levelUp();
            return true; // Leveled up
        }
        return false;
    }

    private levelUp() {
        this.currentExp -= this.nextLevelExp;
        this.level++;
        this.calculateNextLevelExp();
    }

    private calculateNextLevelExp() {
        // Simple scaling: each level requires more exp
        // Level 1: 5
        // Level 2: 10
        // Level 3: 15... or more aggressive scaling
        this.nextLevelExp = this.level * 5 + Math.floor(Math.pow(this.level, 1.5));
    }

    public getLevel(): number {
        return this.level;
    }

    public getCurrentExp(): number {
        return this.currentExp;
    }

    public getNextLevelExp(): number {
        return this.nextLevelExp;
    }

    public getProgress(): number {
        return this.currentExp / this.nextLevelExp;
    }
}
