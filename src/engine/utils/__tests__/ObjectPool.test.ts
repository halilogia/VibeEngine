import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectPool } from '../ObjectPool';

describe('ObjectPool', () => {
    interface TestObj { id: number; active: boolean; }
    let idCounter = 0;
    const factory = () => ({ id: ++idCounter, active: true });
    const reset = (obj: TestObj) => { obj.active = false; };
    
    let pool: ObjectPool<TestObj>;

    beforeEach(() => {
        idCounter = 0;
        pool = new ObjectPool<TestObj>(factory, reset, 5);
    });

    it('should acquire new objects when pool is empty', () => {
        const obj = pool.acquire();
        expect(obj.id).toBe(1);
        expect(pool.active).toBe(1);
        expect(pool.available).toBe(0);
    });

    it('should reuse objects when released', () => {
        const obj1 = pool.acquire();
        pool.release(obj1);
        
        expect(obj1.active).toBe(false); // Reset called
        expect(pool.available).toBe(1);
        expect(pool.active).toBe(0);
        
        const obj2 = pool.acquire();
        expect(obj2).toBe(obj1); // Reused
        expect(pool.active).toBe(1);
    });

    it('should prewarm the pool', () => {
        pool.prewarm(3);
        expect(pool.available).toBe(3);
        expect(idCounter).toBe(3);
    });

    it('should respect maxSize', () => {
        pool = new ObjectPool<TestObj>(factory, reset, 2);
        const o1 = pool.acquire();
        const o2 = pool.acquire();
        const o3 = pool.acquire();
        
        pool.release(o1);
        pool.release(o2);
        pool.release(o3); // Should be discarded
        
        expect(pool.available).toBe(2);
    });

    it('should track stats correctly', () => {
        pool.prewarm(2);
        pool.acquire();
        
        expect(pool.stats).toEqual({
            available: 1,
            active: 1,
            maxSize: 5
        });
    });
});
