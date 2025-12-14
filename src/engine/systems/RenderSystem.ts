/**
 * RenderSystem - Syncs entity transforms to Three.js objects and renders
 * Runs last in the update loop.
 */

import { System } from '../core/System';
import type { Entity } from '../core/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { RenderComponent } from '../components/RenderComponent';
import { CameraComponent } from '../components/CameraComponent';

export class RenderSystem extends System {
    readonly priority = 99; // Run last
    readonly requiredComponents = [TransformComponent, RenderComponent];

    /** Track added objects */
    private readonly addedObjects: Set<number> = new Set();

    initialize(): void {
        console.log('✅ RenderSystem initialized');
    }

    update(deltaTime: number, entities: Entity[]): void {
        if (!this.app) return;

        // First, handle camera updates
        this.updateCameras(deltaTime);

        // Sync transforms and add to scene
        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent);
            const render = entity.getComponent(RenderComponent);

            if (!transform || !render || !render.object3D) continue;

            // Add to Three.js scene if not already added
            if (!this.addedObjects.has(entity.id)) {
                render.addToScene(this.app.threeScene);
                this.addedObjects.add(entity.id);
            }

            // Update visibility based on entity enabled state
            render.object3D.visible = entity.activeInHierarchy && render.enabled;

            // Sync transform
            render.syncTransform();
        }

        // Remove destroyed entities from scene
        this.cleanupRemovedEntities(entities);
    }

    private updateCameras(deltaTime: number): void {
        if (!this.app) return;

        const entities = this.app.scene.getAllEntities();

        for (const entity of entities) {
            const camera = entity.getComponent(CameraComponent);
            if (!camera || !camera.isActive) continue;

            // Link to app camera
            camera.threeCamera = this.app.camera;
            camera.applyToCamera(this.app.camera);

            // Handle follow camera
            if (camera.followTarget) {
                camera.updateFollow(deltaTime);
            } else {
                camera.syncFromTransform();
            }

            // Only one active camera
            break;
        }
    }

    private cleanupRemovedEntities(currentEntities: Entity[]): void {
        const currentIds = new Set(currentEntities.map(e => e.id));

        for (const id of this.addedObjects) {
            if (!currentIds.has(id)) {
                this.addedObjects.delete(id);
                // Note: Object removal handled by RenderComponent.onDestroy
            }
        }
    }

    /**
     * Force refresh all render components
     */
    refresh(): void {
        this.addedObjects.clear();
    }
}
