import * as THREE from "three";
import { Component } from "../core/Component";

export class TransformComponent extends Component {
    static override readonly TYPE = "Transform";

    readonly position: THREE.Vector3 = new THREE.Vector3();
    readonly rotation: THREE.Euler = new THREE.Euler();
    readonly scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

    readonly localMatrix: THREE.Matrix4 = new THREE.Matrix4();

    constructor(
        position?: THREE.Vector3,
        rotation?: THREE.Euler,
        scale?: THREE.Vector3,
    ) {
        super();
        if (position) this.position.copy(position);
        if (rotation) this.rotation.copy(rotation);
        if (scale) this.scale.copy(scale);
    }

    setPosition(x: number, y: number, z: number): void {
        this.position.set(x, y, z);
    }

    setRotation(x: number, y: number, z: number): void {
        this.rotation.set(x, y, z);
    }

    setScale(x: number, y: number, z: number): void {
        this.scale.set(x, y, z);
    }

    translate(x: number, y: number, z: number): void {
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
    }

    rotate(x: number, y: number, z: number): void {
        this.rotation.x += x;
        this.rotation.y += y;
        this.rotation.z += z;
    }

    get quaternion(): THREE.Quaternion {
        return new THREE.Quaternion().setFromEuler(this.rotation);
    }

    setQuaternion(q: THREE.Quaternion): void {
        this.rotation.setFromQuaternion(q);
    }

    getWorldPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    getForward(): THREE.Vector3 {
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyEuler(this.rotation);
        return forward;
    }

    updateMatrix(): void {
        this.localMatrix.compose(
            this.position,
            this.quaternion,
            this.scale,
        );
    }

    updateLocalMatrix(): void {
        this.updateMatrix();
    }
}