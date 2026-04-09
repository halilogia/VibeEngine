import { Component } from "../core/Component";

export class TrafficFollowerComponent extends Component {
  static override readonly TYPE = "TrafficFollower";
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

  override clone(): TrafficFollowerComponent {
    return new TrafficFollowerComponent({
      speed: this.speed,
      currentWaypointId: this.currentWaypointId,
      rotationSpeed: this.rotationSpeed,
    });
  }

  override toJSON(): Record<string, unknown> {
    return {
      type: TrafficFollowerComponent.TYPE,
      speed: this.speed,
      currentWaypointId: this.currentWaypointId,
      rotationSpeed: this.rotationSpeed,
    };
  }
}
