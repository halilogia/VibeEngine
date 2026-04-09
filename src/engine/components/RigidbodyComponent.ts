import { Component } from "../core/Component";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

export type RigidBodyType = "dynamic" | "static" | "kinematicPositionBased" | "kinematicVelocityBased";

export class RigidbodyComponent extends Component {
  static readonly type = "RigidbodyComponent";

  public bodyType: RigidBodyType = "dynamic";
  public mass: number = 1;
  public restitution: number = 0.5;
  public friction: number = 0.5;
  public linearDamping: number = 0.0;
  public angularDamping: number = 0.0;
  public lockRotation: boolean = false;
  public gravityScale: number = 1.0;

  // Runtime reference
  public handle: RAPIER.RigidBody | null = null;

  constructor(config: Partial<RigidbodyComponent> = {}) {
    super();
    Object.assign(this, config);
  }

  public applyImpulse(impulse: { x: number; y: number; z: number }, wakeUp: boolean = true): void {
    if (this.handle) {
      this.handle.applyImpulse(impulse, wakeUp);
    }
  }

  public applyTorqueImpulse(torque: { x: number; y: number; z: number }, wakeUp: boolean = true): void {
    if (this.handle) {
      this.handle.applyTorqueImpulse(torque, wakeUp);
    }
  }

  public getVelocity(): RAPIER.Vector {
    return this.handle ? this.handle.linvel() : { x: 0, y: 0, z: 0 };
  }
}
