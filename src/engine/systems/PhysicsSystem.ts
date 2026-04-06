

import { System } from '@engine';
import type { Entity } from '@engine';
import { TransformComponent } from '@engine';
import { RigidbodyComponent } from '@engine';
import { CollisionComponent } from '@engine';

export class PhysicsSystem extends System {
    
    readonly priority = 20;

    readonly requiredComponents = [TransformComponent];

    private colliders: CollisionComponent[] = [];

    private readonly collidingPairs: Set<string> = new Set();

    update(deltaTime: number, entities: Entity[]): void {
        
        this.colliders = [];

        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent);
            if (!transform) continue;

            const rigidbody = entity.getComponent(RigidbodyComponent);
            if (rigidbody && !rigidbody.isKinematic) {
                this.applyPhysics(transform, rigidbody, deltaTime);
            }

            const collider = entity.getComponent(CollisionComponent);
            if (collider && collider.enabled) {
                this.colliders.push(collider);
            }
        }

        this.checkCollisions();
    }

    private applyPhysics(
        transform: TransformComponent,
        rigidbody: RigidbodyComponent,
        deltaTime: number
    ): void {
        
        rigidbody.applyGravity(deltaTime);
        rigidbody.applyDrag(deltaTime);
        rigidbody.clampVelocity();

        transform.position.add(
            rigidbody.velocity.clone().multiplyScalar(deltaTime)
        );

        if (rigidbody.angularVelocity.lengthSq() > 0) {
            transform.rotation.x += rigidbody.angularVelocity.x * deltaTime;
            transform.rotation.y += rigidbody.angularVelocity.y * deltaTime;
            transform.rotation.z += rigidbody.angularVelocity.z * deltaTime;
            transform.quaternion.setFromEuler(transform.rotation);
        }
    }

    private checkCollisions(): void {
        const currentPairs = new Set<string>();

        for (let i = 0; i < this.colliders.length; i++) {
            for (let j = i + 1; j < this.colliders.length; j++) {
                const a = this.colliders[i];
                const b = this.colliders[j];

                if (!a.entity || !b.entity) continue;

                const pairKey = this.getPairKey(a, b);
                const wasColliding = this.collidingPairs.has(pairKey);
                const isColliding = a.intersects(b);

                if (isColliding) {
                    currentPairs.add(pairKey);

                    if (!wasColliding) {
                        
                        this.onCollisionEnter(a, b);
                    }
                } else if (wasColliding) {
                    
                    this.onCollisionExit(a, b);
                }
            }
        }

        this.collidingPairs.clear();
        currentPairs.forEach(pair => this.collidingPairs.add(pair));
    }

    private onCollisionEnter(a: CollisionComponent, b: CollisionComponent): void {
        a.activeCollisions.add(b);
        b.activeCollisions.add(a);

        if (a.isTrigger || b.isTrigger) {
            if (a.onTriggerEnter) a.onTriggerEnter(b);
            if (b.onTriggerEnter) b.onTriggerEnter(a);
        } else {
            if (a.onCollisionEnter) a.onCollisionEnter(b);
            if (b.onCollisionEnter) b.onCollisionEnter(a);
        }
    }

    private onCollisionExit(a: CollisionComponent, b: CollisionComponent): void {
        a.activeCollisions.delete(b);
        b.activeCollisions.delete(a);

        if (a.isTrigger || b.isTrigger) {
            if (a.onTriggerExit) a.onTriggerExit(b);
            if (b.onTriggerExit) b.onTriggerExit(a);
        } else {
            if (a.onCollisionExit) a.onCollisionExit(b);
            if (b.onCollisionExit) b.onCollisionExit(a);
        }
    }

    private getPairKey(a: CollisionComponent, b: CollisionComponent): string {
        const idA = a.entity?.id ?? 0;
        const idB = b.entity?.id ?? 0;
        return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
    }
}
