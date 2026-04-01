/**
 * VibePhysics - High-Performance Physics Engine
 * Powered by Rapier.js (@dimforge/rapier3d-compat)
 * Million-Dollar Industry Standard Integration 🏛️💎
 */

import RAPIER from '@dimforge/rapier3d-compat';

export type { RigidBody, Collider } from '@dimforge/rapier3d-compat';

export class VibePhysics {
    private static instance: VibePhysics;
    private world: RAPIER.World | null = null;
    private initialized: boolean = false;

    private constructor() {}

    public static getInstance(): VibePhysics {
        if (!VibePhysics.instance) {
            VibePhysics.instance = new VibePhysics();
        }
        return VibePhysics.instance;
    }

    /**
     * Initialize the Rapier WASM engine.
     * Must be called before any other VibePhysics method.
     */
    public async initialize(): Promise<void> {
        if (this.initialized) return;

        await RAPIER.init();

        // Gravity: Standard earth gravity (0, -9.81, 0)
        const gravity = { x: 0.0, y: -9.81, z: 0.0 };
        this.world = new RAPIER.World(gravity);

        this.initialized = true;
        console.log('🏗️ [VibePhysics] Rapier Engine Ready (WASM)');
    }

    /**
     * Step the physics world forward
     */
    public step(deltaTime: number): void {
        if (this.world) {
            this.world.timestep = deltaTime;
            this.world.step();
        }
    }

    /**
     * Create a dynamic rigid body with a box collider
     */
    public createBox(
        x: number, y: number, z: number,
        size: number = 1
    ): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
        if (!this.world) throw new Error('[VibePhysics] World not initialized. Call initialize() first.');

        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
        const body = this.world.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.cuboid(size / 2, size / 2, size / 2);
        const collider = this.world.createCollider(colliderDesc, body);

        return { body, collider };
    }

    public getWorld(): RAPIER.World | null {
        return this.world;
    }
}

