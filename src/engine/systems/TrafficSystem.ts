import * as THREE from "three";
import { System, Entity, TransformComponent, Component } from "@engine";

import { WaypointComponent } from "../components/WaypointComponent";
import { TrafficFollowerComponent } from "../components/TrafficFollowerComponent";

/**
 * TrafficSystem: Arabaları yol noktaları arasında hareket ettirir.
 */
export class TrafficSystem extends System {
  public update(deltaTime: number, entities: Entity[]): void {
    const vehicles = entities.filter((e) => e.hasComponent(TrafficFollowerComponent));
    const waypoints = entities.filter((e) => e.hasComponent(WaypointComponent));

    vehicles.forEach((vehicle) => {
      const vComp = vehicle.getComponent(TrafficFollowerComponent);
      const vTransform = vehicle.getComponent(TransformComponent);

      if (!vComp || !vTransform) return;

      if (vComp.currentWaypointId === null && waypoints.length > 0) {
        const closest = this.findClosestWaypoint(
          vTransform.position,
          waypoints,
        );
        if (closest) {
          vComp.currentWaypointId = closest.id;
        }
      }

      const targetWaypoint = waypoints.find(
        (w) => w.id === vComp.currentWaypointId,
      );
      if (!targetWaypoint) return;

      const wTransform = targetWaypoint.getComponent(TransformComponent);
      const wComp = targetWaypoint.getComponent(WaypointComponent);
      if (!wTransform || !wComp) return;

      this.moveVehicleTowards(
        vTransform,
        wTransform.position,
        vComp.speed,
        vComp.rotationSpeed,
        deltaTime,
      );

      const dist = vTransform.position.distanceTo(wTransform.position);
      if (dist < wComp.radius) {
        vComp.currentWaypointId = wComp.nextWaypointId;

        if (vComp.currentWaypointId === null && waypoints.length > 0) {
          vComp.currentWaypointId = waypoints[0].id;
        }
      }
    });
  }

  private findClosestWaypoint(
    pos: THREE.Vector3,
    waypoints: Entity[],
  ): Entity | null {
    let minPlayerDist = Infinity;
    let closest: Entity | null = null;

    waypoints.forEach((w) => {
      const wTransform = w.getComponent(TransformComponent);
      if (!wTransform) return;
      const dist = pos.distanceTo(wTransform.position);
      if (dist < minPlayerDist) {
        minPlayerDist = dist;
        closest = w;
      }
    });

    return closest;
  }

  private moveVehicleTowards(
    transform: TransformComponent,
    target: THREE.Vector3,
    speed: number,
    rotSpeed: number,
    dt: number,
  ): void {
    const dir = new THREE.Vector3()
      .subVectors(target, transform.position)
      .normalize();
    transform.position.addScaledVector(dir, speed * dt);

    const targetQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      dir,
    );
    transform.quaternion.slerp(targetQuat, rotSpeed * dt);
  }
}