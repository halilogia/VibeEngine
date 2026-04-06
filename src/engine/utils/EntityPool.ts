

import { Entity } from '@engine';
import { Scene } from '@engine';
import { TransformComponent } from '@engine';
import { ObjectPool } from './ObjectPool';
import * as THREE from 'three';

export interface PrefabFactory {
    (): Entity;
}

class PrefabPool {
    private pool: ObjectPool<Entity>;
    private scene: Scene;
    private activeEntities: Set<Entity> = new Set();

    constructor(factory: PrefabFactory, scene: Scene, initialSize: number = 10) {
        this.scene = scene;

        this.pool = new ObjectPool(
            factory,
            (entity: Entity) => {
                
                entity.enabled = false;
                const transform = entity.getComponent(TransformComponent);
                if (transform) {
                    transform.position.set(0, -1000, 0); 
                    transform.rotation.set(0, 0, 0);
                    transform.scale.set(1, 1, 1);
                }
            },
            100
        );

        this.pool.prewarm(initialSize);
    }

    spawn(position: THREE.Vector3 = new THREE.Vector3()): Entity {
        const entity = this.pool.acquire();
        entity.enabled = true;

        const transform = entity.getComponent(TransformComponent);
        if (transform) {
            transform.position.copy(position);
        }

        this.scene.addEntity(entity);
        this.activeEntities.add(entity);

        return entity;
    }

    despawn(entity: Entity): void {
        if (this.activeEntities.has(entity)) {
            this.activeEntities.delete(entity);
            this.scene.removeEntity(entity);
            this.pool.release(entity);
        }
    }

    despawnAll(): void {
        for (const entity of this.activeEntities) {
            this.scene.removeEntity(entity);
            this.pool.release(entity);
        }
        this.activeEntities.clear();
    }

    get activeCount(): number {
        return this.activeEntities.size;
    }

    getActive(): Entity[] {
        return Array.from(this.activeEntities);
    }
}

export class EntityPool {
    private pools: Map<string, PrefabPool> = new Map();
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    register(name: string, factory: PrefabFactory, initialSize: number = 10): this {
        if (this.pools.has(name)) {
            console.warn(`Pool "${name}" already exists, overwriting`);
        }
        this.pools.set(name, new PrefabPool(factory, this.scene, initialSize));
        return this;
    }

    spawn(name: string, position?: THREE.Vector3): Entity | null {
        const pool = this.pools.get(name);
        if (!pool) {
            console.error(`Pool "${name}" not found. Did you register it?`);
            return null;
        }
        return pool.spawn(position);
    }

    spawnAt(name: string, x: number, y: number, z: number): Entity | null {
        return this.spawn(name, new THREE.Vector3(x, y, z));
    }

    despawn(name: string, entity: Entity): void {
        const pool = this.pools.get(name);
        if (pool) {
            pool.despawn(entity);
        }
    }

    despawnAll(name: string): void {
        const pool = this.pools.get(name);
        if (pool) {
            pool.despawnAll();
        }
    }

    clear(): void {
        for (const pool of this.pools.values()) {
            pool.despawnAll();
        }
    }

    getActiveCount(name: string): number {
        return this.pools.get(name)?.activeCount ?? 0;
    }

    getActive(name: string): Entity[] {
        return this.pools.get(name)?.getActive() ?? [];
    }

    has(name: string): boolean {
        return this.pools.has(name);
    }
}
