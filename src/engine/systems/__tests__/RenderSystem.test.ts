import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { RenderSystem } from '../RenderSystem';
import { Entity } from '@engine';
import { TransformComponent } from '@engine';
import { RenderComponent } from '@engine';
import { CameraComponent } from '@engine';

describe('RenderSystem', () => {
    let renderSystem: RenderSystem;
    let mockApp: any;
    let mockThreeScene: THREE.Scene;

    beforeEach(() => {
        mockThreeScene = new THREE.Scene();
        mockApp = {
            threeScene: mockThreeScene,
            camera: new THREE.PerspectiveCamera(),
            scene: {
                getAllEntities: vi.fn().mockReturnValue([])
            }
        };

        renderSystem = new RenderSystem();
        renderSystem.app = mockApp;
    });

    it('should add entity mesh to Three.js scene', () => {
        const entity = new Entity('MeshEntity');
        const transform = entity.addComponent(new TransformComponent());
        const render = entity.addComponent(new RenderComponent(new THREE.Mesh()));

        expect(mockThreeScene.children.length).toBe(0);

        renderSystem.update(0.016, [entity]);
        
        expect(mockThreeScene.children.length).toBe(1);
        expect(mockThreeScene.children[0]).toBe(render.object3D);
    });

    it('should sync transform from component to mesh', () => {
        const entity = new Entity('SyncEntity');
        const transform = entity.addComponent(new TransformComponent());
        const render = entity.addComponent(new RenderComponent(new THREE.Mesh()));
        
        transform.position.set(10, 20, 30);
        
        renderSystem.update(0.016, [entity]);
        
        expect(render.object3D?.position.x).toBe(10);
        expect(render.object3D?.position.y).toBe(20);
        expect(render.object3D?.position.z).toBe(30);
    });

    it('should handle camera activation', () => {
        const entity = new Entity('CameraEntity');
        entity.addComponent(new TransformComponent());
        const cameraComp = entity.addComponent(new CameraComponent());
        cameraComp.isActive = true;
        
        mockApp.scene.getAllEntities.mockReturnValue([entity]);
        
        const applyToCameraSpy = vi.spyOn(cameraComp, 'applyToCamera');
        
        renderSystem.update(0.016, []);
        
        expect(applyToCameraSpy).toHaveBeenCalledWith(mockApp.camera);
        expect(cameraComp.threeCamera).toBe(mockApp.camera);
    });

    it('should respect visibility and enabled states', () => {
        const entity = new Entity('VisibleEntity');
        entity.addComponent(new TransformComponent());
        const render = entity.addComponent(new RenderComponent(new THREE.Mesh()));

        // First update to add the object to scene
        renderSystem.update(0.016, [entity]);
        expect(mockThreeScene.children.length).toBe(1);
        expect(render.object3D?.visible).toBe(true);

        // Test entity disabled - activeInHierarchy should be false
        entity.enabled = false;
        renderSystem.update(0.016, [entity]);
        expect(render.object3D?.visible).toBe(false);

        // Re-enable entity for next test
        entity.enabled = true;
        
        // Test render component disabled
        render.enabled = false;
        renderSystem.update(0.016, [entity]);
        expect(render.object3D?.visible).toBe(false);

        // Test both enabled
        render.enabled = true;
        renderSystem.update(0.016, [entity]);
        expect(render.object3D?.visible).toBe(true);
    });
});
