import * as THREE from "three";
import { Scene } from "./Scene";
import { SceneManager } from "./SceneManager";
import { System } from "./System";
import { initLoadingBridge, updateLoadingStatus, type LoadingStatus } from "./AppLoadingBridge";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type { ApplicationOptions } from "./types";

export class Application {
  readonly threeScene: THREE.Scene;
  readonly editorScene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly uiRenderer: CSS2DRenderer;
  readonly canvas: HTMLCanvasElement;
  readonly composer: EffectComposer;
  readonly bloomPass: UnrealBloomPass;

  readonly scene: Scene;
  readonly sceneManager: SceneManager;
  private readonly systems: System[] = [];
  private readonly boundOnResize: () => void;

  private running: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly useFixedTimestep: boolean;
  private readonly fixedTimeStep: number;
  private readonly maxAccumulator: number = 0.25;

  deltaTime: number = 0;
  elapsedTime: number = 0;
  frameCount: number = 0;

  constructor(canvas: HTMLCanvasElement, options: ApplicationOptions = {}) {
    this.canvas = canvas;
    this.useFixedTimestep = options.useFixedTimestep ?? false;
    this.fixedTimeStep = options.fixedTimeStep ?? 1 / 60;

    this.threeScene = new THREE.Scene();
    this.threeScene.background = new THREE.Color(
      options.backgroundColor ?? 0x11111a,
    );

    this.editorScene = new THREE.Scene();
    this.editorScene.background = null;

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: options.antialias ?? true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 🌐 ELITE Integrated UI Renderer
    this.uiRenderer = new CSS2DRenderer();
    this.uiRenderer.setSize(window.innerWidth, window.innerHeight);
    this.uiRenderer.domElement.style.position = 'absolute';
    this.uiRenderer.domElement.style.top = '0px';
    this.uiRenderer.domElement.style.pointerEvents = 'none'; // Click-through by default
    this.canvas.parentElement?.appendChild(this.uiRenderer.domElement);

    // 🌊 ELITE Post-Processing Pipeline
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.threeScene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85, // threshold
    );
    this.bloomPass.enabled = false; // Off by default, controller by editor store
    this.composer.addPass(this.bloomPass);
    
    this.sceneManager = new SceneManager(this);
    this.scene = this.sceneManager.createScene("MainScene");
    this.sceneManager.loadScene("MainScene");

    this.boundOnResize = this.onResize.bind(this);
    window.addEventListener("resize", this.boundOnResize);

    console.log("✅ Application initialized (Core Only)");
  }

  addSystem<T extends System>(system: T): T {
    system.app = this;
    this.systems.push(system);

    this.systems.sort((a, b) => a.priority - b.priority);

    if (this.running && system.initialize) {
      system.initialize();
    }

    console.log(
      `📦 System added: ${system.constructor.name} (priority: ${system.priority})`,
    );
    return system;
  }

  removeSystem(system: System): boolean {
    const index = this.systems.indexOf(system);
    if (index === -1) return false;

    if (system.destroy) system.destroy();
    system.app = null;
    this.systems.splice(index, 1);
    return true;
  }

  getSystem<T extends System>(type: new (...args: unknown[]) => T): T | null {
    return (this.systems.find((s) => s instanceof type) as T) ?? null;
  }

  start(): void {
    if (this.running) return;

    initLoadingBridge();

    const totalModules = this.systems.length + 1;

    try {
      updateLoadingStatus(
        "Renderer",
        "success",
        "WebGL Graphics Ready",
        totalModules,
      );
    } catch {
      updateLoadingStatus(
        "Renderer",
        "error",
        "WebGL Initialization Failed",
        totalModules,
      );
    }

    for (const system of this.systems) {
      try {
        if (system.initialize) system.initialize();
        updateLoadingStatus(
          system.constructor.name,
          "success",
          `${system.constructor.name} Initialized`,
          totalModules,
        );
      } catch {
        updateLoadingStatus(
          system.constructor.name,
          "error",
          `Failed to initialize ${system.constructor.name}`,
          totalModules,
        );
      }
    }

    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.running = false;
    const windowWithLoading = window as Window & { VibeLoading?: LoadingStatus };
    if (windowWithLoading.VibeLoading) {
      (windowWithLoading.VibeLoading as LoadingStatus).status = "stopped";
    }
    console.log("⏹️ Application stopped");
  }

  destroy(): void {
    this.stop();

    for (const system of this.systems) {
      if (system.destroy) system.destroy();
      system.app = null;
    }
    this.systems.length = 0;

    this.scene.clear();

    this.renderer.dispose();
    if (this.uiRenderer.domElement.parentElement) {
        this.uiRenderer.domElement.parentElement.removeChild(this.uiRenderer.domElement);
    }

    window.removeEventListener("resize", this.boundOnResize);

    console.log("🗑️ Application destroyed");
  }

  private loop = (): void => {
    if (!this.running) return;

    requestAnimationFrame(this.loop);

    const currentTime = performance.now();
    let frameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (frameTime > this.maxAccumulator) {
      frameTime = this.maxAccumulator;
    }

    this.elapsedTime += frameTime;
    this.frameCount++;

    if (this.useFixedTimestep) {
      this.accumulator += frameTime;

      while (this.accumulator >= this.fixedTimeStep) {
        this.deltaTime = this.fixedTimeStep;
        this.updateSystems(this.fixedTimeStep);
        this.accumulator -= this.fixedTimeStep;
      }
    } else {
      this.deltaTime = frameTime;
      this.updateSystems(frameTime);
    }

    this.renderer.autoClear = false;
    this.renderer.clear();

    // Use Composer for main scene (Bloom, etc.)
    this.composer.render();

    // Render World-Space UI
    this.uiRenderer.render(this.threeScene, this.camera);

    // Render Editor Scene (Grid, Gizmos) on top without PP
    if (this.editorScene.children.length > 0) {
      this.renderer.render(this.editorScene, this.camera);
    }
  };

  private updateSystems(deltaTime: number): void {
    const entities = this.scene.getAllEntities();

    for (const system of this.systems) {
      if (!system.enabled) continue;

      const matchingEntities = system.filterEntities(entities);
      system.update(deltaTime, matchingEntities);
    }

    for (const system of this.systems) {
      if (!system.enabled) continue;
      if (system.postUpdate) system.postUpdate(deltaTime);
    }
  }

  private onResize(): void {
    const parent = this.canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.uiRenderer.setSize(width, height);
  }

  get fps(): number {
    return this.deltaTime > 0 ? 1 / this.deltaTime : 0;
  }
}