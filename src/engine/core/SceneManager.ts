

export type GameState = 'loading' | 'menu' | 'playing' | 'paused' | 'gameover';

export interface StateConfig {
    onEnter?: () => void;
    onExit?: () => void;
    onUpdate?: (deltaTime: number) => void;
}

type StateListener = (newState: GameState, oldState: GameState) => void;

export class SceneManager {
    private static instance: SceneManager | null = null;
    
    private currentState: GameState = 'loading';
    private states: Map<GameState, StateConfig> = new Map();
    private listeners: StateListener[] = [];
    private isPaused: boolean = false;

    static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }

    registerState(state: GameState, config: StateConfig): this {
        this.states.set(state, config);
        return this;
    }

    setState(newState: GameState): void {
        if (newState === this.currentState) return;

        const oldState = this.currentState;
        const oldConfig = this.states.get(oldState);
        const newConfig = this.states.get(newState);

        if (oldConfig?.onExit) {
            oldConfig.onExit();
        }

        this.currentState = newState;

        if (newConfig?.onEnter) {
            newConfig.onEnter();
        }

        this.listeners.forEach(listener => listener(newState, oldState));

        console.log(`🎬 State: ${oldState} → ${newState}`);
    }

    getState(): GameState {
        return this.currentState;
    }

    isState(state: GameState): boolean {
        return this.currentState === state;
    }

    pause(): void {
        if (this.currentState === 'playing') {
            this.isPaused = true;
            this.setState('paused');
        }
    }

    resume(): void {
        if (this.currentState === 'paused') {
            this.isPaused = false;
            this.setState('playing');
        }
    }

    togglePause(): void {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    goToMenu(): void {
        this.setState('menu');
    }

    startGame(): void {
        this.setState('playing');
    }

    gameOver(): void {
        this.setState('gameover');
    }

    update(deltaTime: number): void {
        if (this.isPaused) return;
        
        const config = this.states.get(this.currentState);
        if (config?.onUpdate) {
            config.onUpdate(deltaTime);
        }
    }

    onStateChange(listener: StateListener): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    reset(): void {
        this.currentState = 'loading';
        this.isPaused = false;
    }
}

export const sceneManager = SceneManager.getInstance();
