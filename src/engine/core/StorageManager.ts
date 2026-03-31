/**
 * StorageManager - Persistent storage for game data
 * Handles highscores, settings, and game progress.
 */

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

/**
 * Storage Manager
 */
export class StorageManager {
    private static instance: StorageManager | null = null;
    private storageKey: string;
    private data: GameData;
    private autoSave: boolean = true;

    private constructor(gameId: string = 'vibe-game') {
        this.storageKey = `${gameId}-save`;
        this.data = this.load();
    }

    /**
     * Get singleton instance
     */
    static getInstance(gameId?: string): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager(gameId);
        }
        return StorageManager.instance;
    }

    /**
     * Initialize with custom game ID
     */
    static init(gameId: string): StorageManager {
        StorageManager.instance = new StorageManager(gameId);
        return StorageManager.instance;
    }

    // ============ HIGH SCORE ============

    /**
     * Get current high score
     */
    getHighScore(): number {
        return this.data.highScore;
    }

    /**
     * Update high score if new score is higher
     * @returns true if new high score
     */
    updateHighScore(score: number): boolean {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            if (this.autoSave) this.save();
            console.log(`🏆 New High Score: ${score}`);
            return true;
        }
        return false;
    }

    // ============ COINS ============

    /**
     * Get total coins
     */
    getCoins(): number {
        return this.data.totalCoins;
    }

    /**
     * Add coins
     */
    addCoins(amount: number): number {
        this.data.totalCoins += amount;
        if (this.autoSave) this.save();
        return this.data.totalCoins;
    }

    /**
     * Spend coins (returns false if not enough)
     */
    spendCoins(amount: number): boolean {
        if (this.data.totalCoins >= amount) {
            this.data.totalCoins -= amount;
            if (this.autoSave) this.save();
            return true;
        }
        return false;
    }

    // ============ STATS ============

    /**
     * Increment games played
     */
    incrementGamesPlayed(): number {
        this.data.gamesPlayed++;
        this.data.lastPlayed = new Date().toISOString();
        if (this.autoSave) this.save();
        return this.data.gamesPlayed;
    }

    /**
     * Get games played count
     */
    getGamesPlayed(): number {
        return this.data.gamesPlayed;
    }

    // ============ SETTINGS ============

    /**
     * Get settings
     */
    getSettings(): GameSettings {
        return { ...this.data.settings };
    }

    /**
     * Update settings
     */
    updateSettings(settings: Partial<GameSettings>): void {
        this.data.settings = { ...this.data.settings, ...settings };
        if (this.autoSave) this.save();
    }

    // ============ UNLOCKABLES ============

    /**
     * Check if item is unlocked
     */
    isUnlocked(itemId: string): boolean {
        return this.data.unlockedItems.includes(itemId);
    }

    /**
     * Unlock an item
     */
    unlock(itemId: string): void {
        if (!this.isUnlocked(itemId)) {
            this.data.unlockedItems.push(itemId);
            if (this.autoSave) this.save();
            console.log(`🔓 Unlocked: ${itemId}`);
        }
    }

    /**
     * Get all unlocked items
     */
    getUnlocked(): string[] {
        return [...this.data.unlockedItems];
    }

    // ============ PERSISTENCE ============

    /**
     * Save data to localStorage
     */
    save(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save game data:', e);
        }
    }

    /**
     * Load data from localStorage
     */
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

    /**
     * Reset all data
     */
    reset(): void {
        this.data = { ...DEFAULT_DATA };
        this.save();
        console.log('🗑️ Game data reset');
    }

    /**
     * Get all data (for debugging)
     */
    getAllData(): GameData {
        return { ...this.data };
    }

    /**
     * Set auto-save behavior
     */
    setAutoSave(enabled: boolean): void {
        this.autoSave = enabled;
    }
}

// Convenience export
export const storage = StorageManager.getInstance();
