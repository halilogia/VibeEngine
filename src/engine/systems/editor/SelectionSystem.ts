import * as THREE from "three";
import {
  System,
  Entity,
  Component,
} from "../../core";
import { RenderComponent } from "../../components/RenderComponent";
import { useEditorStore } from "@infrastructure/store";

/**
 * 🚀 ENGINE-FIRST: SelectionSystem
 * Handles object selection directly in the 3D Viewport via Raycasting.
 * This bypasses the need for global UI listeners and ensures that
 * the Engine is the source of truth for "What is currently active?".
 */
export class SelectionSystem extends System {
  readonly priority = -10; // Pre-Gizmo

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  update(_deltaTime: number, _entities: Entity[]): void {
    // Selection is handled via event listeners
  }

  initialize(): void {
    if (!this.app) return;
    this.app.canvas.addEventListener('mousedown', this.onMouseDown);
    console.log("🖱️ SelectionSystem: Engine-Driven Raycasting Active");
  }

  private onMouseDown = (e: MouseEvent) => {
    if (!this.app) return;

    // Only select on left click and if not dragging a gizmo
    if (e.button !== 0) return;

    // Check if we are clicking on a UI element or the gizmo itself
    // (Gizmo handling is in SelectionGizmoSystem, we check its state)
    // Actually, we can just check if any gizmo is being hovered
    
    const rect = this.app.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.app.camera);

    // 1. Get all renderable objects in scene
    const entities = this.app.scene.getAllEntities();
    const objects: THREE.Object3D[] = [];
    const objToEntity = new Map<THREE.Object3D, number>();

    entities.forEach(entity => {
        const render = entity.getComponent(RenderComponent);
        if (render?.object3D) {
            objects.push(render.object3D);
            objToEntity.set(render.object3D, entity.id);
            // Also include children for recursive raycasting
            render.object3D.traverse(child => {
                if (child instanceof THREE.Mesh) objToEntity.set(child, entity.id);
            });
        }
    });

    const intersects = this.raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
        // Find the root entity id for the intersected object
        let target = intersects[0].object;
        let entityId = objToEntity.get(target);
        
        // Traverse up if needed to find the entity link
        while (!entityId && target.parent) {
            target = target.parent;
            entityId = objToEntity.get(target);
        }

        if (entityId !== undefined) {
            // Check if we are actually clicking the gizmo (don't select through it)
            // Note: Gizmo is usually in editorScene, which we don't raycast here.
            useEditorStore.getState().selectEntity(entityId);
        }
    } else {
        // Clicked on empty space
        // useEditorStore.getState().clearSelection();
    }
  };

  destroy(): void {
    if (this.app) {
      this.app.canvas.removeEventListener('mousedown', this.onMouseDown);
    }
  }
}
