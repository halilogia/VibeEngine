import {
  System,
  Entity,
  CheckpointComponent,
  VehicleControllerComponent,
  PhysicsSystem,
} from "@engine";

export interface LapInfo {
  lap: number;
  time: number;
}

export interface PlayerRaceState {
  currentLap: number;
  checkpointsVisited: Set<number>;
  startTime: number;
  currentTime: number;
  lastLapTime: number;
  bestLapTime: number;
  isFinished: boolean;
}

export interface VibeRaceStateData {
  speed: number;
  lap: number;
  totalLaps: number;
  time: number;
  isFinished: boolean;
}

export class RaceSystem extends System {
  readonly priority = 60; // After Vehicle and Physics

  private playerStats = new Map<number, PlayerRaceState>();
  private totalLaps: number = 3;

  update(deltaTime: number, entities: Entity[]): void {
    if (!this.app) return;
    const physics = this.app.getSystem(PhysicsSystem);
    if (!physics) return;

    // 1. Update existing race stats (Timer)
    for (const [entityId, stats] of this.playerStats) {
      if (!stats.isFinished) {
        stats.currentTime += deltaTime;
      }
    }

    // 2. Check for triggers
    for (const entity of entities) {
      const vehicle = entity.getComponent(VehicleControllerComponent);
      if (!vehicle) continue;

      // Ensure entity has race stats
      if (!this.playerStats.has(entity.id)) {
        this.playerStats.set(entity.id, {
          currentLap: 1,
          checkpointsVisited: new Set(),
          startTime: Date.now(),
          currentTime: 0,
          lastLapTime: 0,
          bestLapTime: Infinity,
          isFinished: false,
        });
      }

      const stats = this.playerStats.get(entity.id)!;
      if (stats.isFinished) continue;

      // Look for sensors colliding with this vehicle
      for (const [sensorId, visitors] of physics.activeTriggers) {
        if (visitors.has(entity.id)) {
          const sensorEntity = this.app.scene.getEntityById(sensorId);
          const checkpoint = sensorEntity?.getComponent(CheckpointComponent);

          if (checkpoint) {
            this.handleCheckpointHit(entity.id, stats, checkpoint);
          }
        }
      }

      (window as unknown as { VibeRaceState?: VibeRaceStateData }).VibeRaceState = {
        speed: Math.round(vehicle.currentSpeed * 3.6), // Convert to km/h
        lap: stats.currentLap,
        totalLaps: this.totalLaps,
        time: stats.currentTime,
        isFinished: stats.isFinished,
      };
    }
  }

  private handleCheckpointHit(
    entityId: number,
    stats: PlayerRaceState,
    checkpoint: CheckpointComponent,
  ) {
    // 1. Finish Line / Lap Complete
    if (checkpoint.isFinishLine) {
      // Verify all checkpoints visited? Skip for arcade feel but usually needed.
      // For now: Just passing finish line increments lap.
      if (stats.checkpointsVisited.size > 0 || stats.currentLap === 1) {
        if (stats.currentTime > 5) {
          // Debounce finish line
          stats.lastLapTime = stats.currentTime;
          if (stats.lastLapTime < stats.bestLapTime)
            stats.bestLapTime = stats.lastLapTime;

          if (stats.currentLap >= this.totalLaps) {
            stats.isFinished = true;
            console.log(
              `🏁 Race Complete for Entity ${entityId}! Time: ${stats.currentTime.toFixed(2)}`,
            );
          } else {
            stats.currentLap++;
            stats.currentTime = 0;
            stats.checkpointsVisited.clear();
            console.log(`⏱️ Lap ${stats.currentLap} started!`);
          }
        }
      }
    } else {
      // Regular checkpoint
      stats.checkpointsVisited.add(checkpoint.index);
    }
  }
}
