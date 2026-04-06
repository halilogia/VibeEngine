import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { CameraComponent } from '../CameraComponent';
import { Entity } from '@engine';
import { TransformComponent } from '../TransformComponent';

describe('CameraComponent', () => {
    let cameraComponent: CameraComponent;
    let mockThreeCamera: THREE.PerspectiveCamera;

    beforeEach(() => {
        cameraComponent = new CameraComponent({ fov: 60, near: 0.5, far: 500 });
        mockThreeCamera = new THREE.PerspectiveCamera();
    });

    it('should initialize with correct options', () => {
        expect(cameraComponent.fov).toBe(60);
        expect(cameraComponent.near).toBe(0.5);
        expect(cameraComponent.far).toBe(500);
        expect(cameraComponent.isActive).toBe(true);
    });

    it('should apply settings to Three.js camera', () => {
        cameraComponent.applyToCamera(mockThreeCamera);
        
        expect(mockThreeCamera.fov).toBe(60);
        expect(mockThreeCamera.near).toBe(0.5);
        expect(mockThreeCamera.far).toBe(500);
        expect(cameraComponent.threeCamera).toBe(mockThreeCamera);
    });

    it('should sync camera position from entity transform', () => {
        const entity = new Entity('CamEntity');
        const transform = entity.addComponent(new TransformComponent());
        entity.addComponent(cameraComponent);
        
        transform.position.set(5, 10, 15);
        cameraComponent.threeCamera = mockThreeCamera;
        
        cameraComponent.syncFromTransform();
        
        expect(mockThreeCamera.position.x).toBe(5);
        expect(mockThreeCamera.position.y).toBe(10);
        expect(mockThreeCamera.position.z).toBe(15);
    });

    it('should handle follow target correctly', () => {
        const cameraEntity = new Entity('Cam');
        cameraEntity.addComponent(new TransformComponent());
        cameraEntity.addComponent(cameraComponent);
        cameraComponent.threeCamera = mockThreeCamera;

        const targetEntity = new Entity('Target');
        const targetTransform = targetEntity.addComponent(new TransformComponent());
        targetTransform.position.set(0, 0, 0);

        const offset = new THREE.Vector3(0, 5, 10);
        cameraComponent.setFollowTarget(targetEntity, offset);
        
        cameraComponent.updateFollow(1.0); 

        expect(mockThreeCamera.position.x).toBeCloseTo(0);
        expect(mockThreeCamera.position.y).toBeCloseTo(5);
        expect(mockThreeCamera.position.z).toBeCloseTo(10);
    });

    it('should clone correctly with default inactive state', () => {
        const cloned = cameraComponent.clone();
        expect(cloned.fov).toBe(60);
        expect(cloned.isActive).toBe(false);
    });
});
