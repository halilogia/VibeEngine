/**
 * SceneManager - Manage game states and scene transitions
 * Handles Menu → Gameplay → GameOver flow.
 */

export type GameState = 'loading' | 'menu' | 'playing' | 'paused' | 'gameover';

export interface StateConfig {
    onEnter?: () => void;
    onExit?: () => void;
    onUpdate?: (deltaTime: number) => void;
}

type StateListener = (newState: GameState, oldState: GameState) => void;

/**
 * Scene/State Manager
 */
export class SceneManager {
    private static instance: SceneManager | null = null;
    
    private currentState: GameState = 'loading';
    private states: Map<GameState, StateConfig> = new Map();
    private listeners: StateListener[] = [];
    private isPaused: boolean = false;

    /**
     * Get singleton instance
     */
    static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }

    /**
     * Register a state with callbacks
     */
    registerState(state: GameState, config: StateConfig): this {
        this.states.set(state, config);
        return this;
    }

    /**
     * Change to a new state
     */
    setState(newState: GameState): void {
        if (newState === this.currentState) return;

        const oldState = this.currentState;
        const oldConfig = this.states.get(oldState);
        const newConfig = this.states.get(newState);

        // Exit old state
        if (oldConfig?.onExit) {
            oldConfig.onExit();
        }

        this.currentState = newState;

        // Enter new state
        if (newConfig?.onEnter) {
            newConfig.onEnter();
        }

        // Notify listeners
        this.listeners.forEach(listener => listener(newState, oldState));

        console.log(`🎬 State: ${oldState} → ${newState}`);
    }

    /**
     * Get current state
     */
    getState(): GameState {
        return this.currentState;
    }

    /**
     * Check if in specific state
     */
    isState(state: GameState): boolean {
        return this.currentState === state;
    }

    /**
     * Pause the game
     */
    pause(): void {
        if (this.currentState === 'playing') {
            this.isPaused = true;
            this.setState('paused');
        }
    }

    /**
     * Resume the game
     */
    resume(): void {
        if (this.currentState === 'paused') {
            this.isPaused = false;
            this.setState('playing');
        }
    }

    /**
     * Toggle pause
     */
    togglePause(): void {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * Quick state changers
     */
    goToMenu(): void {
        this.setState('menu');
    }

    startGame(): void {
        this.setState('playing');
    }

    gameOver(): void {
        this.setState('gameover');
    }

    /**
     * Update current state (call each frame)
     */
    update(deltaTime: number): void {
        if (this.isPaused) return;
        
        const config = this.states.get(this.currentState);
        if (config?.onUpdate) {
            config.onUpdate(deltaTime);
        }
    }

    /**
     * Add state change listener
     */
    onStateChange(listener: StateListener): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    /**
     * Reset manager
     */
    reset(): void {
        this.currentState = 'loading';
        this.isPaused = false;
    }
}

// Convenience export
export const sceneManager = SceneManager.getInstance();
