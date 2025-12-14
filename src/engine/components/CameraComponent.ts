/**
 * CameraComponent - Camera settings and behavior
 * Can be attached to an entity to make it a camera.
 */

import * as THREE from 'three';
import { Component } from '../core/Component';
import { TransformComponent } from './TransformComponent';

export interface CameraComponentOptions {
    fov?: number;
    near?: number;
    far?: number;
    isActive?: boolean;
}

export class CameraComponent extends Component {
    static readonly TYPE = 'Camera';

    /** Field of view in degrees */
    fov: number = 75;

    /** Near clipping plane */
    near: number = 0.1;

    /** Far clipping plane */
    far: number = 1000;

    /** Is this the active camera */
    isActive: boolean = true;

    /** Entity to follow (optional) */
    followTarget: { entity: any; offset: THREE.Vector3 } | null = null;

    /** Follow smoothing (0 = instant, 1 = no movement) */
    followSmoothing: number = 0.1;

    /** Three.js camera reference (set by system) */
    threeCamera: THREE.PerspectiveCamera | null = null;

    constructor(options: CameraComponentOptions = {}) {
        super();
        this.fov = options.fov ?? 75;
        this.near = options.near ?? 0.1;
        this.far = options.far ?? 1000;
        this.isActive = options.isActive ?? true;
    }

    /**
     * Configure as follow camera
     */
    setFollowTarget(entity: any, offset: THREE.Vector3 = new THREE.Vector3(0, 5, 10)): this {
        this.followTarget = { entity, offset };
        return this;
    }

    /**
     * Clear follow target
     */
    clearFollowTarget(): this {
        this.followTarget = null;
        return this;
    }

    /**
     * Update Three.js camera settings
     */
    applyToCamera(camera: THREE.PerspectiveCamera): void {
        camera.fov = this.fov;
        camera.near = this.near;
        camera.far = this.far;
        camera.updateProjectionMatrix();
        this.threeCamera = camera;
    }

    /**
     * Sync camera position from entity transform
     */
    syncFromTransform(): void {
        if (!this.threeCamera || !this.entity) return;

        const transform = this.entity.getComponent(TransformComponent);
        if (!transform) return;

        this.threeCamera.position.copy(transform.position);
        this.threeCamera.quaternion.copy(transform.quaternion);
    }

    /**
     * Update follow behavior
     */
    updateFollow(deltaTime: number): void {
        if (!this.followTarget || !this.entity || !this.threeCamera) return;

        const targetTransform = this.followTarget.entity.getComponent?.(TransformComponent);
        if (!targetTransform) return;

        // Calculate target camera position
        const targetPos = targetTransform.position.clone().add(this.followTarget.offset);

        // Smooth follow
        const smoothing = 1 - Math.pow(this.followSmoothing, deltaTime * 60);
        this.threeCamera.position.lerp(targetPos, smoothing);

        // Look at target
        this.threeCamera.lookAt(targetTransform.position);

        // Update entity transform to match camera
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            transform.position.copy(this.threeCamera.position);
            transform.quaternion.copy(this.threeCamera.quaternion);
            transform.rotation.setFromQuaternion(this.threeCamera.quaternion);
        }
    }

    override clone(): CameraComponent {
        const cloned = new CameraComponent({
            fov: this.fov,
            near: this.near,
            far: this.far,
            isActive: false, // Clone should not be active by default
        });
        cloned.followSmoothing = this.followSmoothing;
        return cloned;
    }
}
