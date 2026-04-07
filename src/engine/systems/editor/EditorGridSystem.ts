import * as THREE from "three";
import { System } from "@engine";

export class EditorGridSystem extends System {
  readonly priority = -50;

  private grid: THREE.GridHelper | null = null;
  // Removed AxesHelper as it causes origin artifacts

  initialize(): void {
    if (!this.app) return;

    // Create a subtle, professional dark grid
    const size = 1000;
    const divisions = 200;
    const colorCenterLine = 0x242424;
    const colorGrid = 0x1a1a1a;

    this.grid = new THREE.GridHelper(
      size,
      divisions,
      colorCenterLine,
      colorGrid,
    );
    this.grid.name = "EditorGrid";

    // Add transparency to grid lines to prevent Z-fighting and black artifacts
    const materials = Array.isArray(this.grid.material)
      ? this.grid.material
      : [this.grid.material];
    for (const mat of materials) {
      if (mat instanceof THREE.LineBasicMaterial) {
        mat.transparent = true;
        mat.opacity = 0.4;
        mat.depthWrite = false; // Prevent Z-fighting
      }
    }

    this.app.editorScene.add(this.grid);

    console.log("✅ EditorGridSystem: Elite Grid initialized");
  }

  update(): void {
    // Grid could follow camera in X-Z for "infinite" feel
    if (this.app && this.grid) {
      const camera = this.app.camera;
      this.grid.position.x = Math.round(camera.position.x / 10) * 10;
      this.grid.position.z = Math.round(camera.position.z / 10) * 10;
    }
  }

  setVisible(visible: boolean): void {
    if (this.grid) this.grid.visible = visible;
  }

  destroy(): void {
    if (this.app) {
      if (this.grid) this.app.editorScene.remove(this.grid);
    }
  }
}
