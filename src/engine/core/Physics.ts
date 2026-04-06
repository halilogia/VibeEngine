

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

    public async initialize(): Promise<void> {
        if (this.initialized) return;

        await RAPIER.init();

        const gravity = { x: 0.0, y: -9.81, z: 0.0 };
        this.world = new RAPIER.World(gravity);

        this.initialized = true;
        console.log('🏗️ [VibePhysics] Rapier Engine Ready (WASM)');
    }

    public step(deltaTime: number): void {
        if (this.world) {
            this.world.timestep = deltaTime;
            this.world.step();
        }
    }

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

