import * as THREE from "three";
import { System } from "@engine";

export class EditorGridSystem extends System {
  readonly priority = -50;

  private gridMesh: THREE.Mesh | null = null;

  initialize(): void {
    if (!this.app) return;

    // --- Infinite Grid Shader ---
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x334466) },
        uSecondaryColor: { value: new THREE.Color(0x1a2233) },
        uFadeDistance: { value: 800 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        uniform vec3 uColor;
        uniform vec3 uSecondaryColor;
        uniform float uFadeDistance;

        float grid(vec2 uv, float res) {
          vec2 grid = fract(uv * res);
          float line = min(grid.x, grid.y);
          return 1.0 - smoothstep(0.0, 0.02, line);
        }

        void main() {
          float dist = length(vWorldPos.xz);
          float alpha = 1.0 - smoothstep(0.0, uFadeDistance, dist);
          
          // Main grid (1m)
          float g1 = grid(vWorldPos.xz, 1.0);
          // Large grid (10m)
          float g2 = grid(vWorldPos.xz, 0.1);
          
          vec3 col = mix(uSecondaryColor, uColor, g1 * 0.5 + g2);
          float finalAlpha = (g1 * 0.2 + g2 * 0.5) * alpha;

          if (finalAlpha < 0.01) discard;
          gl_FragColor = vec4(col, finalAlpha);
        }
      `,
    });

    this.gridMesh = new THREE.Mesh(geometry, material);
    this.gridMesh.rotation.x = -Math.PI / 2;
    this.gridMesh.renderOrder = -1; // Behind objects but before background
    this.app.threeScene.add(this.gridMesh);

    // --- Center Axes (RGB Helper) ---
    const axesHelper = new THREE.AxesHelper(5);
    (axesHelper.material as THREE.Material).depthTest = false;
    axesHelper.renderOrder = 10;
    this.app.threeScene.add(axesHelper);

    this.updateBackground();
    console.log("💎 EditorGridSystem: Infinite Adaptive Grid Engaged");
  }

  private updateBackground(): void {
    if (!this.app) return;

    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const context = canvas.getContext("2d");

    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, "#08090a"); // Space
      gradient.addColorStop(0.48, "#141820"); // Sky
      gradient.addColorStop(0.52, "#1c222d"); // Ground
      gradient.addColorStop(1, "#0a0c10");
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.app.threeScene.background = texture;
  }

  update(): void {}

  setVisible(visible: boolean): void {
    if (this.gridMesh) this.gridMesh.visible = visible;
  }

  destroy(): void {
    if (this.app && this.gridMesh) {
      this.app.threeScene.remove(this.gridMesh);
    }
  }
}
