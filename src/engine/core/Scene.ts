/**
 * Scene - Container for entities and scene graph management
 * Acts as the root of the entity hierarchy.
 */

import { Entity } from './Entity';
import type { ComponentClass } from './Component';

export class Scene {
    /** Human-readable name for the scene */
    name: string;

    /** Root entity acting as the top-level parent for all entities in the scene hierarchy */
    readonly root: Entity;

    /** Flat storage of all entities in the scene for high-performance iteration and querying */
    private readonly entities: Set<Entity> = new Set();

    /**
     * Creates a new Scene instance.
     * @param name - Initial name for the scene. Defaults to 'Scene'.
     */
    constructor(name: string = 'Scene') {
        this.name = name;
        this.root = new Entity('__SceneRoot__');
    }

    /**
     * Adds an entity to the scene. The entity is automatically parented to the root.
     * All children of the entity are also recursively registered.
     * @param entity - The entity instance to add.
     */
    addEntity(entity: Entity): void {
        if (this.entities.has(entity)) return;

        this.entities.add(entity);
        this.root.addChild(entity);

        // Also add all children
        this.registerChildren(entity);
    }

    /**
     * Removes an entity from the scene and its internal flat list.
     * Children are also recursively unregistered.
     * @param entity - The entity instance to remove.
     */
    removeEntity(entity: Entity): void {
        if (!this.entities.has(entity)) return;

        // Remove all children first
        this.unregisterChildren(entity);

        this.entities.delete(entity);
        this.root.removeChild(entity);
    }

    /**
     * Returns a flat array of all entities currently registered in the scene.
     */
    getAllEntities(): Entity[] {
        return Array.from(this.entities);
    }

    /**
     * Queries all active entities that possess a specific component type.
     * @param type - The component class to search for.
     * @returns An array of matching entities.
     */
    getEntitiesWithComponent<T extends ComponentClass>(type: T): Entity[] {
        return this.getAllEntities().filter(e => e.hasComponent(type) && e.activeInHierarchy);
    }

    /**
     * Queries all active entities that possess a set of specified component types.
     * @param types - Variadic list of component classes (AND logic).
     * @returns An array of matching entities.
     */
    getEntitiesWithComponents(...types: ComponentClass[]): Entity[] {
        return this.getAllEntities().filter(e => {
            if (!e.activeInHierarchy) return false;
            return types.every(type => e.hasComponent(type));
        });
    }

    /**
     * Queries all active entities that possess a specific tag.
     * @param tag - The tag string to search for.
     * @returns An array of matching entities.
     */
    getEntitiesWithTag(tag: string): Entity[] {
        return this.getAllEntities().filter(e => e.tags.has(tag) && e.activeInHierarchy);
    }

    /**
     * Finds the first entity with the specified name in the scene.
     * @param name - The name to search for.
     * @returns The entity instance or null if not found.
     */
    findByName(name: string): Entity | null {
        for (const entity of this.entities) {
            if (entity.name === name) return entity;
        }
        return null;
    }

    /**
     * Destroys all entities in the scene and clears internal storage.
     */
    clear(): void {
        for (const entity of [...this.entities]) {
            entity.destroy();
        }
        this.entities.clear();
    }

    /**
     * Returns the total number of entities registered in the scene.
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
