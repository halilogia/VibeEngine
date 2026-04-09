import { Component } from "../core/Component";
import * as THREE from "three";

export interface FollowCameraOptions {
  targetId?: number;
  offset?: THREE.Vector3;
  lookOffset?: THREE.Vector3;
  smoothSpeed?: number;
  rotationSmoothSpeed?: number;
  fov?: number;
}

export class FollowCameraComponent extends Component {
  static readonly type = "FollowCameraComponent";

  public targetId: number | null = null;
  public offset: THREE.Vector3 = new THREE.Vector3(0, 5, 10);
  public lookOffset: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
  public smoothSpeed: number = 0.125;
  public rotationSmoothSpeed: number = 0.1;
  public fov: number = 60;

  constructor(options: FollowCameraOptions = {}) {
    super();
    if (options.targetId !== undefined) this.targetId = options.targetId;
    if (options.offset) this.offset.copy(options.offset);
    if (options.lookOffset) this.lookOffset.copy(options.lookOffset);
    if (options.smoothSpeed !== undefined) this.smoothSpeed = options.smoothSpeed;
    if (options.rotationSmoothSpeed !== undefined) this.rotationSmoothSpeed = options.rotationSmoothSpeed;
    if (options.fov !== undefined) this.fov = options.fov;
  }
}
