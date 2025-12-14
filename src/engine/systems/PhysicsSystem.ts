/**
 * PhysicsSystem - Simple physics and collision detection
 * Handles velocity-based movement and AABB/sphere collision.
 */

import { System } from '../core/System';
import type { Entity } from '../core/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { RigidbodyComponent } from '../components/RigidbodyComponent';
import { CollisionComponent } from '../components/CollisionComponent';

export class PhysicsSystem extends System {
    readonly priority = 20; // After scripts
    readonly requiredComponents = [TransformComponent];

    /** All collision components for broad phase */
    private colliders: CollisionComponent[] = [];

    /** Pairs that were colliding last frame */
    private readonly collidingPairs: Set<string> = new Set();

    update(deltaTime: number, entities: Entity[]): void {
        // Collect all colliders
        this.colliders = [];

        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent);
            if (!transform) continue;

            // Apply rigidbody physics if exists
            const rigidbody = entity.getComponent(RigidbodyComponent);
            if (rigidbody && !rigidbody.isKinematic) {
                this.applyPhysics(transform, rigidbody, deltaTime);
            }

            // Collect colliders
            const collider = entity.getComponent(CollisionComponent);
            if (collider && collider.enabled) {
                this.colliders.push(collider);
            }
        }

        // Check collisions
        this.checkCollisions();
    }

    private applyPhysics(
        transform: TransformComponent,
        rigidbody: RigidbodyComponent,
        deltaTime: number
    ): void {
        // Apply gravity
        rigidbody.applyGravity(deltaTime);

        // Apply drag
        rigidbody.applyDrag(deltaTime);

        // Clamp velocity
        rigidbody.clampVelocity();

        // Update position
        transform.position.add(
            rigidbody.velocity.clone().multiplyScalar(deltaTime)
        );

        // Update rotation from angular velocity
        if (rigidbody.angularVelocity.lengthSq() > 0) {
            transform.rotation.x += rigidbody.angularVelocity.x * deltaTime;
            transform.rotation.y += rigidbody.angularVelocity.y * deltaTime;
            transform.rotation.z += rigidbody.angularVelocity.z * deltaTime;
            transform.quaternion.setFromEuler(transform.rotation);
        }
    }

    private checkCollisions(): void {
        const currentPairs = new Set<string>();

        // O(n²) broad phase - fine for small numbers of colliders
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
                        // Collision started
                        this.onCollisionEnter(a, b);
                    }
                } else if (wasColliding) {
                    // Collision ended
                    this.onCollisionExit(a, b);
                }
            }
        }

        // Update collision state
        this.collidingPairs.clear();
        currentPairs.forEach(pair => this.collidingPairs.add(pair));
    }

    private onCollisionEnter(a: CollisionComponent, b: CollisionComponent): void {
        // Track active collisions
        a.activeCollisions.add(b);
        b.activeCollisions.add(a);

        // Fire callbacks
        if (a.isTrigger || b.isTrigger) {
            if (a.onTriggerEnter) a.onTriggerEnter(b);
            if (b.onTriggerEnter) b.onTriggerEnter(a);
        } else {
            if (a.onCollisionEnter) a.onCollisionEnter(b);
            if (b.onCollisionEnter) b.onCollisionEnter(a);
        }
    }

    private onCollisionExit(a: CollisionComponent, b: CollisionComponent): void {
        // Remove from active collisions
        a.activeCollisions.delete(b);
        b.activeCollisions.delete(a);

        // Fire callbacks
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
