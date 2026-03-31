/**
 * AssetManager - Manages imported assets
 */

import { create } from 'zustand';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface AssetEntry {
    id: string;
    name: string;
    type: 'model' | 'texture' | 'audio' | 'script';
    url: string;
    thumbnail?: string;
    data?: any;
}

interface AssetManagerState {
    assets: Map<string, AssetEntry>;
    loading: boolean;
    error: string | null;

    // Actions
    importModel: (file: File) => Promise<AssetEntry | null>;
    importTexture: (file: File) => Promise<AssetEntry | null>;
    loadAssetsFromDirectory: (basePath: string, files: string[]) => void;
    getAsset: (id: string) => AssetEntry | undefined;
    removeAsset: (id: string) => void;
    clear: () => void;
}

// Known asset files in public/models
const KNOWN_ASSETS = [
    { path: '/models/buildings/building1.glb', type: 'model' as const },
    { path: '/models/buildings/building2.glb', type: 'model' as const },
    { path: '/models/buildings/building3.glb', type: 'model' as const },
    { path: '/models/roads/road_straight.glb', type: 'model' as const },
    { path: '/models/vegetation/tree.glb', type: 'model' as const },
    { path: '/ui/logo.png', type: 'texture' as const },
];

// Cache for loaded Three.js objects
const loadedModels = new Map<string, THREE.Group>();
const loadedTextures = new Map<string, THREE.Texture>();

let assetIdCounter = 1;
function generateId(): string {
    return `asset_${assetIdCounter++}`;
}

export const useAssetManager = create<AssetManagerState>((set, get) => ({
    assets: new Map(),
    loading: false,
    error: null,

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

            // Cache the model
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

    removeAsset: (id) => {
        set((state) => {
            const newAssets = new Map(state.assets);
            const asset = newAssets.get(id);

            if (asset) {
                URL.revokeObjectURL(asset.url);
                newAssets.delete(id);
                loadedModels.delete(id);
                loadedTextures.delete(id);
            }

            return { assets: newAssets };
        });
    },

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

    clear: () => {
        const { assets } = get();
        assets.forEach((asset) => URL.revokeObjectURL(asset.url));
        loadedModels.clear();
        loadedTextures.clear();
        set({ assets: new Map() });
    }
}));

// Auto-load known assets on import
setTimeout(() => {
    useAssetManager.getState().loadAssetsFromDirectory('', [
        '/models/buildings/ModernBuilding1.glb',
        '/models/buildings/ModernBuilding2.glb',
        '/models/buildings/ModernBuilding3.glb',
        '/models/roads/RoadStraight.glb',
        '/models/vegetation/Tree1.glb',
        '/audio/shoot.mp3',
        '/audio/hit.mp3',
        '/ui/logo.png',
    ]);
}, 100);

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
