/**
 * PhysicsSystem - Simple physics and collision detection
 * Handles velocity-based movement and AABB/sphere collision.
 */

import { System } from '../core/System';
import type { Entity } from '../core/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { RigidbodyComponent } from '../components/RigidbodyComponent';
import { CollisionComponent } from '../components/CollisionComponent';

/**
 * PhysicsSystem - Manages spatial movement, force application, and collision detection.
 * It handles the integration of Rigidbody components for velocity-based movement 
 * and processes Collision components for interaction events.
 */
export class PhysicsSystem extends System {
    /** 
     * Priority is set to 20 to ensure physics runs after script logic (10)
     * but before the rendering system (99).
     */
    readonly priority = 20;

    /** 
     * Required components for an entity to be part of the physics update loop.
     * Note: Entities only need a Transform to be 'present', but need a 
     * Rigidbody or Collider to be 'active' in simulation.
     */
    readonly requiredComponents = [TransformComponent];

    /** Internal flat list of active colliders for the current frame's collision pass */
    private colliders: CollisionComponent[] = [];

    /** 
     * Tracks pairs of entities that were colliding in the previous frame.
     * Used to detect 'Enter' and 'Exit' states.
     */
    private readonly collidingPairs: Set<string> = new Set();

    /**
     * Main simulation step for the PhysicsSystem.
     * @param deltaTime - Time passed since the last frame (in seconds).
     * @param entities - Entities matching the requiredComponents filter.
     */
    update(deltaTime: number, entities: Entity[]): void {
        // Prepare a fresh list of colliders for this frame
        this.colliders = [];

        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent);
            if (!transform) continue;

            // Step 1: Apply Rigidbody dynamics (Gravity, Drag, Velocity)
            const rigidbody = entity.getComponent(RigidbodyComponent);
            if (rigidbody && !rigidbody.isKinematic) {
                this.applyPhysics(transform, rigidbody, deltaTime);
            }

            // Step 2: Collect active colliders for the global collision pass
            const collider = entity.getComponent(CollisionComponent);
            if (collider && collider.enabled) {
                this.colliders.push(collider);
            }
        }

        // Step 3: Run the O(n²) broad-phase collision detection
        this.checkCollisions();
    }

    /**
     * Integrates velocity and forces into the entity's transform.
     * @param transform - The target transform component.
     * @param rigidbody - The source rigidbody component.
     * @param deltaTime - Standard delta time.
     */
    private applyPhysics(
        transform: TransformComponent,
        rigidbody: RigidbodyComponent,
        deltaTime: number
    ): void {
        // Calculate the physical state for the current frame
        rigidbody.applyGravity(deltaTime);
        rigidbody.applyDrag(deltaTime);
        rigidbody.clampVelocity();

        // Integrate linear movement
        transform.position.add(
            rigidbody.velocity.clone().multiplyScalar(deltaTime)
        );

        // Integrate angular movement (Rotation)
        if (rigidbody.angularVelocity.lengthSq() > 0) {
            transform.rotation.x += rigidbody.angularVelocity.x * deltaTime;
            transform.rotation.y += rigidbody.angularVelocity.y * deltaTime;
            transform.rotation.z += rigidbody.angularVelocity.z * deltaTime;
            transform.quaternion.setFromEuler(transform.rotation);
        }
    }

    /**
     * Performs intersection tests between all registered colliders.
     * Fires onCollisionEnter/Exit and onTriggerEnter/Exit callbacks.
     */
    private checkCollisions(): void {
        const currentPairs = new Set<string>();

        // Broad phase: Iterate through all pairs of active colliders
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
                        // Triggers the initial collision event
                        this.onCollisionEnter(a, b);
                    }
                } else if (wasColliding) {
                    // Triggers the terminal collision event
                    this.onCollisionExit(a, b);
                }
            }
        }

        // Persist the state for the next frame's comparison
        this.collidingPairs.clear();
        currentPairs.forEach(pair => this.collidingPairs.add(pair));
    }

    /**
     * Internal handler for the start of a collision.
     */
    private onCollisionEnter(a: CollisionComponent, b: CollisionComponent): void {
        a.activeCollisions.add(b);
        b.activeCollisions.add(a);

        // Route to specific trigger or physical collision hooks
        if (a.isTrigger || b.isTrigger) {
            if (a.onTriggerEnter) a.onTriggerEnter(b);
            if (b.onTriggerEnter) b.onTriggerEnter(a);
        } else {
            if (a.onCollisionEnter) a.onCollisionEnter(b);
            if (b.onCollisionEnter) b.onCollisionEnter(a);
        }
    }

    /**
     * Internal handler for the end of a collision.
     */
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

    /**
     * Utility to create a deterministic string key for a pair of entities.
     */
    private getPairKey(a: CollisionComponent, b: CollisionComponent): string {
        const idA = a.entity?.id ?? 0;
        const idB = b.entity?.id ?? 0;
        return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
    }
}
