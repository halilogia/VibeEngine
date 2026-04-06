

import { System } from '@engine';
import type { Entity } from '@engine';
import { AnimationComponent } from '@engine';

export class AnimationSystem extends System {
    readonly priority = 30; 
    readonly requiredComponents = [AnimationComponent];

    update(deltaTime: number, entities: Entity[]): void {
        for (const entity of entities) {
            const animation = entity.getComponent(AnimationComponent);
            if (animation?.mixer) {
                animation.update(deltaTime);
            }
        }
    }
}
