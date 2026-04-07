import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { System } from "@engine";

export class EditorCameraSystem extends System {
  readonly priority = -100; // Run early to ensure camera is ready

  private orbit: OrbitControls | null = null;
  private target = new THREE.Vector3(0, 0, 0);
  private isDragging = false;

  initialize(): void {
    if (!this.app) return;

    const canvas = this.app.canvas;
    const camera = this.app.camera;

    // Setup Unity-style orbit camera
    this.orbit = new OrbitControls(camera, canvas);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.05;
    this.orbit.screenSpacePanning = true;
    this.orbit.minDistance = 0.1;
    this.orbit.maxDistance = 5000;
    this.orbit.target.copy(this.target);

    // Initial position
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    this.orbit.update();

    console.log("✅ EditorCameraSystem: Viewport controls initialized");
  }

  update(): void {
    // Disable orbit controls when transform gizmo is dragging
    if (this.orbit && this.enabled && !this.isDragging) {
      this.orbit.update();
    }
  }

  /**
   * Called by SelectionGizmoSystem when dragging state changes
   */
  setDraggingState(dragging: boolean): void {
    this.isDragging = dragging;
    if (this.orbit) {
      this.orbit.enabled = !dragging;
    }
  }

  /**
   * Expose orbit controls for external systems that need to listen to events
   */
  getOrbitControls(): OrbitControls | null {
    return this.orbit;
  }

  setTarget(pos: THREE.Vector3): void {
    this.target.copy(pos);
    if (this.orbit) {
      this.orbit.target.copy(pos);
      this.orbit.update();
    }
  }

  destroy(): void {
    if (this.orbit) {
      this.orbit.dispose();
      this.orbit = null;
    }
  }
}
