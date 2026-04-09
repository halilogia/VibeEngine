import {
  useSceneStore,
  type EntityData,
  type ComponentData,
} from "@infrastructure/store";
export type { ComponentData } from "@infrastructure/store";

export interface SerializedScene {
  version: string;
  name: string;
  entities: SerializedEntity[];
}

export interface SerializedEntity {
  id: number;
  name: string;
  parentId: number | null;
  enabled: boolean;
  tags: string[];
  components: ComponentData[];
}

export function serializeScene(): string {
  const state = useSceneStore.getState();
  const data: SerializedScene = {
    version: "1.0.0",
    name: state.sceneName,
    entities: [],
  };

  state.entities.forEach((entity) => {
    data.entities.push({
      id: entity.id,
      name: entity.name,
      parentId: entity.parentId,
      enabled: entity.enabled,
      tags: [...entity.tags],
      components: entity.components.map((c) => ({
        type: c.type,
        data: { ...c.data },
        enabled: c.enabled,
      })),
    });
  });

  return JSON.stringify(data, null, 2);
}

export function deserializeScene(json: string): void {
  const raw = JSON.parse(json);
  const data: SerializedScene = {
    version: raw.version || "1.0.0",
    name: raw.name || raw.sceneName || "Imported Scene",
    entities: raw.entities || [],
  };
  const store = useSceneStore.getState();
  store.clear();
  useSceneStore.setState({ sceneName: data.name });

  const entityMap = new Map<number, EntityData>();

  for (const entity of data.entities) {
    const render = entity.components?.find((c: ComponentData) => c.type === "Render");
    const transform = entity.components?.find(
      (c: ComponentData) => c.type === "Transform",
    );

    if (render && render.data.meshType === "model") {
      const path = (render.data.modelPath as string) || "";
      if (path && path.endsWith("/")) {
        const baseName = entity.name.replace(/_\d+$/, "");
        render.data.modelPath =
          path + (baseName.endsWith(".glb") ? baseName : baseName + ".glb");
      }
    }

    const pId = entity.parentId;
    if (pId !== null && pId !== undefined && render && render.data.meshType === "model") {
      const parent = data.entities.find((e: SerializedEntity) => e.id === pId);
      const pRender = parent?.components?.find((c: ComponentData) => c.type === "Render");
      if (
        pRender &&
        pRender.data.meshType === "model" &&
        pRender.data.modelPath === render.data.modelPath
      ) {
        const pos = (transform?.data.position as number[]) || [0, 0, 0];
        if (pos[0] === 0 && pos[1] === 0 && pos[2] === 0) continue;
      }
    }

    const entityData: EntityData = {
      id: entity.id,
      name: entity.name,
      parentId: null,
      children: [],
      components: entity.components,
      enabled: entity.enabled,
      tags: entity.tags,
    };
    entityMap.set(entity.id, entityData);
  }

  const rootIds: number[] = [];
  for (const entity of data.entities) {
    const entityData = entityMap.get(entity.id);
    if (!entityData) continue;

    if (entity.parentId === null || entity.parentId === undefined) {
      rootIds.push(entity.id);
    } else {
      entityData.parentId = entity.parentId;
      const parent = entityMap.get(entity.parentId);
      if (parent) {
        parent.children.push(entity.id);
      } else {
        rootIds.push(entity.id);
      }
    }
  }

  useSceneStore.setState({
    entities: entityMap,
    rootEntityIds: rootIds,
    nextEntityId: data.entities.length > 0 ? Math.max(...data.entities.map((e) => e.id)) + 1 : 1,
    isDirty: false,
  });
}