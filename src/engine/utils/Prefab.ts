/**
 * Prefab - Reusable entity template system
 * Create entity templates that can be instantiated multiple times.
 * 
 * @example
 * const enemyPrefab = new Prefab('Enemy')
 *   .addComponent(TransformComponent)
 *   .addComponent(RenderComponent, mesh)
 *   .addComponentInstance(new CollisionComponent({ type: 'sphere' }));
 * 
 * const enemy1 = enemyPrefab.instantiate(scene);
 * const enemy2 = enemyPrefab.instantiate(scene);
 */

import { Entity } from '../core/Entity';
import type { Scene } from '../core/Scene';
import { Component, type ComponentClass } from '../core/Component';

type ComponentFactory<T extends Component> = () => T;

interface PrefabComponentEntry {
    factory: ComponentFactory<Component>;
}

export class Prefab {
    /** Prefab name */
    readonly name: string;

    /** Component factories */
    private readonly components: PrefabComponentEntry[] = [];

    /** Tags to add */
    private readonly tags: string[] = [];

    /** Child prefabs */
    private readonly children: Prefab[] = [];

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Add a component by class (will be instantiated with default constructor)
     */
    addComponent<T extends Component>(
        componentClass: new () => T
    ): this {
        this.components.push({
            factory: () => new componentClass(),
        });
        return this;
    }

    /**
     * Add a component with custom factory function
     */
    addComponentFactory<T extends Component>(
        factory: () => T
    ): this {
        this.components.push({ factory });
        return this;
    }

    /**
     * Add a pre-configured component instance (will be cloned)
     */
    addComponentInstance<T extends Component>(instance: T): this {
        this.components.push({
            factory: () => instance.clone(),
        });
        return this;
    }

    /**
     * Add a tag
     */
    addTag(tag: string): this {
        this.tags.push(tag);
        return this;
    }

    /**
     * Add a child prefab
     */
    addChild(prefab: Prefab): this {
        this.children.push(prefab);
        return this;
    }

    /**
     * Instantiate the prefab as a new entity
     */
    instantiate(scene?: Scene): Entity {
        const entity = new Entity(this.name);

        // Add components
        for (const entry of this.components) {
            const component = entry.factory();
            entity.addComponent(component);
        }

        // Add tags
        for (const tag of this.tags) {
            entity.tags.add(tag);
        }

        // Instantiate children
        for (const childPrefab of this.children) {
            const child = childPrefab.instantiate();
            entity.addChild(child);
        }

        // Add to scene if provided
        if (scene) {
            scene.addEntity(entity);
        }

        return entity;
    }

    /**
     * Create multiple instances
     */
    instantiateMany(count: number, scene?: Scene): Entity[] {
        const entities: Entity[] = [];
        for (let i = 0; i < count; i++) {
            entities.push(this.instantiate(scene));
        }
        return entities;
    }
}
