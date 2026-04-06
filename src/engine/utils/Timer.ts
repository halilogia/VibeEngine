

export class Timer {
    
    private startTime: number = 0;

    readonly duration: number;

    private running: boolean = false;

    private elapsed: number = 0;

    onComplete?: () => void;

    constructor(duration: number, onComplete?: () => void) {
        this.duration = duration;
        this.onComplete = onComplete;
    }

    start(): this {
        this.startTime = performance.now();
        this.elapsed = 0;
        this.running = true;
        return this;
    }

    stop(): this {
        this.running = false;
        return this;
    }

    reset(): this {
        this.elapsed = 0;
        this.startTime = performance.now();
        return this;
    }

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

    get remaining(): number {
        return Math.max(0, this.duration - this.elapsed);
    }

    get progress(): number {
        return Math.min(1, this.elapsed / this.duration);
    }

    get isComplete(): boolean {
        return this.elapsed >= this.duration;
    }

    get isRunning(): boolean {
        return this.running;
    }
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

export class Cooldown {
    private lastUseTime: number = -Infinity;

    constructor(readonly duration: number) { }

    use(currentTime: number = performance.now() / 1000): boolean {
        if (this.isReady(currentTime)) {
            this.lastUseTime = currentTime;
            return true;
        }
        return false;
    }

    reset(): void {
        this.lastUseTime = -Infinity;
    }

    isReady(currentTime: number = performance.now() / 1000): boolean {
        return currentTime - this.lastUseTime >= this.duration;
    }

    remaining(currentTime: number = performance.now() / 1000): number {
        return Math.max(0, this.duration - (currentTime - this.lastUseTime));
    }

    progress(currentTime: number = performance.now() / 1000): number {
        return Math.min(1, (currentTime - this.lastUseTime) / this.duration);
    }
}
