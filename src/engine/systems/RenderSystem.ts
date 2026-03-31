/**
 * RenderSystem - Syncs entity transforms to Three.js objects and renders
 * Runs last in the update loop.
 */

import { System } from '../core/System';
import type { Entity } from '../core/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { RenderComponent } from '../components/RenderComponent';
import { CameraComponent } from '../components/CameraComponent';

/**
 * RenderSystem - Core engine system responsible for visualizing the scene.
 * It synchronizes Entity transforms with Three.js Object3D instances,
 * manages active cameras, and ensures low-level Three.js scene integrity.
 */
export class RenderSystem extends System {
    /** 
     * Priority set to 99 ensures rendering happens after all physics,
     * script updates, and animations are completed for the frame.
     */
    readonly priority = 99;

    /** Required components for an entity to be processed by this system. */
    readonly requiredComponents = [TransformComponent, RenderComponent, CameraComponent];

    /** Track currently active objects in the Three.js scene to avoid redundant additions */
    private readonly addedObjects: Set<number> = new Set();

    /**
     * Initializes the RenderSystem.
     */
    initialize(): void {
        console.log('✅ RenderSystem: Core rendering pipeline initialized');
    }

    /**
     * Main update loop for the RenderSystem.
     * @param deltaTime - Time passed since the last frame (in seconds).
     * @param entities - List of entities matching the requiredComponents filter.
     */
    update(deltaTime: number, entities: Entity[]): void {
        if (!this.app) return;

        // First, handle camera updates to ensure we render from the correct perspective
        this.updateCameras(deltaTime);

        // Sync transforms and handle scene entry for each entity
        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent);
            const render = entity.getComponent(RenderComponent);

            if (!transform || !render || !render.object3D) continue;

            // Add to Three.js scene if not already tracked
            if (!this.addedObjects.has(entity.id)) {
                render.addToScene(this.app.threeScene);
                this.addedObjects.add(entity.id);
            }

            // Sync visibility with the ECS hierarchy state
            render.object3D.visible = entity.activeInHierarchy && render.enabled;

            // Update spatial data (position, rotation, scale)
            render.syncTransform();
        }

        // Cleanup any objects that are no longer part of the current active set
        this.cleanupRemovedEntities(entities);
    }

    /**
     * Updates the global active camera based on CameraComponents found in the scene.
     * @param deltaTime - delta time for smooth follow calculations.
     */
    private updateCameras(deltaTime: number): void {
        if (!this.app) return;

        const entities = this.app.scene.getAllEntities();

        for (const entity of entities) {
            const camera = entity.getComponent(CameraComponent);
            if (!camera || !camera.isActive) continue;

            // Sync the engine's main camera reference
            camera.threeCamera = this.app.camera;
            camera.applyToCamera(this.app.camera);

            // Dynamically update camera behavior (Lerp follow vs static sync)
            if (camera.followTarget) {
                camera.updateFollow(deltaTime);
            } else {
                camera.syncFromTransform();
            }

            // Early exit after finding the primary active camera
            break;
        }
    }

    /**
     * Internal tracking cleanup to ensure Three.js scene matches the ECS state.
     * @param currentEntities - The set of entities currently active in the system.
     */
    private cleanupRemovedEntities(currentEntities: Entity[]): void {
        const currentIds = new Set(currentEntities.map(e => e.id));

        for (const id of this.addedObjects) {
            if (!currentIds.has(id)) {
                this.addedObjects.delete(id);
                // The actual object removal from Three.js is managed by RenderComponent.onDestroy
            }
        }
    }

    /**
     * Forces the RenderSystem to re-add all objects to the scene on the next frame.
     * Useful when switching scenes or major hierarchy reshuffles.
     */
    refresh(): void {
        this.addedObjects.clear();
    }
}
