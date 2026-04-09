import {
  System,
  Entity,
  TransformComponent,
  RigidbodyComponent,
  ColliderComponent,
} from "@engine";
import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";

export class PhysicsSystem extends System {
  readonly priority = 10;
  private world: RAPIER.World | null = null;
  private eventQueue: RAPIER.EventQueue | null = null;
  private isInitialized = false;

  // Map to find entities from physics handles
  private colliderToEntity = new Map<number, number>();

  // Track active sensor triggers: Map<SensorEntityId, Set<CharacterEntityId>>
  public activeTriggers = new Map<number, Set<number>>();

  async initialize(): Promise<void> {
    await RAPIER.init();
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new RAPIER.World(gravity);
    this.eventQueue = new RAPIER.EventQueue(true);
    this.isInitialized = true;
    console.log("🛠️ PhysicsSystem: Rapier.js Core Online (Sensors Active)");
  }

  update(deltaTime: number, entities: Entity[]): void {
    if (!this.world || !this.eventQueue || !this.isInitialized) return;

    // 1. Sync Entities to Physics World
    for (const entity of entities) {
      const rbComp = entity.getComponent(RigidbodyComponent);
      const colComp = entity.getComponent(ColliderComponent);
      const transform = entity.getComponent(TransformComponent);

      if (!transform) continue;

      if (rbComp && !rbComp.handle) {
        this.createRigidBody(entity, rbComp, transform);
      }

      if (colComp && rbComp?.handle && !colComp.handle) {
        this.createCollider(entity, colComp, rbComp);
        this.colliderToEntity.set(colComp.handle!.handle, entity.id);
      }

      // Sync Kinematic
      if (
        rbComp?.handle &&
        (rbComp.bodyType === "kinematicPositionBased" ||
          rbComp.bodyType === "kinematicVelocityBased")
      ) {
        const q = new THREE.Quaternion().setFromEuler(transform.rotation);
        rbComp.handle.setNextKinematicTranslation({
          x: transform.position.x,
          y: transform.position.y,
          z: transform.position.z,
        });
        rbComp.handle.setNextKinematicRotation({
          x: q.x,
          y: q.y,
          z: q.z,
          w: q.w,
        });
      }
    }

    // 2. Step World
    const timestep = Math.min(deltaTime, 0.1);
    this.world.timestep = timestep;
    this.world.step(this.eventQueue);

    // 3. Handle Events
    this.eventQueue.drainCollisionEvents(
      (handle1: number, handle2: number, started: boolean) => {
        const entity1 = this.colliderToEntity.get(handle1);
        const entity2 = this.colliderToEntity.get(handle2);

        if (entity1 !== undefined && entity2 !== undefined) {
          // We don't know which one is the sensor yet, so we'll check both
          this.updateTrigger(entity1, entity2, started);
          this.updateTrigger(entity2, entity1, started);
        }
      },
    );

    // 4. Sync Transforms back
    for (const entity of entities) {
      const rbComp = entity.getComponent(RigidbodyComponent);
      const transform = entity.getComponent(TransformComponent);

      if (rbComp?.handle && transform && rbComp.bodyType === "dynamic") {
        const pos = rbComp.handle.translation();
        const rot = rbComp.handle.rotation();
        transform.position.set(pos.x, pos.y, pos.z);
        transform.rotation.setFromQuaternion(
          new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w),
        );
      }
    }
  }

  private updateTrigger(sensorId: number, visitorId: number, started: boolean) {
    // Check if sensorId is actually a sensor in a real race system,
    // but here we just track all sensor-collider pairs.
    if (started) {
      if (!this.activeTriggers.has(sensorId))
        this.activeTriggers.set(sensorId, new Set());
      this.activeTriggers.get(sensorId)!.add(visitorId);
    } else {
      this.activeTriggers.get(sensorId)?.delete(visitorId);
    }
  }

  private createRigidBody(
    entity: Entity,
    rbComp: RigidbodyComponent,
    transform: TransformComponent,
  ) {
    if (!this.world) return;
    let bodyType = RAPIER.RigidBodyType.Dynamic;
    if (rbComp.bodyType === "static") bodyType = RAPIER.RigidBodyType.Fixed;
    else if (rbComp.bodyType === "kinematicPositionBased")
      bodyType = RAPIER.RigidBodyType.KinematicPositionBased;
    else if (rbComp.bodyType === "kinematicVelocityBased")
      bodyType = RAPIER.RigidBodyType.KinematicVelocityBased;

    const rbDesc = new RAPIER.RigidBodyDesc(bodyType)
      .setTranslation(
        transform.position.x,
        transform.position.y,
        transform.position.z,
      )
      .setLinearDamping(rbComp.linearDamping)
      .setAngularDamping(rbComp.angularDamping);

    const q = new THREE.Quaternion().setFromEuler(transform.rotation);
    rbDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });

    rbComp.handle = this.world.createRigidBody(rbDesc);
  }

  private createCollider(
    entity: Entity,
    colComp: ColliderComponent,
    rbComp: RigidbodyComponent,
  ) {
    if (!this.world || !rbComp.handle) return;
    let colDesc = RAPIER.ColliderDesc.cuboid(
      colComp.size.x / 2,
      colComp.size.y / 2,
      colComp.size.z / 2,
    );
    if (colComp.shape === "sphere")
      colDesc = RAPIER.ColliderDesc.ball(colComp.radius);

    colDesc
      .setSensor(colComp.isSensor)
      .setRestitution(rbComp.restitution)
      .setFriction(rbComp.friction)
      .setTranslation(colComp.offset.x, colComp.offset.y, colComp.offset.z);

    colComp.handle = this.world.createCollider(colDesc, rbComp.handle);
  }

  destroy(): void {
    if (this.world) {
      this.world.free();
      this.world = null;
    }
  }
}
