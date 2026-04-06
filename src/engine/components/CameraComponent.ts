import * as THREE from "three";
import { Component } from "@engine";
import { TransformComponent } from "./TransformComponent";
import type { Entity } from "@engine/core/Entity";

export interface CameraComponentOptions {
  fov?: number;
  near?: number;
  far?: number;
  isActive?: boolean;
}

export class CameraComponent extends Component {
  static readonly TYPE = "Camera";

  fov: number = 75;

  near: number = 0.1;

  far: number = 1000;

  isActive: boolean = true;

  followTarget: { entity: Entity; offset: THREE.Vector3 } | null = null;

  followSmoothing: number = 0.1;

  threeCamera: THREE.PerspectiveCamera | null = null;

  constructor(options: CameraComponentOptions = {}) {
    super();
    this.fov = options.fov ?? 75;
    this.near = options.near ?? 0.1;
    this.far = options.far ?? 1000;
    this.isActive = options.isActive ?? true;
  }

  setFollowTarget(
    entity: Entity,
    offset: THREE.Vector3 = new THREE.Vector3(0, 5, 10),
  ): this {
    this.followTarget = { entity, offset };
    return this;
  }

  clearFollowTarget(): this {
    this.followTarget = null;
    return this;
  }

  applyToCamera(camera: THREE.PerspectiveCamera): void {
    camera.fov = this.fov;
    camera.near = this.near;
    camera.far = this.far;
    camera.updateProjectionMatrix();
    this.threeCamera = camera;
  }

  syncFromTransform(): void {
    if (!this.threeCamera || !this.entity) return;

    const transform = this.entity.getComponent(TransformComponent);
    if (!transform) return;

    this.threeCamera.position.copy(transform.position);
    this.threeCamera.quaternion.copy(transform.quaternion);
  }

  updateFollow(deltaTime: number): void {
    if (!this.followTarget || !this.entity || !this.threeCamera) return;

    const targetTransform = this.followTarget.entity.getComponent(
      TransformComponent,
    );
    if (!targetTransform) return;

    const targetPos = targetTransform.position
      .clone()
      .add(this.followTarget.offset);

    const smoothing = 1 - Math.pow(this.followSmoothing, deltaTime * 60);
    this.threeCamera.position.lerp(targetPos, smoothing);

    this.threeCamera.lookAt(targetTransform.position);

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
      isActive: false,
    });
    cloned.followSmoothing = this.followSmoothing;
    return cloned;
  }
}