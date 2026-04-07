import * as THREE from "three";
import { System, Entity, LightComponent, TransformComponent } from "@engine";

export class LightSystem extends System {
  readonly priority = 20;
  private lightMap: Map<number, THREE.Light> = new Map();

  initialize(): void {
    console.log("🔦 LightSystem: Pro Cinematic Lighting Ready");
  }

  update(_deltaTime: number, entities: Entity[]): void {
    if (!this.app) return;

    for (const entity of entities) {
      const lightComp = entity.getComponent(LightComponent);
      const transform = entity.getComponent(TransformComponent);
      if (!lightComp) continue;

      let light = this.lightMap.get(entity.id);

      // Create Three.js Light if needed
      if (!light) {
        light = this.createLight(lightComp);
        this.lightMap.set(entity.id, light);
        this.app.threeScene.add(light);
      }

      // Sync settings
      light.color.set(lightComp.color);
      light.intensity = lightComp.intensity;
      light.castShadow = lightComp.castShadow;

      if (light instanceof THREE.DirectionalLight || light instanceof THREE.SpotLight || light instanceof THREE.PointLight) {
        if (light.shadow) {
            light.shadow.bias = lightComp.shadowBias;
            light.shadow.mapSize.set(lightComp.shadowMapSize, lightComp.shadowMapSize);
        }
      }

      if (light instanceof THREE.PointLight || light instanceof THREE.SpotLight) {
        light.distance = lightComp.distance;
        light.decay = lightComp.decay;
      }

      if (light instanceof THREE.SpotLight) {
        light.angle = lightComp.angle;
        light.penumbra = lightComp.penumbra;
      }

      // Sync position/rotation from transform
      if (transform) {
        light.position.copy(transform.position);
        
        if (light instanceof THREE.DirectionalLight || light instanceof THREE.SpotLight) {
            const targetPos = transform.position.clone().add(new THREE.Vector3(0, -1, 0).applyQuaternion(transform.quaternion));
            light.target.position.copy(targetPos);
            light.target.updateMatrixWorld();
        }
      }
    }
  }

  private createLight(comp: LightComponent): THREE.Light {
    switch (comp.lightType) {
      case "ambient": return new THREE.AmbientLight();
      case "directional": return new THREE.DirectionalLight();
      case "point": return new THREE.PointLight();
      case "spot": return new THREE.SpotLight();
    }
  }

  onEntityRemoved(entity: Entity): void {
    const light = this.lightMap.get(entity.id);
    if (light && this.app) {
      this.app.threeScene.remove(light);
      this.lightMap.delete(entity.id);
    }
  }

  destroy(): void {
    this.lightMap.forEach(light => {
        if (this.app) this.app.threeScene.remove(light);
    });
    this.lightMap.clear();
  }
}
