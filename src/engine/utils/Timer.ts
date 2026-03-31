/**
 * Timer - Time utilities for game development
 */

export class Timer {
    /** Time when timer started */
    private startTime: number = 0;

    /** Duration in seconds */
    readonly duration: number;

    /** Whether timer is running */
    private running: boolean = false;

    /** Elapsed time */
    private elapsed: number = 0;

    /** Callback when timer completes */
    onComplete?: () => void;

    constructor(duration: number, onComplete?: () => void) {
        this.duration = duration;
        this.onComplete = onComplete;
    }

    /**
     * Start the timer
     */
    start(): this {
        this.startTime = performance.now();
        this.elapsed = 0;
        this.running = true;
        return this;
    }

    /**
     * Stop the timer
     */
    stop(): this {
        this.running = false;
        return this;
    }

    /**
     * Reset the timer
     */
    reset(): this {
        this.elapsed = 0;
        this.startTime = performance.now();
        return this;
    }

    /**
     * Update the timer (call each frame)
     */
    update(deltaTime: number): boolean {
        if (!this.running) return false;

        this.elapsed += deltaTime;

        if (this.elapsed >= this.duration) {
            this.running = false;
            if (this.onComplete) this.onComplete();
            return true;
        }

        return false;
    }

    /**
     * Get remaining time
     */
    get remaining(): number {
        return Math.max(0, this.duration - this.elapsed);
    }

    /**
     * Get progress (0 to 1)
     */
    get progress(): number {
        return Math.min(1, this.elapsed / this.duration);
    }

    /**
     * Check if timer is complete
     */
    get isComplete(): boolean {
        return this.elapsed >= this.duration;
    }

    /**
     * Check if timer is running
     */
    get isRunning(): boolean {
        return this.running;
    }
}

/**
 * Delay - Promise-based delay utility
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Repeat - Run a callback at intervals
 */
export class Repeater {
    private intervalId: number | null = null;

    constructor(
        private readonly callback: () => void,
        private readonly intervalMs: number
    ) { }

    start(): this {
        if (this.intervalId !== null) return this;
        this.intervalId = window.setInterval(this.callback, this.intervalMs);
        return this;
    }

    stop(): this {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
        return this;
    }
}

/**
 * Cooldown - Track ability/action cooldowns
 */
export class Cooldown {
    private lastUseTime: number = -Infinity;

    constructor(readonly duration: number) { }

    /**
     * Try to use the cooldown. Returns true if available.
     */
    use(currentTime: number = performance.now() / 1000): boolean {
        if (this.isReady(currentTime)) {
            this.lastUseTime = currentTime;
            return true;
        }
        return false;
    }

    /**
     * Force reset the cooldown
     */
    reset(): void {
        this.lastUseTime = -Infinity;
    }

    /**
     * Check if cooldown is ready
     */
    isReady(currentTime: number = performance.now() / 1000): boolean {
        return currentTime - this.lastUseTime >= this.duration;
    }

    /**
     * Get remaining cooldown time
     */
    remaining(currentTime: number = performance.now() / 1000): number {
        return Math.max(0, this.duration - (currentTime - this.lastUseTime));
    }

    /**
     * Get progress (0 = just used, 1 = ready)
     */
    progress(currentTime: number = performance.now() / 1000): number {
        return Math.min(1, (currentTime - this.lastUseTime) / this.duration);
    }
}
