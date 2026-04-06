

import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadedModel {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
    gltf: GLTF;
}

export class AssetLoader {
    
    private readonly gltfLoader: GLTFLoader = new GLTFLoader();

    private readonly textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

    private readonly audioLoader: THREE.AudioLoader = new THREE.AudioLoader();

    private readonly modelCache: Map<string, LoadedModel> = new Map();

    private readonly textureCache: Map<string, THREE.Texture> = new Map();

    private readonly audioCache: Map<string, AudioBuffer> = new Map();

    onProgress?: (url: string, loaded: number, total: number) => void;

    async loadModel(url: string, cache: boolean = true): Promise<LoadedModel> {
        
        if (cache && this.modelCache.has(url)) {
            const cached = this.modelCache.get(url)!;
            
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

    async loadTexture(url: string, cache: boolean = true): Promise<THREE.Texture> {
        
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

    async loadAudio(url: string, cache: boolean = true): Promise<AudioBuffer> {
        
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

    async loadAll<T>(
        urls: string[],
        loader: (url: string) => Promise<T>
    ): Promise<T[]> {
        return Promise.all(urls.map(url => loader(url)));
    }

    async preloadModels(urls: string[]): Promise<void> {
        await this.loadAll(urls, url => this.loadModel(url));
    }

    clearCache(): void {
        
        this.textureCache.forEach(texture => texture.dispose());
        this.textureCache.clear();

        this.modelCache.clear();

        this.audioCache.clear();
    }

    getCacheStats(): { models: number; textures: number; audio: number } {
        return {
            models: this.modelCache.size,
            textures: this.textureCache.size,
            audio: this.audioCache.size,
        };
    }
}

export const assetLoader = new AssetLoader();
