/**
 * TransformComponent - Position, rotation, and scale in 3D space
 * Core component for any entity that exists in the world.
 */

import * as THREE from 'three';
import { Component } from '../core/Component';

export class TransformComponent extends Component {
    static readonly TYPE = 'Transform';

    /** Local position relative to parent */
    readonly position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    /** Local rotation (Euler angles) */
    readonly rotation: THREE.Euler = new THREE.Euler(0, 0, 0);

    /** Local scale */
    readonly scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

    /** Quaternion for rotation (auto-synced) */
    readonly quaternion: THREE.Quaternion = new THREE.Quaternion();

    /** World matrix (updated each frame) */
    readonly worldMatrix: THREE.Matrix4 = new THREE.Matrix4();

    /** Local matrix */
    readonly localMatrix: THREE.Matrix4 = new THREE.Matrix4();

    constructor(
        position?: THREE.Vector3,
        rotation?: THREE.Euler,
        scale?: THREE.Vector3
    ) {
        super();
        if (position) this.position.copy(position);
        if (rotation) this.rotation.copy(rotation);
        if (scale) this.scale.copy(scale);
    }

    /**
     * Set position from x, y, z values
     */
    setPosition(x: number, y: number, z: number): this {
        this.position.set(x, y, z);
        return this;
    }

    /**
     * Set rotation from x, y, z Euler angles (radians)
     */
    setRotation(x: number, y: number, z: number): this {
        this.rotation.set(x, y, z);
        this.quaternion.setFromEuler(this.rotation);
        return this;
    }

    /**
     * Set scale uniformly
     */
    setScale(s: number): this;
    setScale(x: number, y: number, z: number): this;
    setScale(x: number, y?: number, z?: number): this {
        if (y === undefined) {
            this.scale.set(x, x, x);
        } else {
            this.scale.set(x, y!, z!);
        }
        return this;
    }

    /**
     * Translate by delta
     */
    translate(x: number, y: number, z: number): this {
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
        return this;
    }

    /**
     * Rotate by delta (radians)
     */
    rotate(x: number, y: number, z: number): this {
        this.rotation.x += x;
        this.rotation.y += y;
        this.rotation.z += z;
        this.quaternion.setFromEuler(this.rotation);
        return this;
    }

    /**
     * Look at a target position
     */
    lookAt(target: THREE.Vector3): this {
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.lookAt(this.position, target, new THREE.Vector3(0, 1, 0));
        this.quaternion.setFromRotationMatrix(tempMatrix);
        this.rotation.setFromQuaternion(this.quaternion);
        return this;
    }

    /**
     * Get forward direction vector
     */
    getForward(): THREE.Vector3 {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.quaternion);
        return forward;
    }

    /**
     * Get right direction vector
     */
    getRight(): THREE.Vector3 {
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(this.quaternion);
        return right;
    }

    /**
     * Get up direction vector
     */
    getUp(): THREE.Vector3 {
        const up = new THREE.Vector3(0, 1, 0);
        up.applyQuaternion(this.quaternion);
        return up;
    }

    /**
     * Update local matrix from position/rotation/scale
     */
    updateLocalMatrix(): void {
        this.quaternion.setFromEuler(this.rotation);
        this.localMatrix.compose(this.position, this.quaternion, this.scale);
    }

    /**
     * Update world matrix (considers parent transform)
     */
    updateWorldMatrix(): void {
        this.updateLocalMatrix();

        // Get parent transform if exists
        const parentTransform = this.entity?.parent?.getComponent(TransformComponent);

        if (parentTransform) {
            parentTransform.updateWorldMatrix();
            this.worldMatrix.multiplyMatrices(parentTransform.worldMatrix, this.localMatrix);
        } else {
            this.worldMatrix.copy(this.localMatrix);
        }
    }

    /**
     * Get world position
     */
    getWorldPosition(): THREE.Vector3 {
        this.updateWorldMatrix();
        const worldPos = new THREE.Vector3();
        worldPos.setFromMatrixPosition(this.worldMatrix);
        return worldPos;
    }

    /**
     * Clone this transform
     */
    override clone(): TransformComponent {
        const cloned = new TransformComponent();
        cloned.position.copy(this.position);
        cloned.rotation.copy(this.rotation);
        cloned.scale.copy(this.scale);
        cloned.quaternion.copy(this.quaternion);
        return cloned;
    }
}
