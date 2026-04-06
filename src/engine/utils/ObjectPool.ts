

export class ObjectPool<T> {
    private pool: T[] = [];
    private activeCount: number = 0;
    private readonly factory: () => T;
    private readonly reset: (item: T) => void;
    private readonly maxSize: number;

    constructor(
        factory: () => T,
        reset: (item: T) => void = () => { },
        maxSize: number = 100
    ) {
        this.factory = factory;
        this.reset = reset;
        this.maxSize = maxSize;
    }

    prewarm(count: number): this {
        const toCreate = Math.min(count, this.maxSize);
        for (let i = 0; i < toCreate; i++) {
            this.pool.push(this.factory());
        }
        return this;
    }

    acquire(): T {
        let item: T;

        if (this.pool.length > 0) {
            item = this.pool.pop()!;
        } else {
            item = this.factory();
        }

        this.activeCount++;
        return item;
    }

    release(item: T): void {
        if (this.pool.length < this.maxSize) {
            this.reset(item);
            this.pool.push(item);
        }
        this.activeCount = Math.max(0, this.activeCount - 1);
    }

    clear(): void {
        this.pool = [];
        this.activeCount = 0;
    }

    get stats(): { available: number; active: number; maxSize: number } {
        return {
            available: this.pool.length,
            active: this.activeCount,
            maxSize: this.maxSize
        };
    }

    get available(): number {
        return this.pool.length;
    }

    get active(): number {
        return this.activeCount;
    }
}
