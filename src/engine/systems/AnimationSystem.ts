/**
 * AnimationSystem - Updates animation mixers for all entities
 */

import { System } from '../core/System';
import type { Entity } from '../core/Entity';
import { AnimationComponent } from '../components/AnimationComponent';

export class AnimationSystem extends System {
    readonly priority = 30; // After physics
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
