import { System } from "@engine";
import type { Entity } from "@engine";
import { TransformComponent } from "@engine";
import { RenderComponent } from "@engine";
import { CameraComponent } from "@engine";

export class RenderSystem extends System {
  readonly priority = 99;

  readonly requiredComponents = [
    TransformComponent,
    RenderComponent,
  ];

  private readonly addedObjects: Set<number> = new Set();

  initialize(): void {
    console.log("✅ RenderSystem: Core rendering pipeline initialized");
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

  private activeCameraEntity: Entity | null = null;

  private updateCameras(deltaTime: number): void {
    if (!this.app) return;

    // Cache the active camera entity to avoid searching every frame
    if (
      !this.activeCameraEntity ||
      !this.activeCameraEntity.getComponent(CameraComponent)?.isActive
    ) {
      const entities = this.app.scene.getAllEntities();
      this.activeCameraEntity =
        entities.find((e) => {
          const cam = e.getComponent(CameraComponent);
          return cam && cam.isActive;
        }) || null;
    }

    if (this.activeCameraEntity) {
      const camera = this.activeCameraEntity.getComponent(CameraComponent);
      if (!camera) return;

      camera.threeCamera = this.app.camera;
      camera.applyToCamera(this.app.camera);

      if (camera.followTarget) {
        camera.updateFollow(deltaTime);
      } else {
        camera.syncFromTransform();
      }
    }
  }

  private cleanupRemovedEntities(currentEntities: Entity[]): void {
    const currentIds = new Set(currentEntities.map((e) => e.id));

    for (const id of this.addedObjects) {
      if (!currentIds.has(id)) {
        this.addedObjects.delete(id);
      }
    }

    // Invalidate camera cache if the cached entity was removed
    if (
      this.activeCameraEntity &&
      !currentIds.has(this.activeCameraEntity.id)
    ) {
      this.activeCameraEntity = null;
    }
  }

  refresh(): void {
    this.addedObjects.clear();
  }
}
