import { System, Entity, TransformComponent, RigidbodyComponent, VehicleControllerComponent, InputSystem } from "@engine";
import * as THREE from "three";

export class VehicleSystem extends System {
  readonly priority = 50;

  readonly requiredComponents = [
    TransformComponent,
    RigidbodyComponent,
    VehicleControllerComponent
  ];

  update(deltaTime: number, entities: Entity[]): void {
    if (!this.app) return;
    const input = this.app.getSystem(InputSystem);
    if (!input) return;

    for (const entity of entities) {
      const vehicle = entity.getComponent(VehicleControllerComponent);
      const rb = entity.getComponent(RigidbodyComponent);
      const transform = entity.getComponent(TransformComponent);

      if (!vehicle || !rb || !transform || !rb.handle) continue;

      // 1. Get Input Values
      const moveForward = input.getAction(vehicle.inputForward);
      const moveBackward = input.getAction(vehicle.inputBackward);
      const turnLeft = input.getAction(vehicle.inputLeft);
      const turnRight = input.getAction(vehicle.inputRight);
      const isBraking = input.getButton(vehicle.inputBrake);

      const vertical = moveForward - moveBackward;
      const horizontal = turnRight - turnLeft;

      // 2. Calculate Local Directions
      const quat = new THREE.Quaternion().setFromEuler(transform.rotation);
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);

      // 3. Apply Acceleration / Braking
      if (Math.abs(vertical) > 0.1) {
        const force = forward.clone().multiplyScalar(vertical * vehicle.acceleration * deltaTime * 100);
        rb.handle.applyImpulse({ x: force.x, y: force.y, z: force.z }, true);
      }

      // 4. Apply Steering
      if (Math.abs(horizontal) > 0.1) {
        // Torque depends on speed to avoid spinning at standstill
        const currentVel = rb.handle.linvel();
        const speed = Math.sqrt(currentVel.x ** 2 + currentVel.z ** 2);
        const steeringMultiplier = Math.min(speed * 0.5, 1.0);
        
        const torque = -horizontal * vehicle.steeringSensitivity * steeringMultiplier * deltaTime * 50;
        rb.handle.applyTorqueImpulse({ x: 0, y: torque, z: 0 }, true);
      }

      // 5. Linear Friction / Air Resistance (Custom)
      const velocity = rb.handle.linvel();
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
      
      if (speed > vehicle.maxSpeed) {
        const reduction = vehicle.maxSpeed / speed;
        rb.handle.setLinvel({ x: velocity.x * reduction, y: velocity.y * reduction, z: velocity.z * reduction }, true);
      }
      
      // 6. Drift / Lateral Friction
      // Project velocity onto the right vector and reduce it
      const velVec = new THREE.Vector3(velocity.x, velocity.y, velocity.z);
      const lateralVel = right.clone().multiplyScalar(velVec.dot(right));
      const lateralReduced = lateralVel.clone().multiplyScalar(vehicle.driftFactor);
      
      const newVel = velVec.sub(lateralVel).add(lateralReduced);
      rb.handle.setLinvel({ x: newVel.x, y: newVel.y, z: newVel.z }, true);

      // 7. Braking
      if (isBraking) {
        const currentVel = rb.handle.linvel();
        rb.handle.setLinvel({ 
            x: currentVel.x * 0.95, 
            y: currentVel.y, 
            z: currentVel.z * 0.95 
        }, true);
      }
      
      // Update component state for UI/HUD
      vehicle.currentSpeed = speed;
      vehicle.currentSteering = horizontal;
      vehicle.isBraking = isBraking;
    }
  }
}
