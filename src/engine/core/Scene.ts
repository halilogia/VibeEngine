/**
 * Scene - Container for entities and scene graph management
 * Acts as the root of the entity hierarchy.
 */

import { Entity } from './Entity';
import type { ComponentClass } from './Component';

export class Scene {
    /** Scene name */
    name: string;

    /** Root entity (invisible parent of all scene entities) */
    readonly root: Entity;

    /** All entities in the scene (flat list for quick iteration) */
    private readonly entities: Set<Entity> = new Set();

    constructor(name: string = 'Scene') {
        this.name = name;
        this.root = new Entity('__SceneRoot__');
    }

    /**
     * Add an entity to the scene
     */
    addEntity(entity: Entity): void {
        if (this.entities.has(entity)) return;

        this.entities.add(entity);
        this.root.addChild(entity);

        // Also add all children
        this.registerChildren(entity);
    }

    /**
     * Remove an entity from the scene
     */
    removeEntity(entity: Entity): void {
        if (!this.entities.has(entity)) return;

        // Remove all children first
        this.unregisterChildren(entity);

        this.entities.delete(entity);
        this.root.removeChild(entity);
    }

    /**
     * Get all entities in scene (flat list)
     */
    getAllEntities(): Entity[] {
        return Array.from(this.entities);
    }

    /**
     * Get all entities with specific component
     */
    getEntitiesWithComponent<T extends ComponentClass>(type: T): Entity[] {
        return this.getAllEntities().filter(e => e.hasComponent(type) && e.activeInHierarchy);
    }

    /**
     * Get all entities with specific components (AND logic)
     */
    getEntitiesWithComponents(...types: ComponentClass[]): Entity[] {
        return this.getAllEntities().filter(e => {
            if (!e.activeInHierarchy) return false;
            return types.every(type => e.hasComponent(type));
        });
    }

    /**
     * Get all entities with tag
     */
    getEntitiesWithTag(tag: string): Entity[] {
        return this.getAllEntities().filter(e => e.tags.has(tag) && e.activeInHierarchy);
    }

    /**
     * Find entity by name
     */
    findByName(name: string): Entity | null {
        for (const entity of this.entities) {
            if (entity.name === name) return entity;
        }
        return null;
    }

    /**
     * Destroy all entities in scene
     */
    clear(): void {
        for (const entity of [...this.entities]) {
            entity.destroy();
        }
        this.entities.clear();
    }

    /**
     * Get entity count
     */
    get entityCount(): number {
        return this.entities.size;
    }

    // ============ PRIVATE ============

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
