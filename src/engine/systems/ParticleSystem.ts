

import { System } from '@engine';
import type { Entity } from '@engine';
import { TransformComponent } from '@engine';
import { ParticleComponent } from '@engine';

export class ParticleSystem extends System {
    readonly priority = 35; 
    readonly requiredComponents = [ParticleComponent];

    private scene: THREE.Scene | null = null;

    private initialized: Set<ParticleComponent> = new Set();

    setScene(scene: THREE.Scene): void {
        this.scene = scene;
    }

    update(deltaTime: number, entities: Entity[]): void {
        for (const entity of entities) {
            const particle = entity.getComponent(ParticleComponent);
            if (!particle) continue;

            if (this.scene && !this.initialized.has(particle)) {
                particle.initialize(this.scene);
                this.initialized.add(particle);
            }

            const transform = entity.getComponent(TransformComponent);
            const worldPos = transform?.position.clone() ?? new THREE.Vector3();

            particle.update(deltaTime, worldPos);
        }
    }

    onEntityRemoved(entity: Entity): void {
        const particle = entity.getComponent(ParticleComponent);
        if (particle) {
            particle.dispose();
            this.initialized.delete(particle);
        }
    }
}

import * as THREE from 'three';
