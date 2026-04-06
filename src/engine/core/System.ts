

import type { Entity } from './Entity';
import type { ComponentClass } from './Component';
import type { Application } from './Application';

export abstract class System {
    
    app: Application | null = null;

    readonly priority: number = 50;

    enabled: boolean = true;

    readonly requiredComponents: ComponentClass[] = [];

    initialize?(): void;

    abstract update(deltaTime: number, entities: Entity[]): void;

    postUpdate?(deltaTime: number): void;

    destroy?(): void;

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
