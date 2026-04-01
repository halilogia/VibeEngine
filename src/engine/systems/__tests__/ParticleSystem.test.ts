import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { ParticleSystem } from '../ParticleSystem';
import { Entity } from '@engine';
import { ParticleComponent } from '@engine';
import { TransformComponent } from '@engine';

describe('ParticleSystem', () => {
    let particleSystem: ParticleSystem;
    let mockScene: THREE.Scene;

    beforeEach(() => {
        particleSystem = new ParticleSystem();
        mockScene = new THREE.Scene();
        particleSystem.setScene(mockScene);
    });

    it('should initialize particle components on first update', () => {
        const entity = new Entity('ParticleEntity');
        entity.addComponent(new TransformComponent());
        const particleComp = entity.addComponent(new ParticleComponent());
        
        const initSpy = vi.spyOn(particleComp, 'initialize');
        
        particleSystem.update(0.016, [entity]);
        
        expect(initSpy).toHaveBeenCalledWith(mockScene);
    });

    it('should update particle components with world position', () => {
        const entity = new Entity('MovingEmitter');
        const transform = entity.addComponent(new TransformComponent());
        transform.position.set(10, 5, 0);
        
        const particleComp = entity.addComponent(new ParticleComponent());
        const updateSpy = vi.spyOn(particleComp, 'update');
        
        particleSystem.update(0.1, [entity]);
        
        expect(updateSpy).toHaveBeenCalledWith(0.1, expect.objectContaining({ x: 10, y: 5, z: 0 }));
    });

    it('should dispose particles when entity is removed', () => {
        const entity = new Entity('RemovedEntity');
        const particleComp = entity.addComponent(new ParticleComponent());
        
        // Initialize it first
        particleSystem.update(0.016, [entity]);
        
        const disposeSpy = vi.spyOn(particleComp, 'dispose');
        particleSystem.onEntityRemoved(entity);
        
        expect(disposeSpy).toHaveBeenCalled();
    });
});
