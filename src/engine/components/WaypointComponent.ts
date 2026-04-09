import { Component } from "../core/Component";

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

  clone(): WaypointComponent {
    return new WaypointComponent({
      nextWaypointId: this.nextWaypointId,
      radius: this.radius,
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      type: WaypointComponent.TYPE,
      nextWaypointId: this.nextWaypointId,
      radius: this.radius,
    };
  }
}
