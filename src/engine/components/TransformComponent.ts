

import * as THREE from 'three';
import { Component } from '@engine';

export class TransformComponent extends Component {
    static readonly TYPE = 'Transform';

    readonly position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    readonly rotation: THREE.Euler = new THREE.Euler(0, 0, 0);

    readonly scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

    readonly quaternion: THREE.Quaternion = new THREE.Quaternion();

    readonly worldMatrix: THREE.Matrix4 = new THREE.Matrix4();

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

    setPosition(x: number, y: number, z: number): this {
        this.position.set(x, y, z);
        return this;
    }

    setRotation(x: number, y: number, z: number): this {
        this.rotation.set(x, y, z);
        this.quaternion.setFromEuler(this.rotation);
        return this;
    }

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

    translate(x: number, y: number, z: number): this {
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
        return this;
    }

    rotate(x: number, y: number, z: number): this {
        this.rotation.x += x;
        this.rotation.y += y;
        this.rotation.z += z;
        this.quaternion.setFromEuler(this.rotation);
        return this;
    }

    lookAt(target: THREE.Vector3): this {
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.lookAt(this.position, target, new THREE.Vector3(0, 1, 0));
        this.quaternion.setFromRotationMatrix(tempMatrix);
        this.rotation.setFromQuaternion(this.quaternion);
        return this;
    }

    getForward(): THREE.Vector3 {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.quaternion);
        return forward;
    }

    getRight(): THREE.Vector3 {
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(this.quaternion);
        return right;
    }

    getUp(): THREE.Vector3 {
        const up = new THREE.Vector3(0, 1, 0);
        up.applyQuaternion(this.quaternion);
        return up;
    }

    updateLocalMatrix(): void {
        this.quaternion.setFromEuler(this.rotation);
        this.localMatrix.compose(this.position, this.quaternion, this.scale);
    }

    updateWorldMatrix(): void {
        this.updateLocalMatrix();

        const parentTransform = this.entity?.parent?.getComponent(TransformComponent);

        if (parentTransform) {
            parentTransform.updateWorldMatrix();
            this.worldMatrix.multiplyMatrices(parentTransform.worldMatrix, this.localMatrix);
        } else {
            this.worldMatrix.copy(this.localMatrix);
        }
    }

    getWorldPosition(): THREE.Vector3 {
        this.updateWorldMatrix();
        const worldPos = new THREE.Vector3();
        worldPos.setFromMatrixPosition(this.worldMatrix);
        return worldPos;
    }

    override clone(): TransformComponent {
        const cloned = new TransformComponent();
        cloned.position.copy(this.position);
        cloned.rotation.copy(this.rotation);
        cloned.scale.copy(this.scale);
        cloned.quaternion.copy(this.quaternion);
        return cloned;
    }
}
