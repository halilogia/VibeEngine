import { System, Entity, TransformComponent, FollowCameraComponent, CameraComponent } from "@engine";
import * as THREE from "three";

export class FollowCameraSystem extends System {
  readonly priority = 200; // Run after physics and regular updates

  readonly requiredComponents = [
    TransformComponent,
    FollowCameraComponent,
    CameraComponent
  ];

  private readonly tempTargetPos = new THREE.Vector3();
  private readonly tempIdealPos = new THREE.Vector3();
  private readonly tempLookAtPos = new THREE.Vector3();

  update(deltaTime: number, entities: Entity[]): void {
    if (!this.app) return;

    for (const entity of entities) {
      const follow = entity.getComponent(FollowCameraComponent);
      const camera = entity.getComponent(CameraComponent);
      const transform = entity.getComponent(TransformComponent);

      if (!follow || !camera || !transform || !follow.targetId) continue;

      const targetEntity = this.app.scene.getEntityById(follow.targetId);
      if (!targetEntity) continue;

      const targetTransform = targetEntity.getComponent(TransformComponent);
      if (!targetTransform) continue;

      // Calculate desired position in world space
      // 1. Get target position
      this.tempTargetPos.copy(targetTransform.position);
      
      // 2. Calculate ideal position based on target's orientation
      const targetQuat = new THREE.Quaternion().setFromEuler(targetTransform.rotation);
      this.tempIdealPos.copy(follow.offset).applyQuaternion(targetQuat).add(this.tempTargetPos);

      // 3. Smoothly interpolate current camera position to ideal position
      transform.position.lerp(this.tempIdealPos, follow.smoothSpeed);

      // 4. Calculate where to look
      this.tempLookAtPos.copy(follow.lookOffset).applyQuaternion(targetQuat).add(this.tempTargetPos);
      
      // 5. Update camera to look at the look-at point
      // For now we just use a simple LookAt on the transform
      // In progress: implement smooth rotation lerping
      if (camera.threeCamera) {
          camera.threeCamera.position.copy(transform.position);
          camera.threeCamera.lookAt(this.tempLookAtPos);
          
          // Sync transform rotation back
          transform.rotation.setFromQuaternion(camera.threeCamera.quaternion);
      }
    }
  }
}
