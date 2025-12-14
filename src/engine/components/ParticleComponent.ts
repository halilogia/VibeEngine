/**
 * ParticleComponent - Particle emitter configuration
 * Configures particle emission behavior.
 */

import * as THREE from 'three';
import { Component } from '../core/Component';

export interface ParticleConfig {
    /** Maximum number of particles */
    maxParticles?: number;
    /** Emission rate (particles per second) */
    emissionRate?: number;
    /** Particle lifetime in seconds */
    lifetime?: number;
    /** Initial velocity */
    velocity?: THREE.Vector3;
    /** Velocity randomization */
    velocitySpread?: THREE.Vector3;
    /** Particle size */
    size?: number;
    /** Size variation */
    sizeSpread?: number;
    /** Start color */
    startColor?: THREE.Color;
    /** End color */
    endColor?: THREE.Color;
    /** Gravity effect */
    gravity?: THREE.Vector3;
    /** Whether to loop */
    loop?: boolean;
    /** Texture for particles */
    texture?: THREE.Texture | null;
    /** Blend mode */
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

    /** Emitter configuration */
    config: ParticleConfig;

    /** Active particles */
    particles: Particle[] = [];

    /** Time accumulator for emission */
    private emitAccumulator: number = 0;

    /** Whether emitter is active */
    isPlaying: boolean = true;

    /** Three.js Points object */
    pointsObject: THREE.Points | null = null;

    /** Geometry for particles */
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

    /**
     * Initialize the particle system geometry
     */
    initialize(scene: THREE.Scene): void {
        const maxParticles = this.config.maxParticles!;

        // Create geometry
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(maxParticles * 3);
        const colors = new Float32Array(maxParticles * 4);
        const sizes = new Float32Array(maxParticles);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Create material
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

        // Create Points object
        this.pointsObject = new THREE.Points(this.geometry, material);
        scene.add(this.pointsObject);
    }

    /**
     * Emit a single particle
     */
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

    /**
     * Update particles
     */
    update(deltaTime: number, worldPosition: THREE.Vector3): void {
        if (!this.isPlaying) return;

        // Emit new particles
        if (this.config.loop || this.particles.length === 0) {
            this.emitAccumulator += deltaTime;
            const emitInterval = 1 / this.config.emissionRate!;

            while (this.emitAccumulator >= emitInterval) {
                this.emit();
                this.emitAccumulator -= emitInterval;
            }
        }

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += deltaTime;

            if (p.age >= p.lifetime) {
                this.particles.splice(i, 1);
                continue;
            }

            // Apply gravity
            p.velocity.add(this.config.gravity!.clone().multiplyScalar(deltaTime));

            // Update position
            p.position.add(p.velocity.clone().multiplyScalar(deltaTime));

            // Interpolate color
            const t = p.age / p.lifetime;
            p.color.lerpColors(this.config.startColor!, this.config.endColor!, t);
            p.alpha = 1 - t;
        }

        // Update geometry
        this.updateGeometry(worldPosition);
    }

    /**
     * Update Three.js geometry
     */
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
                // Hide unused particles
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

    /**
     * Play the emitter
     */
    play(): void {
        this.isPlaying = true;
    }

    /**
     * Stop the emitter
     */
    stop(): void {
        this.isPlaying = false;
    }

    /**
     * Clear all particles
     */
    clear(): void {
        this.particles = [];
    }

    /**
     * Dispose resources
     */
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
