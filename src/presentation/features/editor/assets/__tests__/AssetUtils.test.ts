import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { generateId, disposeModel, disposeTexture, loadedModels, loadedTextures } from '../AssetUtils';

describe('AssetUtils', () => {
    beforeEach(() => {
        loadedModels.clear();
        loadedTextures.clear();
    });

    it('should generate unique asset IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
        expect(id1).toMatch(/^asset_\d+$/);
    });

    it('should safely dispose of THREE.Group models', () => {
        const group = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        const geomDisposeSpy = vi.spyOn(geometry, 'dispose');
        const matDisposeSpy = vi.spyOn(material, 'dispose');

        disposeModel(group);

        expect(geomDisposeSpy).toHaveBeenCalled();
        expect(matDisposeSpy).toHaveBeenCalled();
    });

    it('should safely dispose of multiple materials', () => {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            [new THREE.MeshBasicMaterial(), new THREE.MeshBasicMaterial()]
        );
        const group = new THREE.Group().add(mesh);

        const matSpies = (mesh.material as THREE.Material[]).map(m => vi.spyOn(m, 'dispose'));

        disposeModel(group);

        matSpies.forEach(spy => expect(spy).toHaveBeenCalled());
    });

    it('should dispose of textures', () => {
        const texture = new THREE.Texture();
        const disposeSpy = vi.spyOn(texture, 'dispose');

        disposeTexture(texture);

        expect(disposeSpy).toHaveBeenCalled();
    });
});
