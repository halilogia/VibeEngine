import * as THREE from "three";
import { System, Entity, RenderComponent, SeaComponent } from "@engine";
import { oceanVertexShader } from "./shaders/ocean.vert.glsl";
import { oceanFragmentShader } from "./shaders/ocean.frag.glsl";

export class OceanSystem extends System {
  readonly priority = 10;
  private time = 0;

  initialize(): void {
    console.log("🌊 OceanSystem: Wave Core and High-Fidelity Water Physics Ready");
  }

  update(deltaTime: number, entities: Entity[]): void {
    this.time += deltaTime;

    for (const entity of entities) {
      const sea = entity.getComponent(SeaComponent);
      const render = entity.getComponent(RenderComponent);

      if (sea && render && render.object3D instanceof THREE.Mesh) {
        const mesh = render.object3D;

        // Upgrade standard material to ELITE Ocean Shader if needed
        if (!(mesh.material instanceof THREE.ShaderMaterial && mesh.material.name === "EliteOceanShader")) {
          mesh.material = this.createOceanMaterial(sea);
          // Increase tessellation for beautiful waves
          mesh.geometry = new THREE.PlaneGeometry(10, 10, 128, 128);
          mesh.rotation.x = -Math.PI / 2;
        }

        // Update uniforms
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = this.time * sea.speed;
        mat.uniforms.uAmplitude.value = sea.amplitude;
        mat.uniforms.uFrequency.value = sea.frequency;
        mat.uniforms.uColor.value.set(sea.color);
      }
    }
  }

  private createOceanMaterial(sea: SeaComponent): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      name: "EliteOceanShader",
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(sea.color) },
        uAmplitude: { value: sea.amplitude },
        uFrequency: { value: sea.frequency },
      },
      vertexShader: oceanVertexShader,
      fragmentShader: oceanFragmentShader,
      side: THREE.DoubleSide,
    });
  }
}
