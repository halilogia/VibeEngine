import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { ParticleComponent } from '../ParticleComponent';

describe('ParticleComponent', () => {
    let particleComponent: ParticleComponent;
    let mockScene: THREE.Scene;

    beforeEach(() => {
        
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        
        particleComponent = new ParticleComponent({
            maxParticles: 50,
            emissionRate: 10,
            lifetime: 2
        });
        mockScene = new THREE.Scene();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with config', () => {
        expect(particleComponent.config.maxParticles).toBe(50);
        expect(particleComponent.config.emissionRate).toBe(10);
    });

    it('should create Three.js objects on initialize', () => {
        particleComponent.initialize(mockScene);
        
        expect(particleComponent.pointsObject).toBeInstanceOf(THREE.Points);
        expect(mockScene.children).toContain(particleComponent.pointsObject);
        expect(particleComponent.geometry).toBeDefined();
    });

    it('should emit particles over time', () => {
        particleComponent.initialize(mockScene);

        particleComponent.update(0.5, new THREE.Vector3(0, 0, 0));
        
        expect(particleComponent.particles.length).toBe(5);
    });

    it('should respect maxParticles limit', () => {
        particleComponent.config.maxParticles = 5;
        particleComponent.config.emissionRate = 100; 
        
        particleSystemUpdate(particleComponent, 1.0);
        
        expect(particleComponent.particles.length).toBe(5);
    });

    it('should remove expired particles', () => {
        particleComponent.config.lifetime = 0.1;
        particleComponent.emit(); 
        expect(particleComponent.particles.length).toBe(1);

        particleComponent.config.emissionRate = 0;

        particleComponent.update(0.2, new THREE.Vector3(0, 0, 0));
        
        expect(particleComponent.particles.length).toBe(0);
    });

    it('should apply gravity and velocity to particles', () => {
        particleComponent.config.gravity = new THREE.Vector3(0, -10, 0);
        particleComponent.config.velocity = new THREE.Vector3(0, 0, 0);
        particleComponent.config.velocitySpread = new THREE.Vector3(0, 0, 0);
        
        particleComponent.emit();
        const p = particleComponent.particles[0];
        
        particleComponent.update(1.0, new THREE.Vector3(0, 0, 0));

        expect(p.velocity.y).toBeCloseTo(-10);
        
        expect(p.position.y).toBeCloseTo(-10);
    });
});

function particleSystemUpdate(comp: ParticleComponent, dt: number) {
    comp.update(dt, new THREE.Vector3(0, 0, 0));
}
