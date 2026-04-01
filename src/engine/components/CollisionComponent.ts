/**
 * CollisionComponent - Collision bounds for physics/collision detection
 * Supports box, sphere, and capsule colliders.
 */

import * as THREE from 'three';
import { Component } from '@engine';
import { TransformComponent } from './TransformComponent';

export type ColliderType = 'box' | 'sphere' | 'capsule';

export interface CollisionComponentOptions {
    type?: ColliderType;
    size?: THREE.Vector3;
    radius?: number;
    height?: number;
    isTrigger?: boolean;
    layer?: number;
}

export class CollisionComponent extends Component {
    static readonly TYPE = 'Collision';

    /** Collider shape type */
    colliderType: ColliderType = 'box';

    /** Size for box collider */
    size: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

    /** Radius for sphere/capsule collider */
    radius: number = 0.5;

    /** Height for capsule collider */
    height: number = 1;

    /** Offset from entity position */
    offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    /** If true, triggers events but doesn't block movement */
    isTrigger: boolean = false;

    /** Collision layer (for filtering) */
    layer: number = 0;

    /** Collision mask (which layers to collide with) */
    mask: number = 0xFFFFFFFF; // All layers by default

    /** Callback when collision starts */
    onCollisionEnter?: (other: CollisionComponent) => void;

    /** Callback when collision ends */
    onCollisionExit?: (other: CollisionComponent) => void;

    /** Callback when trigger is entered */
    onTriggerEnter?: (other: CollisionComponent) => void;

    /** Callback when trigger is exited */
    onTriggerExit?: (other: CollisionComponent) => void;

    /** Currently colliding entities */
    readonly activeCollisions: Set<CollisionComponent> = new Set();

    constructor(options: CollisionComponentOptions = {}) {
        super();
        this.colliderType = options.type ?? 'box';
        if (options.size) this.size.copy(options.size);
        this.radius = options.radius ?? 0.5;
        this.height = options.height ?? 1;
        this.isTrigger = options.isTrigger ?? false;
        this.layer = options.layer ?? 0;
    }

    /**
     * Set as box collider
     */
    setBox(width: number, height: number, depth: number): this {
        this.colliderType = 'box';
        this.size.set(width, height, depth);
        return this;
    }

    /**
     * Set as sphere collider
     */
    setSphere(radius: number): this {
        this.colliderType = 'sphere';
        this.radius = radius;
        return this;
    }

    /**
     * Set as capsule collider
     */
    setCapsule(radius: number, height: number): this {
        this.colliderType = 'capsule';
        this.radius = radius;
        this.height = height;
        return this;
    }

    /**
     * Get world position of collider center
     */
    getWorldCenter(): THREE.Vector3 {
        if (!this.entity) return this.offset.clone();

        const transform = this.entity.getComponent(TransformComponent);
        if (!transform) return this.offset.clone();

        return transform.position.clone().add(this.offset);
    }

    /**
     * Get bounding box in world space
     */
    getWorldBoundingBox(): THREE.Box3 {
        const center = this.getWorldCenter();
        const halfSize = this.size.clone().multiplyScalar(0.5);

        // Apply scale from transform
        if (this.entity) {
            const transform = this.entity.getComponent(TransformComponent);
            if (transform) {
                halfSize.multiply(transform.scale);
            }
        }

        return new THREE.Box3(
            center.clone().sub(halfSize),
            center.clone().add(halfSize)
        );
    }

    /**
     * Get bounding sphere in world space
     */
    getWorldBoundingSphere(): THREE.Sphere {
        const center = this.getWorldCenter();
        let scaledRadius = this.radius;

        // Apply max scale component
        if (this.entity) {
            const transform = this.entity.getComponent(TransformComponent);
            if (transform) {
                scaledRadius *= Math.max(transform.scale.x, transform.scale.y, transform.scale.z);
            }
        }

        return new THREE.Sphere(center, scaledRadius);
    }

    /**
     * Check if this collider should interact with another (layer check)
     */
    canCollideWith(other: CollisionComponent): boolean {
        return (this.mask & (1 << other.layer)) !== 0 &&
            (other.mask & (1 << this.layer)) !== 0;
    }

    /**
     * Simple AABB vs AABB check
     */
    intersectsBox(other: CollisionComponent): boolean {
        const boxA = this.getWorldBoundingBox();
        const boxB = other.getWorldBoundingBox();
        return boxA.intersectsBox(boxB);
    }

    /**
     * Simple sphere vs sphere check
     */
    intersectsSphere(other: CollisionComponent): boolean {
        const sphereA = this.getWorldBoundingSphere();
        const sphereB = other.getWorldBoundingSphere();
        return sphereA.intersectsSphere(sphereB);
    }

    /**
     * Check intersection based on collider types
     */
    intersects(other: CollisionComponent): boolean {
        if (!this.canCollideWith(other)) return false;

        // Use sphere-sphere for performance when possible
        if (this.colliderType === 'sphere' && other.colliderType === 'sphere') {
            return this.intersectsSphere(other);
        }

        // Fall back to box-box (approximate)
        return this.intersectsBox(other);
    }

    override clone(): CollisionComponent {
        const cloned = new CollisionComponent({
            type: this.colliderType,
            size: this.size.clone(),
            radius: this.radius,
            height: this.height,
            isTrigger: this.isTrigger,
            layer: this.layer,
        });
        cloned.offset.copy(this.offset);
        cloned.mask = this.mask;
        return cloned;
    }
}
