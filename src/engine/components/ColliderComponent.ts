import { Component } from "../core/Component";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

export type ColliderShape = "box" | "sphere" | "capsule" | "cylinder" | "mesh";

export class ColliderComponent extends Component {
  static readonly type = "ColliderComponent";

  public shape: ColliderShape = "box";
  public size: THREE.Vector3 = new THREE.Vector3(1, 1, 1);
  public radius: number = 0.5;
  public height: number = 1.0;
  public isSensor: boolean = false;
  public offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Runtime reference
  public handle: RAPIER.Collider | null = null;

  constructor(config: Partial<ColliderComponent> = {}) {
    super();
    Object.assign(this, config);
  }
}
