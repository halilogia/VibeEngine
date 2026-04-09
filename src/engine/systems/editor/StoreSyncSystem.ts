import { System, Entity } from "../../core";
import { TransformComponent } from "../../components/TransformComponent";
import { useSceneStore } from "@infrastructure/store";
import * as THREE from "three";

/**
 * 🚀 ENGINE-FIRST: StoreSyncSystem
 * This system is responsible for the INVERSE sync: Engine -> Store.
 * It ensures that when physics or scripts move an object, the React UI knows about it.
 * To prevent performance issues, it uses a throttled/optimized approach.
 */
export class StoreSyncSystem extends System {
  readonly priority = 2000; // Run very last

  private lastSyncTime = 0;
  private readonly SYNC_INTERVAL = 100; // 10 FPS sync is enough for the UI

  update(deltaTime: number, entities: Entity[]): void {
    if (!this.app) return;

    this.lastSyncTime += deltaTime * 1000;
    if (this.lastSyncTime < this.SYNC_INTERVAL) return;
    this.lastSyncTime = 0;

    const store = useSceneStore.getState();
    const storeEntities = store.entities;

    entities.forEach(entity => {
      const transform = entity.getComponent(TransformComponent);
      if (!transform) return;

      const storeData = storeEntities.get(entity.id);
      if (!storeData) return;

      // Check for significant change to avoid unnecessary React re-renders
      const storePos = storeData.components.find(c => c.type === 'Transform')?.data.position as number[];
      
      if (storePos) {
        const distSq = 
          Math.pow(transform.position.x - storePos[0], 2) +
          Math.pow(transform.position.y - storePos[1], 2) +
          Math.pow(transform.position.z - storePos[2], 2);

        // If moved more than 0.01 units, sync to store
        if (distSq > 0.0001) {
          store.updateComponent(entity.id, 'Transform', {
            position: [transform.position.x, transform.position.y, transform.position.z],
            rotation: [
                THREE.MathUtils.radToDeg(transform.rotation.x),
                THREE.MathUtils.radToDeg(transform.rotation.y),
                THREE.MathUtils.radToDeg(transform.rotation.z)
            ],
            scale: [transform.scale.x, transform.scale.y, transform.scale.z]
          });
        }
      }
    });
  }
}
