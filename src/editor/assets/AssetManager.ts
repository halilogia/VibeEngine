/**
 * AssetManager - Manages imported assets
 */

import { create } from 'zustand';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * AssetEntry - Represents a single asset in the engine.
 */
export interface AssetEntry {
    /** Unique entity ID for the asset */
    id: string;
    /** Original filename or display name */
    name: string;
    /** Categorized asset type */
    type: 'model' | 'texture' | 'audio' | 'script';
    /** Source URL (Object URL for imports, relative path for local) */
    url: string;
    /** Optional thumbnail URL for previewing */
    thumbnail?: string;
    /** Loaded data object (THREE.Group, THREE.Texture, etc.) */
    data?: any;
}

/**
 * State and actions for the Asset Manager store.
 */
interface AssetManagerState {
    /** Collection of all registered assets */
    assets: Map<string, AssetEntry>;
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
    /** Retrieves an asset by its ID */
    getAsset: (id: string) => AssetEntry | undefined;
    /** Removes an asset and disposes its resources */
    removeAsset: (id: string) => void;
    /** Clears all assets and fully disposes GPU memory */
    clear: () => void;
}

// Cache for loaded Three.js objects
const loadedModels = new Map<string, THREE.Group>();
const loadedTextures = new Map<string, THREE.Texture>();

let assetIdCounter = 1;
/** Generates a unique asset ID */
function generateId(): string {
    return `asset_${assetIdCounter++}`;
}

/**
 * useAssetManager - Zustand store for managing game assets.
 * Handles importing, caching, and explicit disposal of Three.js resources.
 */
export const useAssetManager = create<AssetManagerState>((set, get) => ({
    assets: new Map(),
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

            // Cache the model scene
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

    getAsset: (id) => get().assets.get(id),

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
                
                // Explicitly dispose Three.js objects
                const model = loadedModels.get(id);
                if (model) {
                    model.traverse((child: any) => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach((m: any) => m.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    });
                    loadedModels.delete(id);
                }

                const texture = loadedTextures.get(id);
                if (texture) {
                    texture.dispose();
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

            console.log(`✅ Loaded ${files.length} assets from ${basePath}`);
            return { assets: newAssets };
        });
    },

    /**
     * Resets the manager and cleans up all GPU resources.
     */
    clear: () => {
        const { assets } = get();
        assets.forEach((asset) => URL.revokeObjectURL(asset.url));
        
        // Dispose all models
        loadedModels.forEach((model) => {
            model.traverse((child: any) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m: any) => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });
        loadedModels.clear();

        // Dispose all textures
        loadedTextures.forEach((texture) => texture.dispose());
        loadedTextures.clear();

        set({ assets: new Map() });
    }
}));

// No auto-load assets in v1.0.0-beta

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
