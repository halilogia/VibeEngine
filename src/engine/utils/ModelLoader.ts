import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class ModelLoader {
    private static fbxLoader = new FBXLoader();

    static async loadFBX(path: string): Promise<THREE.Group> {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                path,
                (fbx) => {
                    fbx.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    resolve(fbx);
                },
                undefined,
                (error) => reject(error)
            );
        });
    }
}
