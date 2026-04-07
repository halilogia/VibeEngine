import * as THREE from "three";
import { System, Entity, TransformComponent, Component } from "@engine";

/**
 * WaypointComponent: Yolun bir noktasını tanımlar.
 * Note: This is a game-specific component. For a clean engine,
 * consider using a component registry pattern instead.
 */
export class WaypointComponent extends Component {
  static override readonly TYPE = "Waypoint";
  public nextWaypointId: string | number | null = null;
  public radius: number = 2.0;

  constructor(data?: unknown) {
    super();
    if (data) {
      const d = data as { nextWaypointId?: string | number; radius?: number };
      this.nextWaypointId = d.nextWaypointId ?? null;
      this.radius = d.radius ?? 2.0;
    }
  }
}

/**
 * VehicleComponent: Trafikteki bir aracı tanımlar.
 * Note: This is a game-specific component. For a clean engine,
 * consider using a component registry pattern instead.
 */
export class VehicleComponent extends Component {
  static override readonly TYPE = "Vehicle";
  public speed: number = 5.0;
  public currentWaypointId: string | number | null = null;
  public rotationSpeed: number = 3.0;

  constructor(data?: unknown) {
    super();
    if (data) {
      const d = data as { speed?: number; currentWaypointId?: string | number; rotationSpeed?: number };
      this.speed = d.speed ?? 5.0;
      this.currentWaypointId = d.currentWaypointId ?? null;
      this.rotationSpeed = d.rotationSpeed ?? 3.0;
    }
  }
}

/**
 * TrafficSystem: Arabaları yol noktaları arasında hareket ettirir.
 * Note: This is a game-specific system. For a clean engine architecture,
 * game-specific systems should be injected from outside the engine,
 * not hardcoded into Application.ts.
 *
 * TODO: Move this to project-level code and use a plugin system
 * for the engine to accept external systems.
 */
export class TrafficSystem extends System {
  public update(deltaTime: number, entities: Entity[]): void {
    const vehicles = entities.filter((e) => e.hasComponent(VehicleComponent));
    const waypoints = entities.filter((e) => e.hasComponent(WaypointComponent));

    vehicles.forEach((vehicle) => {
      const vComp = vehicle.getComponent(VehicleComponent);
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