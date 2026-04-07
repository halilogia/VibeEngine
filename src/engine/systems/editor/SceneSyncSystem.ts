import * as THREE from "three";
import { System, Entity, TransformComponent, RenderComponent, Component, SeaComponent, WeatherComponent, AudioComponent, InputReceiverComponent, PostProcessingComponent, LightComponent } from "@engine";
import { useSceneStore, type EntityData } from "@infrastructure/store";
import { MeshUtils } from "../../utils/MeshUtils";

type ComponentFactory = (data: Record<string, unknown>) => Component;

const componentRegistry: Record<string, ComponentFactory> = {
  Transform: (data) => {
    const pos = data.position as number[] | undefined;
    const rot = data.rotation as number[] | undefined;
    const scale = data.scale as number[] | undefined;
    return new TransformComponent(
      pos ? new THREE.Vector3(pos[0], pos[1], pos[2]) : undefined,
      rot ? new THREE.Euler(
        THREE.MathUtils.degToRad(rot[0]),
        THREE.MathUtils.degToRad(rot[1]),
        THREE.MathUtils.degToRad(rot[2])
      ) : undefined,
      scale ? new THREE.Vector3(scale[0], scale[1], scale[2]) : undefined,
    );
  },
  Render: (data) => {
    const meshType = (data.meshType as string) || "cube";
    const color = (data.color as string) || "#6366f1";
    const mesh = MeshUtils.createMesh(meshType, color);
    return new RenderComponent(mesh);
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
    return new AudioComponent(data.isPositional as boolean ?? true, {
        volume: data.volume as number ?? 1.0,
        autoplay: data.autoplay as boolean ?? true,
        loop: data.loop as boolean ?? true,
    });
  },
  InputReceiver: (data) => {
      return new InputReceiverComponent(data.playerId as number ?? 0);
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
  }
};

export function registerComponentFactory(
  type: string,
  factory: ComponentFactory,
): void {
  componentRegistry[type] = factory;
}

export function getComponentFactory(type: string): ComponentFactory | undefined {
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
    this.unsubscribe = useSceneStore.subscribe((state) => {
      if (this.pendingSync) return;
      this.pendingSync = true;

      requestAnimationFrame(() => {
        this.pendingSync = false;
        this.sync(state.entities, state.rootEntityIds);
      });
    });

    const state = useSceneStore.getState();
    this.sync(state.entities, state.rootEntityIds);
    this.initialized = true;

    console.log("✅ SceneSyncSystem: Unity-style bridge established");
  }

  forceSync(): void {
    const state = useSceneStore.getState();
    this.sync(state.entities, state.rootEntityIds);
  }

  private sync(
    entities: Map<number, EntityData>,
    rootEntityIds: number[],
  ): void {
    if (!this.app) return;

    const syncIds = new Set<number>();

    const syncRecursive = (id: number, parent?: Entity) => {
      const data = entities.get(id);
      if (!data) return;
      syncIds.add(id);

      let entity = this.entityMap.get(id);

      if (!entity) {
        entity = new Entity(data.name, id);
        this.entityMap.set(id, entity);

        if (parent) parent.addChild(entity);
        else this.app!.scene.addEntity(entity);
        this.addComponents(entity, data);
      }

      this.updateComponents(entity, data);

      data.children.forEach((childId) => syncRecursive(childId, entity));
    };

    rootEntityIds.forEach((id) => syncRecursive(id));

    for (const [id, entity] of this.entityMap) {
      if (!syncIds.has(id)) {
        const render = entity.getComponent(RenderComponent);
        if (render?.object3D) {
          this.app!.threeScene.remove(render.object3D);
        }
        this.app!.scene.removeEntity(entity);
        this.entityMap.delete(id);
        console.log(
          `[SceneSyncSystem] Removed entity ${entity.name} (${id}) from scene`,
        );
      }
    }
  }

  private addComponents(entity: Entity, data: EntityData): void {
    data.components.forEach((comp) => {
      const factory = componentRegistry[comp.type];
      if (factory) {
        const component = factory(comp.data as Record<string, unknown>);
        entity.addComponent(component);
      }
    });
  }

  private updateComponents(entity: Entity, data: EntityData): void {
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