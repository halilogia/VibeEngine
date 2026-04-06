

import { System } from '@engine';
import type { Entity } from '@engine';
import { TransformComponent } from '@engine';
import { RenderComponent } from '@engine';
import { CameraComponent } from '@engine';

export class RenderSystem extends System {
    
    readonly priority = 99;

    readonly requiredComponents = [TransformComponent, RenderComponent, CameraComponent];

    private readonly addedObjects: Set<number> = new Set();

    initialize(): void {
        console.log('✅ RenderSystem: Core rendering pipeline initialized');
    }

    update(deltaTime: number, entities: Entity[]): void {
        if (!this.app) return;

        this.updateCameras(deltaTime);

        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent);
            const render = entity.getComponent(RenderComponent);

            if (!transform || !render || !render.object3D) continue;

            if (!this.addedObjects.has(entity.id)) {
                render.addToScene(this.app.threeScene);
                this.addedObjects.add(entity.id);
            }

            render.object3D.visible = entity.activeInHierarchy && render.enabled;

            render.syncTransform();
        }

        this.cleanupRemovedEntities(entities);
    }

    private updateCameras(deltaTime: number): void {
        if (!this.app) return;

        const entities = this.app.scene.getAllEntities();

        for (const entity of entities) {
            const camera = entity.getComponent(CameraComponent);
            if (!camera || !camera.isActive) continue;

            camera.threeCamera = this.app.camera;
            camera.applyToCamera(this.app.camera);

            if (camera.followTarget) {
                camera.updateFollow(deltaTime);
            } else {
                camera.syncFromTransform();
            }

            break;
        }
    }

    private cleanupRemovedEntities(currentEntities: Entity[]): void {
        const currentIds = new Set(currentEntities.map(e => e.id));

        for (const id of this.addedObjects) {
            if (!currentIds.has(id)) {
                this.addedObjects.delete(id);
                
            }
        }
    }

    refresh(): void {
        this.addedObjects.clear();
    }
}
