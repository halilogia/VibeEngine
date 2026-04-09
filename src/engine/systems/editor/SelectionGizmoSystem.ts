import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { System, Entity, RenderComponent, TransformComponent } from "@engine";
import { useEditorStore, useSceneStore } from "@infrastructure/store";
import { EditorCameraSystem } from "./EditorCameraSystem";

export class SelectionGizmoSystem extends System {
  readonly priority = 100;

  private gizmo: TransformControls | null = null;
  private selectedEntity: Entity | null = null;
  private unsubscribe: (() => void) | null = null;

  initialize(): void {
    if (!this.app) return;

    this.gizmo = new TransformControls(this.app.camera, this.app.canvas);
    this.gizmo.setSize(0.6);
    this.gizmo.setSpace("local");
    this.gizmo.visible = false;
    this.gizmo.name = "SelectionGizmo";

    this.gizmo.showX = true;
    this.gizmo.showY = true;
    this.gizmo.showZ = true;

    this.gizmo.addEventListener("mouseDown", () => {
      this.hideGizmoPlanes();
    });
    this.hideGizmoPlanes();

    this.app.editorScene.add(this.gizmo);

    this.gizmo.addEventListener("dragging-changed", (event) => {
      if (this.app) {
        const cameraSystem = this.app.getSystem(EditorCameraSystem);
        if (cameraSystem) {
          cameraSystem.setDraggingState(event.value as boolean);
        }
      }
    });

    this.gizmo.addEventListener("objectChange", () => {
      if (this.selectedEntity && this.gizmo?.object) {
        const mesh = this.gizmo.object;
        
        // 🚀 ENGINE-FIRST: Update the engine internal state immediately
        // This makes the movement perfectly smooth regardless of React's speed
        const transform = this.selectedEntity.getComponent(TransformComponent);
        if (transform) {
          transform.position.copy(mesh.position);
          transform.rotation.copy(mesh.rotation);
          transform.scale.copy(mesh.scale);
        }
      }
    });

    // Sync back to store only when dragging is FINISHED (Efficiency)
    this.gizmo.addEventListener("mouseDown", () => {
        this.app!.getSystem(EditorCameraSystem)?.setDraggingState(true);
    });

    this.gizmo.addEventListener("mouseUp", () => {
        this.app!.getSystem(EditorCameraSystem)?.setDraggingState(false);
        
        if (this.selectedEntity && this.gizmo?.object) {
            const mesh = this.gizmo.object;
            useSceneStore.getState().updateComponent(this.selectedEntity.id, "Transform", {
                position: [mesh.position.x, mesh.position.y, mesh.position.z],
                rotation: [
                  THREE.MathUtils.radToDeg(mesh.rotation.x),
                  THREE.MathUtils.radToDeg(mesh.rotation.y),
                  THREE.MathUtils.radToDeg(mesh.rotation.z),
                ],
                scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
            });
        }
    });

    this.unsubscribe = useEditorStore.subscribe((state) => {
      this.handleSelectionChange(state.selectedEntityId);
      this.handleModeChange(state.editorMode);
    });

    console.log("✅ SelectionGizmoSystem: Editor helpers initialized");
  }

  private handleSelectionChange(id: number | null): void {
    if (!this.app || !this.gizmo) return;

    if (id !== null) {
      const foundEntity = this.app.scene.getEntityById(id);

      if (foundEntity) {
        const render = foundEntity.getComponent(RenderComponent);
        if (render && render.object3D) {
          this.selectedEntity = foundEntity;
          this.gizmo.attach(render.object3D);
          this.gizmo.visible = true;
        } else {
          this.selectedEntity = null;
          this.gizmo.detach();
          this.gizmo.visible = false;
        }
      } else {
        this.selectedEntity = null;
        this.gizmo.detach();
        this.gizmo.visible = false;
      }
    } else {
      this.selectedEntity = null;
      this.gizmo.detach();
      this.gizmo.visible = false;
    }
  }

  private handleModeChange(mode: "translate" | "rotate" | "scale"): void {
    if (this.gizmo) {
      this.gizmo.setMode(mode);
      this.hideGizmoPlanes();
    }
  }

  private hideGizmoPlanes(): void {
    if (!this.gizmo) return;
    this.gizmo.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name;
        const isPicker = name.includes("Picker");
        const isPlane =
          (name.includes("X") && name.includes("Y")) ||
          (name.includes("Y") && name.includes("Z")) ||
          (name.includes("X") && name.includes("Z"));
        if (isPicker || isPlane) {
          child.visible = false;
        }
      }
    });
  }

  update(_deltaTime: number): void {
    if (this.gizmo) {
      this.gizmo.visible = this.selectedEntity !== null;
    }
  }

  destroy(): void {
    this.unsubscribe?.();
    if (this.gizmo) {
      this.gizmo.dispose();
      this.gizmo = null;
    }
  }
}