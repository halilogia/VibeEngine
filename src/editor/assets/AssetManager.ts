/**
 * AssetManager - Manages imported assets
 */

import { create } from 'zustand';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
    type AssetEntry, 
    loadedModels, 
    loadedTextures, 
    generateId, 
    disposeModel, 
    disposeTexture 
} from './AssetUtils';

/**
 * State and actions for the Asset Manager store.
 */
interface AssetManagerState {
    /** Collection of all registered assets */
    assets: Map<string, AssetEntry>;
    /** Collection of built-in library assets (engine-level) */
    libraryAssets: Map<string, AssetEntry>;
    /** Whether an import operation is in progress */
    loading: boolean;

    /** Error message if an operation failed */
    error: string | null;

    /** Imports a 3D model file (.glb, .gltf) */
    importModel: (file: File) => Promise<AssetEntry | null>;
    /** Imports an image file as a texture */
    importTexture: (file: File) => Promise<AssetEntry | null>;
    /** Populates the manager with assets from a specific directory */
    loadAssetsFromDirectory: (basePath: string, files: string[]) => void;
    /** Initializes the built-in Kenney Pirate Kit library */
    initializeKenneyLibrary: (models: string[]) => void;
    /** Retrieves an asset by its ID */

    getAsset: (id: string) => AssetEntry | undefined;
    /** Removes an asset and disposes its resources */
    removeAsset: (id: string) => void;
    /** Clears all assets and fully disposes GPU memory */
    clear: () => void;
}

/**
 * useAssetManager - Zustand store for managing game assets.
 * Handles importing, caching, and explicit disposal of Three.js resources.
 */
export const useAssetManager = create<AssetManagerState>((set, get) => ({
    assets: new Map(),
    libraryAssets: new Map(),
    loading: false,
    error: null,

    /**
     * Imports a GLTF/GLB file using THREE.GLTFLoader.
     */
    importModel: async (file: File) => {
        set({ loading: true, error: null });

        try {
            const url = URL.createObjectURL(file);
            const loader = new GLTFLoader();

            const gltf = await new Promise<any>((resolve, reject) => {
                loader.load(url, resolve, undefined, reject);
            });

            const id = generateId();
            const entry: AssetEntry = {
                id,
                name: file.name,
                type: 'model',
                url,
                data: gltf
            };

            // Cache the model scene (cloned for safety)
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

    /**
     * Imports an image file as a THREE.Texture.
     */
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
                type: 'texture',
                url,
                thumbnail: url,
                data: texture
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

    /**
     * Removes an asset and ensures its geometry/material memory is freed.
     */
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

    /**
     * Bulk loads assets from a directory path.
     */
    loadAssetsFromDirectory: (basePath, files) => {
        set((state) => {
            const newAssets = new Map(state.assets);

            for (const file of files) {
                const id = generateId();
                const name = file.split('/').pop() || file;
                const ext = name.split('.').pop()?.toLowerCase();

                let type: 'model' | 'texture' | 'audio' | 'script' = 'model';
                if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
                    type = 'texture';
                } else if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
                    type = 'audio';
                }

                const entry: AssetEntry = {
                    id,
                    name,
                    type,
                    url: basePath + file,
                    thumbnail: type === 'texture' ? basePath + file : undefined
                };

                newAssets.set(id, entry);
            }

            return { assets: newAssets };
        });
    },

    /**
     * Initializes the Kenney Pirate Kit library using static paths.
     */
    initializeKenneyLibrary: (models) => {
        set((state) => {
            const newLibrary = new Map(state.libraryAssets);
            const basePath = '/kenney-kit/kenney_pirate-kit/Models/GLB format/';

            for (const name of models) {
                const id = `kenney_${name.split('.')[0]}`;
                const entry: AssetEntry = {
                    id,
                    name: name.split('.')[0].replace(/-/g, ' '),
                    type: 'model',
                    url: basePath + name,
                    thumbnail: undefined
                };
                newLibrary.set(id, entry);
            }

            return { libraryAssets: newLibrary };
        });
    },

    /**
     * Resets the manager and cleans up all GPU resources.
     */
    clear: () => {
        const { assets } = get();
        assets.forEach((asset) => URL.revokeObjectURL(asset.url));
        
        loadedModels.forEach(disposeModel);
        loadedModels.clear();

        loadedTextures.forEach(disposeTexture);
        loadedTextures.clear();

        set({ assets: new Map() });
    }
}));

/**
 * Get a cloned model from cache
 */
export function getLoadedModel(id: string): THREE.Group | null {
    const model = loadedModels.get(id);
    return model ? model.clone() : null;
}

/**
 * Get loaded texture
 */
export function getLoadedTexture(id: string): THREE.Texture | null {
    return loadedTextures.get(id) ?? null;
}
