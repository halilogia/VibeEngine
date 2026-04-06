import { create } from "zustand";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  type AssetEntry,
  loadedModels,
  loadedTextures,
  generateId,
  disposeModel,
  disposeTexture,
} from "./AssetUtils";

interface AssetManagerState {
  assets: Map<string, AssetEntry>;

  libraryAssets: Map<string, AssetEntry>;

  loading: boolean;

  error: string | null;

  importModel: (file: File) => Promise<AssetEntry | null>;

  importTexture: (file: File) => Promise<AssetEntry | null>;

  loadAssetsFromDirectory: (basePath: string, files: string[]) => void;

  initializeKenneyLibrary: (models: string[]) => void;

  getAsset: (id: string) => AssetEntry | undefined;

  removeAsset: (id: string) => void;

  clear: () => void;
}

export const useAssetManager = create<AssetManagerState>((set, get) => ({
  assets: new Map(),
  libraryAssets: new Map(),
  loading: false,
  error: null,

  importModel: async (file: File) => {
    set({ loading: true, error: null });

    try {
      const url = URL.createObjectURL(file);
      const loader = new GLTFLoader();

      const gltf = await new Promise<GLTF>((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

      const id = generateId();
      const entry: AssetEntry = {
        id,
        name: file.name,
        type: "model",
        url,
        data: gltf,
      };

      loadedModels.set(id, gltf.scene.clone());

      set((state) => {
        const newAssets = new Map(state.assets);
        newAssets.set(id, entry);
        return { assets: newAssets, loading: false };
      });

      return entry;
    } catch (error) {
      set({ loading: false, error: String(error) });
      return null;
    }
  },

  importTexture: async (file: File) => {
    set({ loading: true, error: null });

    try {
      const url = URL.createObjectURL(file);
      const loader = new THREE.TextureLoader();

      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

      const id = generateId();
      const entry: AssetEntry = {
        id,
        name: file.name,
        type: "texture",
        url,
        thumbnail: url,
        data: texture,
      };

      loadedTextures.set(id, texture);

      set((state) => {
        const newAssets = new Map(state.assets);
        newAssets.set(id, entry);
        return { assets: newAssets, loading: false };
      });

      return entry;
    } catch (error) {
      set({ loading: false, error: String(error) });
      return null;
    }
  },

  getAsset: (id) => get().assets.get(id) || get().libraryAssets.get(id),

  removeAsset: (id) => {
    set((state) => {
      const newAssets = new Map(state.assets);
      const asset = newAssets.get(id);

      if (asset) {
        URL.revokeObjectURL(asset.url);
        newAssets.delete(id);

        const model = loadedModels.get(id);
        if (model) {
          disposeModel(model);
          loadedModels.delete(id);
        }

        const texture = loadedTextures.get(id);
        if (texture) {
          disposeTexture(texture);
          loadedTextures.delete(id);
        }
      }

      return { assets: newAssets };
    });
  },

  loadAssetsFromDirectory: (basePath, files) => {
    set((state) => {
      const newAssets = new Map(state.assets);

      for (const file of files) {
        const id = generateId();
        const name = file.split("/").pop() || file;
        const ext = name.split(".").pop()?.toLowerCase();

        let type: "model" | "texture" | "audio" | "script" = "model";
        if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) {
          type = "texture";
        } else if (["mp3", "wav", "ogg"].includes(ext || "")) {
          type = "audio";
        }

        const entry: AssetEntry = {
          id,
          name,
          type,
          url: basePath + file,
          thumbnail: type === "texture" ? basePath + file : undefined,
        };

        newAssets.set(id, entry);
      }

      return { assets: newAssets };
    });
  },

  initializeKenneyLibrary: (models) => {
    set((state) => {
      const newLibrary = new Map(state.libraryAssets);
      const basePath = "/kenney-kit/kenney_pirate-kit/Models/GLB format/";

      for (const name of models) {
        const id = `kenney_${name.split(".")[0]}`;
        const entry: AssetEntry = {
          id,
          name: name.split(".")[0].replace(/-/g, " "),
          type: "model",
          url: basePath + name,
          thumbnail: undefined,
        };
        newLibrary.set(id, entry);
      }

      return { libraryAssets: newLibrary };
    });
  },

  clear: () => {
    const { assets } = get();
    assets.forEach((asset) => URL.revokeObjectURL(asset.url));

    loadedModels.forEach(disposeModel);
    loadedModels.clear();

    loadedTextures.forEach(disposeTexture);
    loadedTextures.clear();

    set({ assets: new Map() });
  },
}));

export function getLoadedModel(id: string): THREE.Group | null {
  const model = loadedModels.get(id);
  return model ? model.clone() : null;
}

export function getLoadedTexture(id: string): THREE.Texture | null {
  return loadedTextures.get(id) ?? null;
}
