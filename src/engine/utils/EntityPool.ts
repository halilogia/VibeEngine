/**
 * EntityPool - Object pool specifically for game entities
 * Manages entity lifecycle with Scene integration.
 */

import { Entity } from '../core/Entity';
import { Scene } from '../core/Scene';
import { TransformComponent } from '../components/TransformComponent';
import { ObjectPool } from './ObjectPool';
import * as THREE from 'three';

export interface PrefabFactory {
    (): Entity;
}

/**
 * Pool for a specific entity type (prefab)
 */
class PrefabPool {
    private pool: ObjectPool<Entity>;
    private scene: Scene;
    private activeEntities: Set<Entity> = new Set();

    constructor(factory: PrefabFactory, scene: Scene, initialSize: number = 10) {
        this.scene = scene;

        this.pool = new ObjectPool(
            factory,
            (entity: Entity) => {
                // Reset entity state
                entity.enabled = false;
                const transform = entity.getComponent(TransformComponent);
                if (transform) {
                    transform.position.set(0, -1000, 0); // Move offscreen
                    transform.rotation.set(0, 0, 0);
                    transform.scale.set(1, 1, 1);
                }
            },
            100
        );

        this.pool.prewarm(initialSize);
    }

    /**
     * Spawn an entity at position
     */
    spawn(position: THREE.Vector3 = new THREE.Vector3()): Entity {
        const entity = this.pool.acquire();
        entity.enabled = true;

        const transform = entity.getComponent(TransformComponent);
        if (transform) {
            transform.position.copy(position);
        }

        // Add to scene if not already
        this.scene.addEntity(entity);
        this.activeEntities.add(entity);

        return entity;
    }

    /**
     * Despawn an entity (return to pool)
     */
    despawn(entity: Entity): void {
        if (this.activeEntities.has(entity)) {
            this.activeEntities.delete(entity);
            this.scene.removeEntity(entity);
            this.pool.release(entity);
        }
    }

    /**
     * Despawn all active entities
     */
    despawnAll(): void {
        for (const entity of this.activeEntities) {
            this.scene.removeEntity(entity);
            this.pool.release(entity);
        }
        this.activeEntities.clear();
    }

    /**
     * Get active count
     */
    get activeCount(): number {
        return this.activeEntities.size;
    }

    /**
     * Get all active entities
     */
    getActive(): Entity[] {
        return Array.from(this.activeEntities);
    }
}

/**
 * EntityPool - Manages multiple prefab pools
 */
export class EntityPool {
    private pools: Map<string, PrefabPool> = new Map();
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * Register a prefab factory
     */
    register(name: string, factory: PrefabFactory, initialSize: number = 10): this {
        if (this.pools.has(name)) {
            console.warn(`Pool "${name}" already exists, overwriting`);
        }
        this.pools.set(name, new PrefabPool(factory, this.scene, initialSize));
        return this;
    }

    /**
     * Spawn an entity from a registered prefab
     */
    spawn(name: string, position?: THREE.Vector3): Entity | null {
        const pool = this.pools.get(name);
        if (!pool) {
            console.error(`Pool "${name}" not found. Did you register it?`);
            return null;
        }
        return pool.spawn(position);
    }

    /**
     * Spawn at specific coordinates
     */
    spawnAt(name: string, x: number, y: number, z: number): Entity | null {
        return this.spawn(name, new THREE.Vector3(x, y, z));
    }

    /**
     * Despawn an entity
     */
    despawn(name: string, entity: Entity): void {
        const pool = this.pools.get(name);
        if (pool) {
            pool.despawn(entity);
        }
    }

    /**
     * Despawn all entities of a type
     */
    despawnAll(name: string): void {
        const pool = this.pools.get(name);
        if (pool) {
            pool.despawnAll();
        }
    }

    /**
     * Despawn everything
     */
    clear(): void {
        for (const pool of this.pools.values()) {
            pool.despawnAll();
        }
    }

    /**
     * Get active count for a prefab type
     */
    getActiveCount(name: string): number {
        return this.pools.get(name)?.activeCount ?? 0;
    }

    /**
     * Get all active entities of a type
     */
    getActive(name: string): Entity[] {
        return this.pools.get(name)?.getActive() ?? [];
    }

    /**
     * Check if prefab is registered
     */
    has(name: string): boolean {
        return this.pools.has(name);
    }
}
