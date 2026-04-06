import { useSceneStore } from "@infrastructure/store/sceneStore";

export class NeuralContextService {
  static getSceneSnapshot(): string {
    const { entities, rootEntityIds } = useSceneStore.getState();
    const snapshot: unknown[] = [];

    const traverse = (id: number, depth = 0) => {
      const entity = entities.get(id);
      if (!entity) return;

      const transform =
        (entity.components.find((c) => c.type === "Transform")?.data as Record<string, unknown>) || {};
      const pos = ((transform.position as number[]) || [0, 0, 0]) as number[];

      snapshot.push({
        id: entity.id,
        name: entity.name,
        depth,
        pos: `[${pos[0]}, ${pos[1]}, ${pos[2]}]`,
        components: entity.components.map((c) => c.type),
      });

      entity.children.forEach((childId) => traverse(childId, depth + 1));
    };

    rootEntityIds.forEach((id) => traverse(id));

    return JSON.stringify(snapshot, null, 2);
  }

  static getAssetInventory(): string {
    const { assets } = useSceneStore.getState();

    const inventory = {
      scripts: assets.filter((a) => a.type === "script").map((a) => a.name),
      models: assets.filter((a) => a.type === "model").map((a) => a.name),
    };

    return JSON.stringify(inventory, null, 2);
  }

  static getFullContext(): string {
    const scene = this.getSceneSnapshot();
    const assets = this.getAssetInventory();
    const { selectedEntityId } = useSceneStore.getState();

    return `
--- SCENE CONTEXT (🏛️ VIBEENGINE SYSTEM SNAPSHOT) ---
ACTIVE_SELECTION_ID: ${selectedEntityId || "NONE"}
ENTITIES_IN_WORLD:
${scene}

AVAILABLE_ASSETS:
${assets}
-----------------------------------------------------
        `.trim();
  }
}
