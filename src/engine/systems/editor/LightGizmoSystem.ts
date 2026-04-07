import * as THREE from "three";
import { System, Entity, LightComponent, TransformComponent } from "@engine";

export class LightGizmoSystem extends System {
  readonly priority = 1001; // Editor systems run last
  private helpers: Map<number, THREE.Object3D> = new Map();

  initialize(): void {
    console.log("💡 LightGizmoSystem: Viewport Visual Aids Active");
  }

  update(_deltaTime: number, entities: Entity[]): void {
    if (!this.app || !this.enabled) return;

    for (const entity of entities) {
      const lightComp = entity.getComponent(LightComponent);
      const transform = entity.getComponent(TransformComponent);
      if (!lightComp || !transform) continue;

      let helper = this.helpers.get(entity.id) as THREE.Object3D | undefined;

      // Create Helper if missing
      if (!helper) {
          const newHelper = this.createHelper(entity);
          if (newHelper) {
              helper = newHelper;
              this.helpers.set(entity.id, helper);
              this.app.editorScene.add(helper);
          }
      }

      // Update Helper
      if (helper) {
          helper.position.copy(transform.position);
          
          const helperWithUpdate = helper as unknown as { update?: () => void };
          if (typeof helperWithUpdate.update === 'function') {
              helperWithUpdate.update();
          }
          
          // Sync with light target for directional
          if (helper instanceof THREE.DirectionalLightHelper) {
              // The helper needs the actual light instance to update correctly
              // Since LightSystem manages the light, we need a way to link them
              // We'll find the light in the threeScene if possible
          }
      }
    }
  }

  private createHelper(_entity: Entity): THREE.Object3D | null {
    // ELITE: Procedural Light Gizmo (No external dependencies)
    const group = new THREE.Group();
    
    // Create a simple light bulb shape using geometry
    const bulbGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const bulbMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.8,
        depthTest: false
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    group.add(bulb);

    // Add a glow ring
    const ringGeometry = new THREE.RingGeometry(0.2, 0.3, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffaa00,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthTest: false
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.lookAt(new THREE.Vector3(0, 0, 1));
    group.add(ring);

    return group;
  }

  onEntityRemoved(entity: Entity): void {
    const helper = this.helpers.get(entity.id);
    if (helper && this.app) {
      this.app.editorScene.remove(helper);
      this.helpers.delete(entity.id);
    }
  }
}
