/**
 * AssetUtils - Helper utilities for Asset Management
 */
import * as THREE from 'three';

/**
 * AssetEntry - Represents a single asset in the engine.
 */
export interface AssetEntry {
    id: string;
    name: string;
    type: 'model' | 'texture' | 'audio' | 'script';
    url: string;
    thumbnail?: string;
    data?: any;
}

// Global Caches
export const loadedModels = new Map<string, THREE.Group>();
export const loadedTextures = new Map<string, THREE.Texture>();

let assetIdCounter = 1;

/** Generates a unique asset ID */
export function generateId(): string {
    return `asset_${assetIdCounter++}`;
}

/**
 * Safely dispose of a Three.js model and its resources
 */
export function disposeModel(model: THREE.Group): void {
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
}

/**
 * Safely dispose of a Three.js texture
 */
export function disposeTexture(texture: THREE.Texture): void {
    texture.dispose();
}
