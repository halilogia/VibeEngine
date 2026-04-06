

import { Entity } from './Entity';
import type { ComponentClass } from './Component';

export class Scene {
    
    name: string;

    readonly root: Entity;

    private readonly entities: Set<Entity> = new Set();

    constructor(name: string = 'Scene') {
        this.name = name;
        this.root = new Entity('__SceneRoot__');
    }

    addEntity(entity: Entity): void {
        if (this.entities.has(entity)) return;

        this.entities.add(entity);
        this.root.addChild(entity);

        this.registerChildren(entity);
    }

    removeEntity(entity: Entity): void {
        if (!this.entities.has(entity)) return;

        this.unregisterChildren(entity);

        this.entities.delete(entity);
        this.root.removeChild(entity);
    }

    getAllEntities(): Entity[] {
        return Array.from(this.entities);
    }

    getEntitiesWithComponent<T extends ComponentClass>(type: T): Entity[] {
        return this.getAllEntities().filter(e => e.hasComponent(type) && e.activeInHierarchy);
    }

    getEntitiesWithComponents(...types: ComponentClass[]): Entity[] {
        return this.getAllEntities().filter(e => {
            if (!e.activeInHierarchy) return false;
            return types.every(type => e.hasComponent(type));
        });
    }

    getEntitiesWithTag(tag: string): Entity[] {
        return this.getAllEntities().filter(e => e.tags.has(tag) && e.activeInHierarchy);
    }

    findByName(name: string): Entity | null {
        for (const entity of this.entities) {
            if (entity.name === name) return entity;
        }
        return null;
    }

    clear(): void {
        for (const entity of [...this.entities]) {
            entity.destroy();
        }
        this.entities.clear();
    }

    get entityCount(): number {
        return this.entities.size;
    }

    private registerChildren(entity: Entity): void {
        for (const child of entity.children) {
            this.entities.add(child);
            this.registerChildren(child);
        }
    }

    private unregisterChildren(entity: Entity): void {
        for (const child of entity.children) {
            this.unregisterChildren(child);
            this.entities.delete(child);
        }
    }
}
