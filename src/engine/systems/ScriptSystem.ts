

import { System } from '@engine';
import type { Entity } from '@engine';
import { ScriptComponent } from '@engine';

export class ScriptSystem extends System {
    
    readonly priority = 10;

    readonly requiredComponents = [ScriptComponent];

    private readonly startedEntities: Set<number> = new Set();

    update(deltaTime: number, entities: Entity[]): void {
        for (const entity of entities) {
            const scriptComponent = entity.getComponent(ScriptComponent);
            if (!scriptComponent) continue;

            scriptComponent.app = this.app;

            if (!this.startedEntities.has(entity.id)) {
                scriptComponent.startAll();
                this.startedEntities.add(entity.id);
            }

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

            scriptComponent.lateUpdateAll(deltaTime);
        }
    }

    reset(): void {
        this.startedEntities.clear();
    }
}
