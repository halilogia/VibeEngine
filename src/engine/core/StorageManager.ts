

export interface GameData {
    highScore: number;
    totalCoins: number;
    gamesPlayed: number;
    settings: GameSettings;
    unlockedItems: string[];
    lastPlayed: string;
}

export interface GameSettings {
    musicVolume: number;
    sfxVolume: number;
    vibration: boolean;
}

const DEFAULT_DATA: GameData = {
    highScore: 0,
    totalCoins: 0,
    gamesPlayed: 0,
    settings: {
        musicVolume: 0.7,
        sfxVolume: 1.0,
        vibration: true
    },
    unlockedItems: [],
    lastPlayed: ''
};

export class StorageManager {
    private static instance: StorageManager | null = null;
    private storageKey: string;
    private data: GameData;
    private autoSave: boolean = true;

    private constructor(gameId: string = 'vibe-game') {
        this.storageKey = `${gameId}-save`;
        this.data = this.load();
    }

    static getInstance(gameId?: string): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager(gameId);
        }
        return StorageManager.instance;
    }

    static init(gameId: string): StorageManager {
        StorageManager.instance = new StorageManager(gameId);
        return StorageManager.instance;
    }

    getHighScore(): number {
        return this.data.highScore;
    }

    updateHighScore(score: number): boolean {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            if (this.autoSave) this.save();
            console.log(`🏆 New High Score: ${score}`);
            return true;
        }
        return false;
    }

    getCoins(): number {
        return this.data.totalCoins;
    }

    addCoins(amount: number): number {
        this.data.totalCoins += amount;
        if (this.autoSave) this.save();
        return this.data.totalCoins;
    }

    spendCoins(amount: number): boolean {
        if (this.data.totalCoins >= amount) {
            this.data.totalCoins -= amount;
            if (this.autoSave) this.save();
            return true;
        }
        return false;
    }

    incrementGamesPlayed(): number {
        this.data.gamesPlayed++;
        this.data.lastPlayed = new Date().toISOString();
        if (this.autoSave) this.save();
        return this.data.gamesPlayed;
    }

    getGamesPlayed(): number {
        return this.data.gamesPlayed;
    }

    getSettings(): GameSettings {
        return { ...this.data.settings };
    }

    updateSettings(settings: Partial<GameSettings>): void {
        this.data.settings = { ...this.data.settings, ...settings };
        if (this.autoSave) this.save();
    }

    isUnlocked(itemId: string): boolean {
        return this.data.unlockedItems.includes(itemId);
    }

    unlock(itemId: string): void {
        if (!this.isUnlocked(itemId)) {
            this.data.unlockedItems.push(itemId);
            if (this.autoSave) this.save();
            console.log(`🔓 Unlocked: ${itemId}`);
        }
    }

    getUnlocked(): string[] {
        return [...this.data.unlockedItems];
    }

    save(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save game data:', e);
        }
    }

    private load(): GameData {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return { ...DEFAULT_DATA, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load game data:', e);
        }
        return { ...DEFAULT_DATA };
    }

    reset(): void {
        this.data = { ...DEFAULT_DATA };
        this.save();
        console.log('🗑️ Game data reset');
    }

    getAllData(): GameData {
        return { ...this.data };
    }

    setAutoSave(enabled: boolean): void {
        this.autoSave = enabled;
    }
}

export const storage = StorageManager.getInstance();
