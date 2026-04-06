

import * as THREE from 'three';
import { Component } from '@engine';

export interface ParticleConfig {
    
    maxParticles?: number;
    
    emissionRate?: number;
    
    lifetime?: number;
    
    velocity?: THREE.Vector3;
    
    velocitySpread?: THREE.Vector3;
    
    size?: number;
    
    sizeSpread?: number;
    
    startColor?: THREE.Color;
    
    endColor?: THREE.Color;
    
    gravity?: THREE.Vector3;
    
    loop?: boolean;
    
    texture?: THREE.Texture | null;
    
    blendMode?: THREE.Blending;
}

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    age: number;
    lifetime: number;
    size: number;
    color: THREE.Color;
    alpha: number;
}

export class ParticleComponent extends Component {
    static readonly TYPE = 'Particle';

    config: ParticleConfig;

    particles: Particle[] = [];

    private emitAccumulator: number = 0;

    isPlaying: boolean = true;

    pointsObject: THREE.Points | null = null;

    geometry: THREE.BufferGeometry | null = null;

    constructor(config: Partial<ParticleConfig> = {}) {
        super();
        this.config = {
            maxParticles: config.maxParticles ?? 100,
            emissionRate: config.emissionRate ?? 10,
            lifetime: config.lifetime ?? 2,
            velocity: config.velocity ?? new THREE.Vector3(0, 1, 0),
            velocitySpread: config.velocitySpread ?? new THREE.Vector3(0.5, 0.5, 0.5),
            size: config.size ?? 0.1,
            sizeSpread: config.sizeSpread ?? 0.02,
            startColor: config.startColor ?? new THREE.Color(1, 0.5, 0),
            endColor: config.endColor ?? new THREE.Color(1, 0, 0),
            gravity: config.gravity ?? new THREE.Vector3(0, -1, 0),
            loop: config.loop ?? true,
            texture: config.texture ?? null,
            blendMode: config.blendMode ?? THREE.AdditiveBlending
        };
    }

    initialize(scene: THREE.Scene): void {
        const maxParticles = this.config.maxParticles!;

        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(maxParticles * 3);
        const colors = new Float32Array(maxParticles * 4);
        const sizes = new Float32Array(maxParticles);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: this.config.size,
            vertexColors: true,
            transparent: true,
            blending: this.config.blendMode,
            depthWrite: false,
            sizeAttenuation: true
        });

        if (this.config.texture) {
            material.map = this.config.texture;
        }

        this.pointsObject = new THREE.Points(this.geometry, material);
        scene.add(this.pointsObject);
    }

    emit(): void {
        if (this.particles.length >= this.config.maxParticles!) return;

        const velocity = this.config.velocity!.clone();
        const spread = this.config.velocitySpread!;
        velocity.x += (Math.random() - 0.5) * spread.x * 2;
        velocity.y += (Math.random() - 0.5) * spread.y * 2;
        velocity.z += (Math.random() - 0.5) * spread.z * 2;

        const particle: Particle = {
            position: new THREE.Vector3(0, 0, 0),
            velocity,
            age: 0,
            lifetime: this.config.lifetime! + (Math.random() - 0.5) * 0.5,
            size: this.config.size! + (Math.random() - 0.5) * this.config.sizeSpread! * 2,
            color: this.config.startColor!.clone(),
            alpha: 1
        };

        this.particles.push(particle);
    }

    update(deltaTime: number, worldPosition: THREE.Vector3): void {
        if (!this.isPlaying) return;

        if (this.config.loop || this.particles.length === 0) {
            this.emitAccumulator += deltaTime;
            const emitInterval = 1 / this.config.emissionRate!;

            while (this.emitAccumulator >= emitInterval) {
                this.emit();
                this.emitAccumulator -= emitInterval;
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += deltaTime;

            if (p.age >= p.lifetime) {
                this.particles.splice(i, 1);
                continue;
            }

            p.velocity.add(this.config.gravity!.clone().multiplyScalar(deltaTime));

            p.position.add(p.velocity.clone().multiplyScalar(deltaTime));

            const t = p.age / p.lifetime;
            p.color.lerpColors(this.config.startColor!, this.config.endColor!, t);
            p.alpha = 1 - t;
        }

        this.updateGeometry(worldPosition);
    }

    private updateGeometry(worldPosition: THREE.Vector3): void {
        if (!this.geometry) return;

        const positions = this.geometry.attributes.position.array as Float32Array;
        const colors = this.geometry.attributes.color.array as Float32Array;
        const sizes = this.geometry.attributes.size.array as Float32Array;

        for (let i = 0; i < this.config.maxParticles!; i++) {
            if (i < this.particles.length) {
                const p = this.particles[i];
                positions[i * 3] = worldPosition.x + p.position.x;
                positions[i * 3 + 1] = worldPosition.y + p.position.y;
                positions[i * 3 + 2] = worldPosition.z + p.position.z;

                colors[i * 4] = p.color.r;
                colors[i * 4 + 1] = p.color.g;
                colors[i * 4 + 2] = p.color.b;
                colors[i * 4 + 3] = p.alpha;

                sizes[i] = p.size;
            } else {
                
                positions[i * 3] = 0;
                positions[i * 3 + 1] = -9999;
                positions[i * 3 + 2] = 0;
                sizes[i] = 0;
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
    }

    play(): void {
        this.isPlaying = true;
    }

    stop(): void {
        this.isPlaying = false;
    }

    clear(): void {
        this.particles = [];
    }

    dispose(): void {
        if (this.pointsObject) {
            this.pointsObject.parent?.remove(this.pointsObject);
            (this.pointsObject.material as THREE.Material).dispose();
        }
        this.geometry?.dispose();
    }

    override clone(): ParticleComponent {
        return new ParticleComponent({ ...this.config });
    }
}
