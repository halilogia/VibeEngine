

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

    colliderType: ColliderType = 'box';

    size: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

    radius: number = 0.5;

    height: number = 1;

    offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    isTrigger: boolean = false;

    layer: number = 0;

    mask: number = 0xFFFFFFFF; 

    onCollisionEnter?: (other: CollisionComponent) => void;

    onCollisionExit?: (other: CollisionComponent) => void;

    onTriggerEnter?: (other: CollisionComponent) => void;

    onTriggerExit?: (other: CollisionComponent) => void;

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

    setBox(width: number, height: number, depth: number): this {
        this.colliderType = 'box';
        this.size.set(width, height, depth);
        return this;
    }

    setSphere(radius: number): this {
        this.colliderType = 'sphere';
        this.radius = radius;
        return this;
    }

    setCapsule(radius: number, height: number): this {
        this.colliderType = 'capsule';
        this.radius = radius;
        this.height = height;
        return this;
    }

    getWorldCenter(): THREE.Vector3 {
        if (!this.entity) return this.offset.clone();

        const transform = this.entity.getComponent(TransformComponent);
        if (!transform) return this.offset.clone();

        return transform.position.clone().add(this.offset);
    }

    getWorldBoundingBox(): THREE.Box3 {
        const center = this.getWorldCenter();
        const halfSize = this.size.clone().multiplyScalar(0.5);

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

    getWorldBoundingSphere(): THREE.Sphere {
        const center = this.getWorldCenter();
        let scaledRadius = this.radius;

        if (this.entity) {
            const transform = this.entity.getComponent(TransformComponent);
            if (transform) {
                scaledRadius *= Math.max(transform.scale.x, transform.scale.y, transform.scale.z);
            }
        }

        return new THREE.Sphere(center, scaledRadius);
    }

    canCollideWith(other: CollisionComponent): boolean {
        return (this.mask & (1 << other.layer)) !== 0 &&
            (other.mask & (1 << this.layer)) !== 0;
    }

    intersectsBox(other: CollisionComponent): boolean {
        const boxA = this.getWorldBoundingBox();
        const boxB = other.getWorldBoundingBox();
        return boxA.intersectsBox(boxB);
    }

    intersectsSphere(other: CollisionComponent): boolean {
        const sphereA = this.getWorldBoundingSphere();
        const sphereB = other.getWorldBoundingSphere();
        return sphereA.intersectsSphere(sphereB);
    }

    intersects(other: CollisionComponent): boolean {
        if (!this.canCollideWith(other)) return false;

        if (this.colliderType === 'sphere' && other.colliderType === 'sphere') {
            return this.intersectsSphere(other);
        }

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
