/**
 * RigidbodyComponent - Simple physics/movement component
 * Handles velocity-based movement and basic physics.
 */

import * as THREE from 'three';
import { Component } from '@engine';

export class RigidbodyComponent extends Component {
    static readonly TYPE = 'Rigidbody';

    /** Velocity in units per second */
    readonly velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    /** Angular velocity (rotation speed) */
    readonly angularVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    /** Mass (affects physics calculations) */
    mass: number = 1;

    /** Linear drag (velocity reduction per second) */
    drag: number = 0;

    /** Angular drag */
    angularDrag: number = 0.05;

    /** Whether gravity affects this rigidbody */
    useGravity: boolean = true;

    /** Gravity value (usually negative Y) */
    gravity: THREE.Vector3 = new THREE.Vector3(0, -9.81, 0);

    /** Whether physics is frozen */
    isKinematic: boolean = false;

    /** Maximum velocity magnitude */
    maxSpeed: number = Infinity;

    /** Bounce factor (0 = no bounce, 1 = full bounce) */
    bounciness: number = 0;

    /** Friction coefficient */
    friction: number = 0.5;

    /**
     * Apply a force (affected by mass)
     */
    addForce(force: THREE.Vector3): this {
        if (this.isKinematic || this.mass <= 0) return this;

        // F = ma -> a = F/m -> v += a * dt (dt applied in PhysicsSystem)
        const acceleration = force.clone().divideScalar(this.mass);
        this.velocity.add(acceleration);
        return this;
    }

    /**
     * Apply an impulse (instant velocity change, affected by mass)
     */
    addImpulse(impulse: THREE.Vector3): this {
        if (this.isKinematic || this.mass <= 0) return this;

        this.velocity.add(impulse.clone().divideScalar(this.mass));
        return this;
    }

    /**
     * Set velocity directly
     */
    setVelocity(x: number, y: number, z: number): this {
        this.velocity.set(x, y, z);
        return this;
    }

    /**
     * Apply torque (rotation force)
     */
    addTorque(torque: THREE.Vector3): this {
        if (this.isKinematic) return this;
        this.angularVelocity.add(torque);
        return this;
    }

    /**
     * Stop all movement
     */
    stop(): this {
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        return this;
    }

    /**
     * Clamp velocity to max speed
     */
    clampVelocity(): void {
        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.maxSpeed);
        }
    }

    /**
     * Apply drag
     */
    applyDrag(deltaTime: number): void {
        if (this.drag > 0) {
            const factor = Math.max(0, 1 - this.drag * deltaTime);
            this.velocity.multiplyScalar(factor);
        }

        if (this.angularDrag > 0) {
            const factor = Math.max(0, 1 - this.angularDrag * deltaTime);
            this.angularVelocity.multiplyScalar(factor);
        }
    }

    /**
     * Apply gravity
     */
    applyGravity(deltaTime: number): void {
        if (this.useGravity && !this.isKinematic) {
            this.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));
        }
    }

    /**
     * Get speed (velocity magnitude)
     */
    get speed(): number {
        return this.velocity.length();
    }

    override clone(): RigidbodyComponent {
        const cloned = new RigidbodyComponent();
        cloned.velocity.copy(this.velocity);
        cloned.angularVelocity.copy(this.angularVelocity);
        cloned.mass = this.mass;
        cloned.drag = this.drag;
        cloned.angularDrag = this.angularDrag;
        cloned.useGravity = this.useGravity;
        cloned.gravity.copy(this.gravity);
        cloned.isKinematic = this.isKinematic;
        cloned.maxSpeed = this.maxSpeed;
        cloned.bounciness = this.bounciness;
        cloned.friction = this.friction;
        return cloned;
    }
}
