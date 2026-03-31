/**
 * System - Base class for all systems in the ECS
 * Systems contain LOGIC that operates on entities with specific components.
 * 
 * @example
 * class MovementSystem extends System {
 *   readonly requiredComponents = [TransformComponent, RigidbodyComponent];
 *   
 *   update(deltaTime: number, entities: Entity[]): void {
 *     for (const entity of entities) {
 *       const transform = entity.getComponent(TransformComponent)!;
 *       const rigidbody = entity.getComponent(RigidbodyComponent)!;
 *       transform.position.add(rigidbody.velocity.clone().multiplyScalar(deltaTime));
 *     }
 *   }
 * }
 */

import type { Entity } from './Entity';
import type { ComponentClass } from './Component';
import type { Application } from './Application';

export abstract class System {
    /** Reference to the application */
    app: Application | null = null;

    /** 
     * Execution priority (lower = earlier)
     * 0-10: Input/Early systems
     * 10-50: Game logic
     * 50-90: Physics, collision
     * 90-100: Rendering (last)
     */
    readonly priority: number = 50;

    /** Whether this system is enabled */
    enabled: boolean = true;

    /** 
     * Component types required for an entity to be processed by this system.
     * Override in subclass to filter entities.
     */
    readonly requiredComponents: ComponentClass[] = [];

    /**
     * Called once when system is added to application
     */
    initialize?(): void;

    /**
     * Called every frame with matching entities
     * @param deltaTime Time since last frame in seconds
     * @param entities Entities that have all required components
     */
    abstract update(deltaTime: number, entities: Entity[]): void;

    /**
     * Called after update, for cleanup or post-processing
     */
    postUpdate?(deltaTime: number): void;

    /**
     * Called when system is removed
     */
    destroy?(): void;

    /**
     * Filter entities that have all required components
     */
    filterEntities(allEntities: Entity[]): Entity[] {
        if (this.requiredComponents.length === 0) {
            return allEntities;
        }

        return allEntities.filter(entity => {
            if (!entity.activeInHierarchy) return false;
            return this.requiredComponents.every(type => entity.hasComponent(type));
        });
    }
}
