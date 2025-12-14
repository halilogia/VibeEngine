/**
 * Entity - Core building block of the ECS
 * Entities are containers for components and can form hierarchies.
 * 
 * @example
 * const player = new Entity('Player');
 * player.addComponent(new TransformComponent());
 * player.addComponent(new RenderComponent(mesh));
 * scene.addEntity(player);
 */

import { Component, type ComponentClass } from './Component';

let entityIdCounter = 0;

export class Entity {
    /** Unique identifier */
    readonly id: number;

    /** Human-readable name */
    name: string;

    /** Whether entity is active in scene */
    private _enabled: boolean = true;

    /** Parent entity (null if root) */
    parent: Entity | null = null;

    /** Child entities */
    readonly children: Entity[] = [];

    /** Attached components by type */
    private readonly components: Map<string, Component> = new Map();

    /** Tags for filtering/querying */
    readonly tags: Set<string> = new Set();

    constructor(name: string = 'Entity') {
        this.id = ++entityIdCounter;
        this.name = name;
    }

    /**
     * Whether this entity is enabled
     */
    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled === value) return;
        this._enabled = value;

        // Notify components
        this.components.forEach(component => {
            if (value && component.onEnable) component.onEnable();
            if (!value && component.onDisable) component.onDisable();
        });
    }

    /**
     * Check if entity is active (enabled and all parents enabled)
     */
    get activeInHierarchy(): boolean {
        if (!this._enabled) return false;
        if (this.parent) return this.parent.activeInHierarchy;
        return true;
    }

    // ============ COMPONENT MANAGEMENT ============

    /**
     * Add a component to this entity
     * @returns The added component
     */
    addComponent<T extends Component>(component: T): T {
        const type = component.type;

        if (this.components.has(type)) {
            console.warn(`Entity "${this.name}" already has component "${type}". Replacing.`);
            this.removeComponent(component.constructor as ComponentClass);
        }

        component.entity = this;
        this.components.set(type, component);

        if (component.onAttach) component.onAttach();
        if (this._enabled && component.onEnable) component.onEnable();

        return component;
    }

    /**
     * Get a component by type
     */
    getComponent<T extends Component>(type: ComponentClass<T>): T | null {
        return (this.components.get(type.TYPE) as T) ?? null;
    }

    /**
     * Check if entity has a component
     */
    hasComponent(type: ComponentClass): boolean {
        return this.components.has(type.TYPE);
    }

    /**
     * Remove a component by type
     */
    removeComponent(type: ComponentClass): boolean {
        const component = this.components.get(type.TYPE);
        if (!component) return false;

        if (component.onDisable) component.onDisable();
        if (component.onDetach) component.onDetach();

        component.entity = null;
        return this.components.delete(type.TYPE);
    }

    /**
     * Get all components
     */
    getAllComponents(): Component[] {
        return Array.from(this.components.values());
    }

    // ============ HIERARCHY MANAGEMENT ============

    /**
     * Add a child entity
     */
    addChild(entity: Entity): void {
        if (entity.parent === this) return;

        // Remove from previous parent
        if (entity.parent) {
            entity.parent.removeChild(entity);
        }

        entity.parent = this;
        this.children.push(entity);
    }

    /**
     * Remove a child entity
     */
    removeChild(entity: Entity): boolean {
        const index = this.children.indexOf(entity);
        if (index === -1) return false;

        this.children.splice(index, 1);
        entity.parent = null;
        return true;
    }

    /**
     * Find child by name (recursive)
     */
    findByName(name: string): Entity | null {
        if (this.name === name) return this;

        for (const child of this.children) {
            const found = child.findByName(name);
            if (found) return found;
        }

        return null;
    }

    /**
     * Find child by tag
     */
    findByTag(tag: string): Entity | null {
        if (this.tags.has(tag)) return this;

        for (const child of this.children) {
            const found = child.findByTag(tag);
            if (found) return found;
        }

        return null;
    }

    /**
     * Get all entities with tag (recursive)
     */
    findAllByTag(tag: string): Entity[] {
        const result: Entity[] = [];

        if (this.tags.has(tag)) result.push(this);

        for (const child of this.children) {
            result.push(...child.findAllByTag(tag));
        }

        return result;
    }

    // ============ LIFECYCLE ============

    /**
     * Destroy this entity and all children
     */
    destroy(): void {
        // Destroy children first
        for (const child of [...this.children]) {
            child.destroy();
        }

        // Remove from parent
        if (this.parent) {
            this.parent.removeChild(this);
        }

        // Destroy components
        this.components.forEach(component => {
            if (component.onDisable) component.onDisable();
            if (component.onDestroy) component.onDestroy();
            component.entity = null;
        });

        this.components.clear();
        this.children.length = 0;
    }

    /**
     * Clone this entity (deep clone with all components and children)
     */
    clone(newName?: string): Entity {
        const cloned = new Entity(newName ?? `${this.name}_clone`);

        // Clone components
        this.components.forEach(component => {
            cloned.addComponent(component.clone());
        });

        // Clone tags
        this.tags.forEach(tag => cloned.tags.add(tag));

        // Clone children
        for (const child of this.children) {
            cloned.addChild(child.clone());
        }

        return cloned;
    }
}
