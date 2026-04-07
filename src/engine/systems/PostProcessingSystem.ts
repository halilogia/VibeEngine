import * as THREE from "three";
import { System, Entity, PostProcessingComponent } from "@engine";

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
