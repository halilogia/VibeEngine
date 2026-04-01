/**
 * AssetLoader - Load models, textures, and audio
 * Provides async loading with caching.
 */

import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadedModel {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
    gltf: GLTF;
}

export class AssetLoader {
    /** GLTF/GLB loader */
    private readonly gltfLoader: GLTFLoader = new GLTFLoader();

    /** Texture loader */
    private readonly textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

    /** Audio loader */
    private readonly audioLoader: THREE.AudioLoader = new THREE.AudioLoader();

    /** Model cache */
    private readonly modelCache: Map<string, LoadedModel> = new Map();

    /** Texture cache */
    private readonly textureCache: Map<string, THREE.Texture> = new Map();

    /** Audio cache */
    private readonly audioCache: Map<string, AudioBuffer> = new Map();

    /** Loading progress callback */
    onProgress?: (url: string, loaded: number, total: number) => void;

    /**
     * Load a GLTF/GLB model
     */
    async loadModel(url: string, cache: boolean = true): Promise<LoadedModel> {
        // Check cache
        if (cache && this.modelCache.has(url)) {
            const cached = this.modelCache.get(url)!;
            // Return cloned scene to avoid shared state
            return {
                scene: cached.scene.clone(),
                animations: cached.animations,
                gltf: cached.gltf,
            };
        }

        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    const result: LoadedModel = {
                        scene: gltf.scene,
                        animations: gltf.animations,
                        gltf,
                    };

                    if (cache) {
                        this.modelCache.set(url, result);
                    }

                    console.log(`✅ Model loaded: ${url}`);
                    resolve({
                        scene: gltf.scene.clone(),
                        animations: gltf.animations,
                        gltf,
                    });
                },
                (progress) => {
                    if (this.onProgress) {
                        this.onProgress(url, progress.loaded, progress.total);
                    }
                },
                (error) => {
                    console.error(`❌ Failed to load model: ${url}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load a texture
     */
    async loadTexture(url: string, cache: boolean = true): Promise<THREE.Texture> {
        // Check cache
        if (cache && this.textureCache.has(url)) {
            return this.textureCache.get(url)!;
        }

        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    if (cache) {
                        this.textureCache.set(url, texture);
                    }
                    console.log(`✅ Texture loaded: ${url}`);
                    resolve(texture);
                },
                (progress) => {
                    if (this.onProgress) {
                        this.onProgress(url, progress.loaded, progress.total);
                    }
                },
                (error) => {
                    console.error(`❌ Failed to load texture: ${url}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load an audio file
     */
    async loadAudio(url: string, cache: boolean = true): Promise<AudioBuffer> {
        // Check cache
        if (cache && this.audioCache.has(url)) {
            return this.audioCache.get(url)!;
        }

        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                url,
                (buffer) => {
                    if (cache) {
                        this.audioCache.set(url, buffer);
                    }
                    console.log(`✅ Audio loaded: ${url}`);
                    resolve(buffer);
                },
                (progress) => {
                    if (this.onProgress) {
                        this.onProgress(url, progress.loaded, progress.total);
                    }
                },
                (error) => {
                    console.error(`❌ Failed to load audio: ${url}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load multiple assets in parallel
     */
    async loadAll<T>(
        urls: string[],
        loader: (url: string) => Promise<T>
    ): Promise<T[]> {
        return Promise.all(urls.map(url => loader(url)));
    }

    /**
     * Preload multiple models
     */
    async preloadModels(urls: string[]): Promise<void> {
        await this.loadAll(urls, url => this.loadModel(url));
    }

    /**
     * Clear all caches
     */
    clearCache(): void {
        // Dispose textures
        this.textureCache.forEach(texture => texture.dispose());
        this.textureCache.clear();

        // Clear model cache (don't dispose, might still be in use)
        this.modelCache.clear();

        // Clear audio cache
        this.audioCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { models: number; textures: number; audio: number } {
        return {
            models: this.modelCache.size,
            textures: this.textureCache.size,
            audio: this.audioCache.size,
        };
    }
}

/** Singleton asset loader */
export const assetLoader = new AssetLoader();
