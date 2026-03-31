/**
 * ObjectPool - Generic object pooling for performance
 * Reuses objects instead of creating/destroying them.
 */

/**
 * Generic object pool
 */
export class ObjectPool<T> {
    private pool: T[] = [];
    private activeCount: number = 0;
    private readonly factory: () => T;
    private readonly reset: (item: T) => void;
    private readonly maxSize: number;

    /**
     * Create a new object pool
     * @param factory - Function to create new objects
     * @param reset - Function to reset object state when released
     * @param maxSize - Maximum pool size (default: 100)
     */
    constructor(
        factory: () => T,
        reset: (item: T) => void = () => { },
        maxSize: number = 100
    ) {
        this.factory = factory;
        this.reset = reset;
        this.maxSize = maxSize;
    }

    /**
     * Pre-warm the pool with objects
     */
    prewarm(count: number): this {
        const toCreate = Math.min(count, this.maxSize);
        for (let i = 0; i < toCreate; i++) {
            this.pool.push(this.factory());
        }
        return this;
    }

    /**
     * Acquire an object from the pool
     * Creates a new one if pool is empty
     */
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

    /**
     * Release an object back to the pool
     */
    release(item: T): void {
        if (this.pool.length < this.maxSize) {
            this.reset(item);
            this.pool.push(item);
        }
        this.activeCount = Math.max(0, this.activeCount - 1);
    }

    /**
     * Release all active objects (requires tracking externally)
     */
    clear(): void {
        this.pool = [];
        this.activeCount = 0;
    }

    /**
     * Get pool statistics
     */
    get stats(): { available: number; active: number; maxSize: number } {
        return {
            available: this.pool.length,
            active: this.activeCount,
            maxSize: this.maxSize
        };
    }

    /**
     * Get available count
     */
    get available(): number {
        return this.pool.length;
    }

    /**
     * Get active count
     */
    get active(): number {
        return this.activeCount;
    }
}
