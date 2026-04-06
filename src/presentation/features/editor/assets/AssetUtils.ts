import * as THREE from "three";

export interface AssetEntry {
  id: string;
  name: string;
  type: "model" | "texture" | "audio" | "script";
  url: string;
  thumbnail?: string;
  data?: unknown;
}

export const loadedModels = new Map<string, THREE.Group>();
export const loadedTextures = new Map<string, THREE.Texture>();

let assetIdCounter = 1;

export function generateId(): string {
  return `asset_${assetIdCounter++}`;
}

export function disposeModel(model: THREE.Group): void {
  model.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m: THREE.Material) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}

export function disposeTexture(texture: THREE.Texture): void {
  texture.dispose();
}
