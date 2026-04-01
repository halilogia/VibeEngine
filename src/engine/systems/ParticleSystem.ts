/**
 * ParticleSystem - Updates particle emitters
 */

import { System } from '@engine';
import type { Entity } from '@engine';
import { TransformComponent } from '@engine';
import { ParticleComponent } from '@engine';

export class ParticleSystem extends System {
    readonly priority = 35; // After physics, before render
    readonly requiredComponents = [ParticleComponent];

    /** Reference to the scene for initialization */
    private scene: THREE.Scene | null = null;

    /** Track initialized particles */
    private initialized: Set<ParticleComponent> = new Set();

    /**
     * Set the scene for particle initialization
     */
    setScene(scene: THREE.Scene): void {
        this.scene = scene;
    }

    update(deltaTime: number, entities: Entity[]): void {
        for (const entity of entities) {
            const particle = entity.getComponent(ParticleComponent);
            if (!particle) continue;

            // Initialize if needed
            if (this.scene && !this.initialized.has(particle)) {
                particle.initialize(this.scene);
                this.initialized.add(particle);
            }

            // Get world position
            const transform = entity.getComponent(TransformComponent);
            const worldPos = transform?.position.clone() ?? new THREE.Vector3();

            // Update particles
            particle.update(deltaTime, worldPos);
        }
    }

    /**
     * Clean up when entity is removed
     */
    onEntityRemoved(entity: Entity): void {
        const particle = entity.getComponent(ParticleComponent);
        if (particle) {
            particle.dispose();
            this.initialized.delete(particle);
        }
    }
}

// Type import for THREE
import * as THREE from 'three';
