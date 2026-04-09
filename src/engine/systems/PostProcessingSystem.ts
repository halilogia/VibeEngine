import * as THREE from "three";
import { System, Entity, PostProcessingComponent, RenderComponent } from "@engine";
import { useEditorStore } from "@infrastructure/store";

export class PostProcessingSystem extends System {
  readonly priority = 1000; // Run last to apply visual state

  initialize(): void {
    console.log("🎬 PostProcessingSystem: Cinematic Visual Pipeline Engaged");
  }

  update(_deltaTime: number, entities: Entity[]): void {
    // Find first active post-processing config in scene
    const pp = entities.find(e => e.hasComponent(PostProcessingComponent))?.getComponent(PostProcessingComponent);
    if (!pp || !this.app) return;

    // Apply Bloom Settings
    const bloom = this.app.bloomPass;
    if (bloom) {
        bloom.enabled = pp.bloomEnabled;
        bloom.strength = pp.bloomStrength;
        bloom.radius = pp.bloomRadius;
        bloom.threshold = pp.bloomThreshold;
    }

    // Apply Outline to Selected Object (Unity/Godot Style)
    if (this.app.outlinePass) {
        const selectedId = useEditorStore.getState().selectedEntityId;
        if (selectedId !== null) {
            const entity = this.app.scene.getEntityById(selectedId);
            const render = entity?.getComponent(RenderComponent);
            if (render?.object3D) {
                this.app.outlinePass.selectedObjects = [render.object3D];
            } else {
                this.app.outlinePass.selectedObjects = [];
            }
        } else {
            this.app.outlinePass.selectedObjects = [];
        }
    }

    // Apply Renderer Settings
    const renderer = this.app.renderer;
    if (renderer) {
        // Only update if changed to avoid expensive state updates
        if (renderer.toneMappingExposure !== pp.exposure) {
            renderer.toneMappingExposure = pp.exposure;
        }
        if (renderer.toneMapping !== pp.toneMapping) {
            renderer.toneMapping = pp.toneMapping as THREE.ToneMapping;
        }
    }
  }
}
