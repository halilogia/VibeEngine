import {
  useSceneStore,
  type EntityData,
  type ComponentData,
  useProjectStore,
} from "@infrastructure/store";
import { ProjectScanner } from "@infrastructure/services/ProjectScanner";

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
    if (
      pId !== null &&
      pId !== undefined &&
      render &&
      render.data.meshType === "model"
    ) {
      const parent = data.entities.find((e: SerializedEntity) => e.id === pId);
      const pRender = parent?.components?.find((c: ComponentData) => c.type === "Render");
      if (
        pRender &&
        pRender.data.meshType === "model" &&
        pRender.data.modelPath === render.data.modelPath
      ) {
        const pos = (transform?.data.position as number[]) || [0, 0, 0];
        if (pos[0] === 0 && pos[1] === 0 && pos[2] === 0) {
          continue;
        }
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
    nextEntityId: Math.max(...data.entities.map((e) => e.id)) + 1,
    isDirty: false,
  });
}

export async function downloadScene(
  filename: string = "scene.json",
): Promise<void> {
  const json = serializeScene();
  const launchedProject = useProjectStore.getState().launchedProject;

  if (launchedProject && launchedProject.path) {
    try {
      const sceneName = useSceneStore.getState().sceneName || "main";
      const projectRelativePath = `src/levels/${sceneName}.json`;
      const absolutePath = `${launchedProject.path}/${projectRelativePath}`;

      console.log(
        `💎 VIBEENGINE: Direct saving to workspace... ${absolutePath}`,
      );
      const result = await ProjectScanner.saveFile(absolutePath, json);

      if (result.success) {
        console.log("✅ Scene saved directly to project workspace!");

        return;
      } else {
        console.warn(
          "⚠️ Direct save failed, falling back to download:",
          result.error,
        );
      }
    } catch (e) {
      console.error("❌ Error during direct save:", e);
    }
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadSceneFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        deserializeScene(reader.result as string);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function importRuntimeScene(json: string): void {
  deserializeScene(json);
}

export function importUniversalScene(json: string): {
  format: string;
  entityCount: number;
} {
  const raw = JSON.parse(json);

  const hasMetadata = raw._metadata && raw._metadata.source;
  const hasSceneName = typeof raw.sceneName === "string";
  const hasNextEntityId = typeof raw.nextEntityId === "number";
  const hasEntities = Array.isArray(raw.entities);

  let format = "unknown";
  if (hasMetadata && raw._metadata.source.includes("Universal")) {
    format = "universal-three";
  } else if (hasSceneName && hasNextEntityId && hasEntities) {
    format = "runtime-exporter";
  } else if (raw.version && raw.name && hasEntities) {
    format = "vibe-engine";
  } else if (raw.scenes || raw.nodes || raw.asset) {
    format = "gltf";
  }

  if (format === "gltf") {
    const normalized = normalizeGLTF(raw);
    deserializeScene(JSON.stringify(normalized));
    return { format, entityCount: normalized.entities.length };
  }

  deserializeScene(json);

  const entityCount = raw.entities ? raw.entities.length : 0;
  return { format, entityCount };
}

interface GLTFNode {
  name?: string;
  translation?: number[];
  rotation?: number[];
  scale?: number[];
  mesh?: number;
  children?: number[];
}

interface GLTFAsset {
  generator?: string;
}

interface GLTFMesh {
  // GLTF mesh structure - minimal typing for flexibility
  [key: string]: unknown;
}

interface GLTFData {
  nodes?: GLTFNode[];
  meshes?: GLTFMesh[];
  asset?: GLTFAsset;
}

function normalizeGLTF(gltf: GLTFData): SerializedScene {
  const entities: SerializedEntity[] = [];
  const rootIds: number[] = [];
  let nextId = 1;

  const nodes = gltf.nodes || [];
  const meshes = gltf.meshes || [];

  const processNode = (node: GLTFNode, parentId: number | null) => {
    const id = nextId++;
    const entity: SerializedEntity = {
      id,
      name: node.name || `node_${id}`,
      parentId,
      enabled: true,
      tags: ["imported"],
      components: [],
    };

    const pos = node.translation || [0, 0, 0];
    const rot = node.rotation
      ? [
          (node.rotation[0] * 180) / Math.PI,
          (node.rotation[1] * 180) / Math.PI,
          (node.rotation[2] * 180) / Math.PI,
        ]
      : [0, 0, 0];
    const scl = node.scale || [1, 1, 1];

    entity.components.push({
      type: "Transform",
      data: { position: pos, rotation: rot, scale: scl },
      enabled: true,
    });

    if (node.mesh !== undefined && meshes[node.mesh]) {
      entity.components.push({
        type: "Render",
        data: { meshType: "mesh", color: "#808080" },
        enabled: true,
      });
    }

    entities.push(entity);

    if (parentId === null) rootIds.push(id);

    if (node.children) {
      for (const childIdx of node.children) {
        if (nodes[childIdx]) {
          processNode(nodes[childIdx], id);
        }
      }
    }
  };

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const hasParent = nodes.some(
      (n: GLTFNode) => n.children && n.children.includes(i),
    );
    if (!hasParent) {
      processNode(node, null);
    }
  }

  return {
    version: "1.0.0",
    name: gltf.asset?.generator || "GLTF_Imported",
    entities,
  };
}

export function createDefaultScene(): void {
  const store = useSceneStore.getState();
  store.clear();

  useSceneStore.setState({ sceneName: "New Scene" });

  const cameraId = store.addEntity("Main Camera", null);
  store.addComponent(cameraId, {
    type: "Camera",
    data: { fov: 75, near: 0.1, far: 1000, isActive: true },
    enabled: true,
  });
  store.updateComponent(cameraId, "Transform", {
    position: [0, 5, 10],
    rotation: [-20, 0, 0],
  });

  const lightId = store.addEntity("Directional Light", null);
  store.addComponent(lightId, {
    type: "Light",
    data: {
      lightType: "directional",
      color: "#ffffff",
      intensity: 1,
      castShadow: true,
    },
    enabled: true,
  });
  store.updateComponent(lightId, "Transform", {
    position: [5, 10, 5],
    rotation: [-45, 30, 0],
  });

  const groundId = store.addEntity("Ground", null);
  store.addComponent(groundId, {
    type: "Render",
    data: {
      meshType: "plane",
      color: "#374151",
      castShadow: false,
      receiveShadow: true,
    },
    enabled: true,
  });
  store.updateComponent(groundId, "Transform", {
    scale: [20, 1, 20],
    rotation: [-90, 0, 0],
  });

  const cubeId = store.addEntity("Cube", null);
  store.addComponent(cubeId, {
    type: "Render",
    data: {
      meshType: "cube",
      color: "#6366f1",
      castShadow: true,
      receiveShadow: true,
    },
    enabled: true,
  });
  store.updateComponent(cubeId, "Transform", {
    position: [0, 0.5, 0],
  });

  useSceneStore.setState({ isDirty: false });
}
