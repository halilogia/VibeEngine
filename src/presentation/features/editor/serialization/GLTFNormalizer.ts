import type { SerializedScene, SerializedEntity } from './SceneSerializer';

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
  [key: string]: unknown;
}

interface GLTFData {
  nodes?: GLTFNode[];
  meshes?: GLTFMesh[];
  asset?: GLTFAsset;
}

export function normalizeGLTF(gltf: GLTFData): SerializedScene {
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
        if (nodes[childIdx]) processNode(nodes[childIdx], id);
      }
    }
  };

  for (let i = 0; i < nodes.length; i++) {
    const hasParent = nodes.some(
      (n: GLTFNode) => n.children && n.children.includes(i),
    );
    if (!hasParent) processNode(nodes[i], null);
  }

  return {
    version: "1.0.0",
    name: gltf.asset?.generator || "GLTF_Imported",
    entities,
  };
}