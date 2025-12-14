/**
 * ScriptSystem - Executes scripts attached to entities
 * Calls initialize, start, update, and lateUpdate on scripts.
 */

import { System } from '../core/System';
import type { Entity } from '../core/Entity';
import { ScriptComponent } from '../components/ScriptComponent';

export class ScriptSystem extends System {
    readonly priority = 10; // After input, before physics
    readonly requiredComponents = [ScriptComponent];

    /** Track which entities have been started */
    private readonly startedEntities: Set<number> = new Set();

    update(deltaTime: number, entities: Entity[]): void {
        for (const entity of entities) {
            const scriptComponent = entity.getComponent(ScriptComponent);
            if (!scriptComponent) continue;

            // Set app reference
            scriptComponent.app = this.app;

            // Call start once
            if (!this.startedEntities.has(entity.id)) {
                scriptComponent.startAll();
                this.startedEntities.add(entity.id);
            }

            // Call update
            scriptComponent.updateAll(deltaTime);
        }
    }

    postUpdate(deltaTime: number): void {
        if (!this.app) return;

        const entities = this.app.scene.getAllEntities();

        for (const entity of entities) {
            if (!entity.activeInHierarchy) continue;

            const scriptComponent = entity.getComponent(ScriptComponent);
            if (!scriptComponent) continue;

            // Call late update
            scriptComponent.lateUpdateAll(deltaTime);
        }
    }

    /**
     * Reset started tracking (for scene reload)
     */
    reset(): void {
        this.startedEntities.clear();
    }
}
