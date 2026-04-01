/**
 * ScriptSystem - Executes scripts attached to entities
 * Calls initialize, start, update, and lateUpdate on scripts.
 */

import { System } from '@engine';
import type { Entity } from '@engine';
import { ScriptComponent } from '@engine';

/**
 * ScriptSystem - Orchestrates the execution of user-defined logic.
 * It manages the lifecycle of ScriptComponents, ensuring that start hooks 
 * fire once and update hooks run every frame in the correct order.
 */
export class ScriptSystem extends System {
    /** 
     * Priority is set to 10 to ensure scripts run early,
     * allowing them to set state for physics (20) and rendering (99).
     */
    readonly priority = 10;

    /** Required components for an entity to have its scripts executed. */
    readonly requiredComponents = [ScriptComponent];

    /** Track which entities have already had their 'start' methods invoked. */
    private readonly startedEntities: Set<number> = new Set();

    /**
     * Standard update loop for scripts.
     * @param deltaTime - Time passed since the last frame.
     * @param entities - Entities matching the requiredComponents filter.
     */
    update(deltaTime: number, entities: Entity[]): void {
        for (const entity of entities) {
            const scriptComponent = entity.getComponent(ScriptComponent);
            if (!scriptComponent) continue;

            // Inject current app reference into the component for global access
            scriptComponent.app = this.app;

            // Trigger the 'start' lifecycle hook only once per entity
            if (!this.startedEntities.has(entity.id)) {
                scriptComponent.startAll();
                this.startedEntities.add(entity.id);
            }

            // Standard frame update
            scriptComponent.updateAll(deltaTime);
        }
    }

    /**
     * Executes the lateUpdate hook for all active entities.
     * Guaranteed to run after ALL system update() calls have completed.
     * @param deltaTime - Standard delta time.
     */
    postUpdate(deltaTime: number): void {
        if (!this.app) return;

        const entities = this.app.scene.getAllEntities();

        for (const entity of entities) {
            if (!entity.activeInHierarchy) continue;

            const scriptComponent = entity.getComponent(ScriptComponent);
            if (!scriptComponent) continue;

            // Late update for post-process logic (e.g., camera following)
            scriptComponent.lateUpdateAll(deltaTime);
        }
    }

    /**
     * Resets the system's internal state.
     * Essential for scene reloading to ensure 'start' hooks fire again.
     */
    reset(): void {
        this.startedEntities.clear();
    }
}
