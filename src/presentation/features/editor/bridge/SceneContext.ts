import { useSceneStore, type EntityData } from "@infrastructure/store";
import { COMPONENT_REGISTRY } from "./ComponentRegistry";
import { SCRIPT_REGISTRY } from "./ScriptRegistry";

export class SceneContext {
  static getFullContext(): string {
    const sceneData = this.serializeScene();
    const capabilities = this.getEngineCapabilities();

    return JSON.stringify(
      {
        scene: sceneData,
        engine: capabilities,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  static serializeScene(): unknown {
    const store = useSceneStore.getState();
    const rootEntities = store.rootEntityIds
      .map((id) => store.entities.get(id))
      .filter(Boolean) as EntityData[];

    return {
      name: store.sceneName,
      entities: rootEntities.map((entity) =>
        this.serializeEntity(entity, store.entities),
      ),
    };
  }

  private static serializeEntity(
    entity: EntityData,
    allEntities: Map<number, EntityData>,
  ): unknown {
    return {
      id: entity.id,
      name: entity.name,
      enabled: entity.enabled,
      components: entity.components.map((c) => ({
        type: c.type,
        data: c.data,
      })),
      children: entity.children
        .map((childId) => allEntities.get(childId))
        .filter(Boolean)
        .map((child) => this.serializeEntity(child as EntityData, allEntities)),
    };
  }

  static getEngineCapabilities(): unknown {
    return {
      availableComponents: COMPONENT_REGISTRY.map((c) => ({
        type: c.type,
        properties: c.properties.map((p) => ({
          name: p.name,
          type: p.type,
          options: p.options,
        })),
      })),
      availableScripts: SCRIPT_REGISTRY.map((s) => ({
        name: s.name,
        description: s.description,
        properties: s.properties,
      })),
      availablePrefabs: [
        "PirateShip",
        "PlayerCharacter",
        "OceanTile",
        "Island",
        "LightSun",
      ],
      availableMeshes: ["cube", "sphere", "cylinder", "plane", "capsule"],
      availableMaterials: ["standard"],
    };
  }

  static destroy(): void {
    console.log("🧹 SceneContext: Cleanup completed");
  }
}

export const syncSceneContext = () => {
  (window as unknown as { VibeContext: unknown }).VibeContext = {
    getScene: () => SceneContext.serializeScene(),
    getCapabilities: () => SceneContext.getEngineCapabilities(),
    getPromptContext: () => SceneContext.getFullContext(),
  };
};
