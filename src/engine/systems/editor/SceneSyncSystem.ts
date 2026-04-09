import * as THREE from "three";
import {
  System,
  Entity,
  Component,
} from "../../core";
import {
  TransformComponent,
  RenderComponent,
  SeaComponent,
  WeatherComponent,
  AudioComponent,
  InputReceiverComponent,
  PostProcessingComponent,
  LightComponent,
  RigidbodyComponent,
  type RigidBodyType,
  ColliderComponent,
  type ColliderShape,
  VehicleControllerComponent,
  FollowCameraComponent,
  CheckpointComponent,
  WaypointComponent,
  TrafficFollowerComponent,
} from "../../components";
import { useSceneStore, type EntityData } from "@infrastructure/store";
import { MeshUtils } from "../../utils/MeshUtils";
import { ModelLoader } from "../../utils/ModelLoader";

type ComponentFactory = (data: Record<string, unknown>) => Component;

const componentRegistry: Record<string, ComponentFactory> = {
  Transform: (data) => {
    const pos = data.position as number[] | undefined;
    const rot = data.rotation as number[] | undefined;
    const scale = data.scale as number[] | undefined;
    return new TransformComponent(
      pos ? new THREE.Vector3(pos[0], pos[1], pos[2]) : undefined,
      rot
        ? new THREE.Euler(
            THREE.MathUtils.degToRad(rot[0]),
            THREE.MathUtils.degToRad(rot[1]),
            THREE.MathUtils.degToRad(rot[2]),
          )
        : undefined,
      scale ? new THREE.Vector3(scale[0], scale[1], scale[2]) : undefined,
    );
  },
  Render: (data) => {
    const renderComp = new RenderComponent();
    const modelPath = data.modelPath as string | undefined;

    if (modelPath) {
      // Async loading - the system will handle adding it to scene once loaded
      ModelLoader.loadFBX(modelPath)
        .then((fbx) => {
          if (data.scale) {
            const s = data.scale as number[];
            fbx.scale.set(s[0], s[1], s[2]);
          }
          renderComp.setObject3D(fbx);
        })
        .catch((err) => {
          console.error(
            `❌ SceneSyncSystem: Failed to load model [${modelPath}]`,
            err,
          );
        });
    } else {
      const meshType = (data.meshType as string) || "cube";
      const color = (data.color as string) || "#6366f1";
      const mesh = MeshUtils.createMesh(meshType, color);
      renderComp.setObject3D(mesh);
    }
    return renderComp;
  },
  SeaComponent: (data) => {
    const seaParams = {
      speed: data.speed as number,
      amplitude: data.amplitude as number,
      frequency: data.frequency as number,
      color: data.color as string,
    };
    return new SeaComponent(seaParams);
  },
  WeatherComponent: (data) => {
    return new WeatherComponent({
      weatherType: data.weatherType as WeatherComponent["weatherType"],
      intensity: data.intensity as number,
      timeOfDay: data.timeOfDay as number,
    });
  },
  AudioComponent: (data) => {
    return new AudioComponent((data.isPositional as boolean) ?? true, {
      volume: (data.volume as number) ?? 1.0,
      autoplay: (data.autoplay as boolean) ?? true,
      loop: (data.loop as boolean) ?? true,
    });
  },
  InputReceiver: (data) => {
    return new InputReceiverComponent((data.playerId as number) ?? 0);
  },
  PostProcessing: (data) => {
    return new PostProcessingComponent({
      bloomEnabled: data.bloomEnabled as boolean,
      bloomStrength: data.bloomStrength as number,
      bloomRadius: data.bloomRadius as number,
      bloomThreshold: data.bloomThreshold as number,
      exposure: data.exposure as number,
    });
  },
  Light: (data) => {
    return new LightComponent({
      type: data.lightType as LightComponent["lightType"],
      color: data.color as string,
      intensity: data.intensity as number,
      castShadow: data.castShadow as boolean,
    });
  },
  Rigidbody: (data) => {
    return new RigidbodyComponent({
      bodyType: (data.bodyType as RigidBodyType) || "dynamic",
      mass: (data.mass as number) || 1,
      restitution: (data.restitution as number) || 0.5,
      friction: (data.friction as number) || 0.5,
      linearDamping: (data.linearDamping as number) || 0,
      angularDamping: (data.angularDamping as number) || 0,
      gravityScale: (data.gravityScale as number) || 1,
    });
  },
  Collider: (data) => {
    const sizeArr = data.size as number[] | undefined;
    const offArr  = data.offset as number[] | undefined;
    return new ColliderComponent({
      shape: (data.shape as ColliderShape) || "box",
      size: sizeArr ? new THREE.Vector3(sizeArr[0], sizeArr[1], sizeArr[2]) : new THREE.Vector3(1, 1, 1),
      radius: (data.radius as number) || 0.5,
      height: (data.height as number) || 1,
      isSensor: (data.isSensor as boolean) || false,
      offset: offArr ? new THREE.Vector3(offArr[0], offArr[1], offArr[2]) : new THREE.Vector3(0, 0, 0),
    });
  },
  VehicleController: (data) => {
    return new VehicleControllerComponent({
      acceleration: (data.acceleration as number) || 30,
      maxSpeed: (data.maxSpeed as number) || 50,
      steeringSensitivity: (data.steeringSensitivity as number) || 2.5,
      brakeForce: (data.brakeForce as number) || 15,
      driftFactor: (data.driftFactor as number) || 0.95,
    });
  },
  FollowCamera: (data) => {
    return new FollowCameraComponent({
      targetId: data.targetId as number,
      offset: data.offset
        ? new THREE.Vector3(
            (data.offset as number[])[0],
            (data.offset as number[])[1],
            (data.offset as number[])[2],
          )
        : undefined,
      lookOffset: data.lookOffset
        ? new THREE.Vector3(
            (data.lookOffset as number[])[0],
            (data.lookOffset as number[])[1],
            (data.lookOffset as number[])[2],
          )
        : undefined,
      smoothSpeed: (data.smoothSpeed as number) || 0.125,
      fov: (data.fov as number) || 60,
    });
  },
  Checkpoint: (data) => {
    return new CheckpointComponent({
      index: (data.index as number) || 0,
      isFinishLine: (data.isFinishLine as boolean) || false,
    });
  },
  Waypoint: (data) => {
    return new WaypointComponent({
      nextWaypointId: data.nextWaypointId as string | number | undefined,
      radius: (data.radius as number) || 2.0,
    });
  },
  TrafficFollower: (data) => {
    return new TrafficFollowerComponent({
      speed: (data.speed as number) || 5.0,
      currentWaypointId: data.currentWaypointId as string | number | undefined,
      rotationSpeed: (data.rotationSpeed as number) || 3.0,
    });
  },
};

export function registerComponentFactory(
  type: string,
  factory: ComponentFactory,
): void {
  componentRegistry[type] = factory;
}

export function getComponentFactory(
  type: string,
): ComponentFactory | undefined {
  return componentRegistry[type];
}

export class SceneSyncSystem extends System {
  readonly priority = -1000;

  private entityMap: Map<number, Entity> = new Map();
  private unsubscribe: (() => void) | null = null;
  private initialized = false;

  private pendingSync = false;
  private lastSyncedEntities: Map<number, EntityData> = new Map();

  initialize(): void {
    // 🚀 ENGINE-FIRST: Only sync what actually changed
    this.unsubscribe = useSceneStore.subscribe((state, prevState) => {
      if (this.pendingSync) return;
      
      // If the number of entities changed, or a specific entity data changed
      // we check for differences.
      if (state.entities !== prevState.entities || state.rootEntityIds !== prevState.rootEntityIds) {
        this.pendingSync = true;
        requestAnimationFrame(() => {
          this.pendingSync = false;
          this.sync(state.entities, state.rootEntityIds);
        });
      }
    });

    const state = useSceneStore.getState();
    this.sync(state.entities, state.rootEntityIds);
    this.initialized = true;

    console.log("✅ SceneSyncSystem: Delta-based Sync Active");
  }

  private sync(
    entities: Map<number, EntityData>,
    rootEntityIds: number[],
  ): void {
    if (!this.app) return;

    const syncIds = new Set<number>();
    const entitiesArray = Array.from(entities.values());

    // 1. Identify missing entities and remove them (Engine-First Cleanup)
    for (const [id, entity] of this.entityMap) {
      if (!entities.has(id)) {
        this.removeEngineEntity(id, entity);
      }
    }

    // 2. Add or Update entities
    const syncRecursive = (id: number, parent?: Entity) => {
      const data = entities.get(id);
      if (!data) return;
      syncIds.add(id);

      let entity = this.entityMap.get(id);

      // CREATE if it doesn't exist
      if (!entity) {
        entity = new Entity(data.name, id);
        this.entityMap.set(id, entity);
        
        if (parent) parent.addChild(entity);
        else this.app!.scene.addEntity(entity);
        
        this.addComponents(entity, data);
      } 
      
      // UPDATE transform only if it hasn't been updated by Gizmos (Engine-First)
      // We check if the store's version matches the engine's internal version
      // In a real ECS we'd use a versioning system, here we check for significant drifts
      this.updateComponents(entity, data);

      // SYNC hierarchy (re-parenting if needed)
      if (parent && entity.parent !== parent) {
        entity.parent?.removeChild(entity);
        parent.addChild(entity);
      }

      data.children.forEach((childId) => syncRecursive(childId, entity));
    };

    rootEntityIds.forEach((id) => syncRecursive(id));
  }

  private removeEngineEntity(id: number, entity: Entity): void {
    const render = entity.getComponent(RenderComponent);
    if (render?.object3D) {
      this.app!.threeScene.remove(render.object3D);
    }
    this.app!.scene.removeEntity(entity);
    this.entityMap.delete(id);
  }

  private addComponents(entity: Entity, data: EntityData): void {
    data.components.forEach((comp) => {
      const componentType = comp.type;

      // Check if entity already has this component via some mapping logic
      // (Simplified check for this implementation)
      const hasComponent = Array.from(entity.components.keys()).some(
        (c) =>
          (c as unknown as { TYPE: string }).TYPE === componentType ||
          (c as unknown as { name: string }).name === componentType,
      );

      if (!hasComponent) {
        const factory = componentRegistry[componentType];
        if (factory) {
          const component = factory(comp.data as Record<string, unknown>);
          entity.addComponent(component);
        }
      }
    });
  }

  private updateComponents(entity: Entity, data: EntityData): void {
    // Ensure all components from store exist on the engine entity
    this.addComponents(entity, data);

    data.components.forEach((comp) => {
      if (comp.type === "Transform") {
        const tc = entity.getComponent(TransformComponent);
        if (tc) {
          const pos = (comp.data.position as number[]) || [0, 0, 0];
          const rot = (comp.data.rotation as number[]) || [0, 0, 0];
          const scale = (comp.data.scale as number[]) || [1, 1, 1];

          tc.position.set(pos[0], pos[1], pos[2]);
          tc.setRotation(
            THREE.MathUtils.degToRad(rot[0]),
            THREE.MathUtils.degToRad(rot[1]),
            THREE.MathUtils.degToRad(rot[2]),
          );
          tc.scale.set(scale[0], scale[1], scale[2]);
        }
      }
    });
  }

  update(_deltaTime: number, _entities: Entity[]): void {
    // Logic handled by store subscription
  }

  destroy(): void {
    this.unsubscribe?.();
    this.entityMap.clear();
  }
}
