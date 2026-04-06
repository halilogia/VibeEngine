

import * as THREE from 'three';
import { Component } from '@engine';

export class RigidbodyComponent extends Component {
    static readonly TYPE = 'Rigidbody';

    readonly velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    readonly angularVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    mass: number = 1;

    drag: number = 0;

    angularDrag: number = 0.05;

    useGravity: boolean = true;

    gravity: THREE.Vector3 = new THREE.Vector3(0, -9.81, 0);

    isKinematic: boolean = false;

    maxSpeed: number = Infinity;

    bounciness: number = 0;

    friction: number = 0.5;

    addForce(force: THREE.Vector3): this {
        if (this.isKinematic || this.mass <= 0) return this;

        const acceleration = force.clone().divideScalar(this.mass);
        this.velocity.add(acceleration);
        return this;
    }

    addImpulse(impulse: THREE.Vector3): this {
        if (this.isKinematic || this.mass <= 0) return this;

        this.velocity.add(impulse.clone().divideScalar(this.mass));
        return this;
    }

    setVelocity(x: number, y: number, z: number): this {
        this.velocity.set(x, y, z);
        return this;
    }

    addTorque(torque: THREE.Vector3): this {
        if (this.isKinematic) return this;
        this.angularVelocity.add(torque);
        return this;
    }

    stop(): this {
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        return this;
    }

    clampVelocity(): void {
        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.maxSpeed);
        }
    }

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

    applyGravity(deltaTime: number): void {
        if (this.useGravity && !this.isKinematic) {
            this.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));
        }
    }

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
