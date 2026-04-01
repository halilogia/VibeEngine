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
    /** Unique identifier for the entity */
    readonly id: number;

    /** Human-readable name used in the editor hierarchy */
    name: string;

    /** Internal enabled state */
    private _enabled: boolean = true;

    /** Parent entity in the scene hierarchy. Null if this is a root entity. */
    parent: Entity | null = null;

    /** List of direct child entities */
    readonly children: Entity[] = [];

    /** Map of attached components, keyed by their unique type string */
    private readonly components: Map<string, Component> = new Map();

    /** Set of strings used for identifying groups of entities (e.g., 'Player', 'Enemy') */
    readonly tags: Set<string> = new Set();

    /**
     * Creates a new Entity instance.
     * @param name - The initial name of the entity. Defaults to 'Entity'.
     */
    constructor(name: string = 'Entity') {
        this.id = ++entityIdCounter;
        this.name = name;
    }

    /**
     * Gets or sets the enabled state of the entity.
     * When disabled, the entity and its components are ignored by systems.
     */
    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled === value) return;
        this._enabled = value;

        // Notify components of the state change
        this.components.forEach(component => {
            if (value && component.onEnable) component.onEnable();
            if (!value && component.onDisable) component.onDisable();
        });
    }

    /**
     * Checks if the entity is active in the global hierarchy.
     * Returns true only if this entity and all its ancestors are enabled.
     */
    get activeInHierarchy(): boolean {
        if (!this._enabled) return false;
        if (this.parent) return this.parent.activeInHierarchy;
        return true;
    }

    // ============ COMPONENT MANAGEMENT ============

    /**
     * Adds a component to this entity. If a component of the same type already exists, it will be replaced.
     * @param component - The component instance to add.
     * @returns The added component instance.
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
     * Retrieves a component of the specified class from the entity.
     * @param type - The class of the component to retrieve.
     * @returns The component instance if found, or null otherwise.
     */
    getComponent<T extends Component>(type: ComponentClass<T>): T | null {
        return (this.components.get(type.TYPE) as T) ?? null;
    }

    /**
     * Checks if the entity has a component of the specified class.
     * @param type - The class of the component to check for.
     * @returns True if the component exists, false otherwise.
     */
    hasComponent(type: ComponentClass): boolean {
        return this.components.has(type.TYPE);
    }

    /**
     * Removes a component of the specified class from the entity.
     * @param type - The class of the component to remove.
     * @returns True if the component was found and removed, false otherwise.
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
     * Returns an array of all components currently attached to this entity.
     */
    getAllComponents(): Component[] {
        return Array.from(this.components.values());
    }

    // ============ HIERARCHY MANAGEMENT ============

    /**
     * Sets another entity as a child of this entity.
     * Handles removal from the previous parent automatically.
     * @param entity - The entity to add as a child.
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
     * Removes a child entity from this entity's hierarchy.
     * @param entity - The child entity to remove.
     * @returns True if the entity was a child and was successfully removed.
     */
    removeChild(entity: Entity): boolean {
        const index = this.children.indexOf(entity);
        if (index === -1) return false;

        this.children.splice(index, 1);
        entity.parent = null;
        return true;
    }

    /**
     * Recursively searches for an entity with the given name in the hierarchy.
     * @param name - The name of the entity to find.
     * @returns The found entity or null.
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
     * Recursively searches for the first entity with the given tag in the hierarchy.
     * @param tag - The tag to search for.
     * @returns The first matching entity or null.
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
     * Recursively searches for all entities with the given tag in the hierarchy.
     * @param tag - The tag to search for.
     * @returns An array of matching entities.
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
     * Completely destroys the entity, its components, and all its children.
     * This triggers onDestroy hooks for all attached components.
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
     * Creates a deep copy of the entity, including all components, tags, and children.
     * @param newName - Optional new name for the cloned entity. Defaults to original + '_clone'.
     * @returns A new Entity instance that is a deep clone of this one.
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
