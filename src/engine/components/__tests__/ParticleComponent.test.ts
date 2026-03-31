import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { ParticleComponent } from '../ParticleComponent';

describe('ParticleComponent', () => {
    let particleComponent: ParticleComponent;
    let mockScene: THREE.Scene;

    beforeEach(() => {
        // Mock Math.random to return 0.5 so random spreads are 0
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
        
        // Emission rate is 10/sec. In 0.5s, it should emit 5 particles.
        particleComponent.update(0.5, new THREE.Vector3(0, 0, 0));
        
        expect(particleComponent.particles.length).toBe(5);
    });

    it('should respect maxParticles limit', () => {
        particleComponent.config.maxParticles = 5;
        particleComponent.config.emissionRate = 100; // Very high rate
        
        particleSystemUpdate(particleComponent, 1.0);
        
        expect(particleComponent.particles.length).toBe(5);
    });

    it('should remove expired particles', () => {
        particleComponent.config.lifetime = 0.1;
        particleComponent.emit(); // Emit 1 manually
        expect(particleComponent.particles.length).toBe(1);
        
        // Set emission rate to 0 to avoid new particles, but keep playing to allow update loop
        particleComponent.config.emissionRate = 0;
        
        // Update past lifetime (0.1)
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
        
        // Velocity: 0 + (-10 * 1.0) = -10
        expect(p.velocity.y).toBeCloseTo(-10);
        // Position: 0 + (-10 * 1.0) = -10
        expect(p.position.y).toBeCloseTo(-10);
    });
});

/** Helper to simulate system update */
function particleSystemUpdate(comp: ParticleComponent, dt: number) {
    comp.update(dt, new THREE.Vector3(0, 0, 0));
}
