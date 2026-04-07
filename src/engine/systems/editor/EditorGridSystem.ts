import * as THREE from "three";
import { System } from "@engine";

export class EditorGridSystem extends System {
  readonly priority = -50;

  private gridMesh: THREE.Mesh | null = null;

  initialize(): void {
    if (!this.app) return;

    // Create an ELITE Infinite Grid using Shaders
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: { value: new THREE.Color(0x3b82f6) }, // Sovereign Blue
        uOpacity: { value: 0.15 },
        uLineThickness: { value: 0.02 },
        uBackgroundOpacity: { value: 0.05 },
        uGridScale: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uLineThickness;
        uniform float uBackgroundOpacity;
        uniform float uGridScale;

        float grid(vec2 st, float res) {
          vec2 grid = fract(st * res);
          return (step(1.0 - uLineThickness, grid.x) + step(1.0 - uLineThickness, grid.y));
        }

        void main() {
          vec2 st = vWorldPosition.xz * uGridScale;
          
          // Large main grid
          float g1 = grid(st, 0.1);
          // Finer sub-grid
          float g2 = grid(st, 1.0);
          
          float intensity = max(g1 * 0.8, g2 * 0.3);
          
          // Distance fading (ELITE FADE)
          float dist = distance(vWorldPosition.xz, cameraPosition.xz);
          float falloff = 1.0 - smoothstep(20.0, 100.0, dist);
          
          // Radial center glow
          float centerGlow = 1.0 - smoothstep(0.0, 50.0, length(vWorldPosition.xz));
          
          vec3 finalColor = uColor * (intensity + (centerGlow * 0.2));
          float alpha = (intensity * uOpacity + uBackgroundOpacity) * falloff;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.gridMesh = new THREE.Mesh(geometry, material);
    this.gridMesh.rotation.x = -Math.PI / 2;
    this.gridMesh.scale.set(500, 500, 1);
    this.gridMesh.name = "EliteInfiniteGrid";

    this.app.editorScene.add(this.gridMesh);
    console.log("💎 EditorGridSystem: ELITE Infinite Grid Initialized");
  }

  update(): void {
    if (this.app && this.gridMesh) {
      const camera = this.app.camera;
      // Keep grid centered under camera for infinite effect
      this.gridMesh.position.x = camera.position.x;
      this.gridMesh.position.z = camera.position.z;
    }
  }

  setVisible(visible: boolean): void {
    if (this.gridMesh) this.gridMesh.visible = visible;
  }

  destroy(): void {
    if (this.app && this.gridMesh) {
      this.app.editorScene.remove(this.gridMesh);
    }
  }
}
