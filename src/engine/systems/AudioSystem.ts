import * as THREE from "three";
import { System, Entity, AudioComponent, RenderComponent } from "@engine";

export class AudioSystem extends System {
  readonly priority = 40;
  readonly requiredComponents = [AudioComponent];

  private listener: THREE.AudioListener | null = null;
  private audioLoader: THREE.AudioLoader = new THREE.AudioLoader();
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private masterVolume: number = 1.0;

  initialize(): void {
    this.listener = new THREE.AudioListener();

    // Auto-unlock AudioContext on first interaction
    const unlock = () => {
      if (THREE.AudioContext.getContext().state === "suspended") {
        THREE.AudioContext.getContext().resume();
        console.log(
          "✅ AudioCore: Context Resumed via User-Engine Interaction",
        );
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);

    console.log(
      "🔊 AudioSystem: ELITE High-Fidelity 3D Sound Core Initialized",
    );
  }

  update(_deltaTime: number, entities: Entity[]): void {
    if (!this.app || !this.listener) return;

    // Sync listener position with active camera
    const camera = this.app.camera;
    if (this.listener.parent !== camera) {
      camera.add(this.listener);
    }

    for (const entity of entities) {
      const audioComp = entity.getComponent(AudioComponent);
      if (!audioComp) continue;

      // Initialize Three.js Audio objects if needed
      if (!audioComp.audio) {
        audioComp.initialize(this.listener);
      }

      // Sync with RenderComponent object for 3D positional audio
      if (
        audioComp.isPositional &&
        audioComp.audio instanceof THREE.PositionalAudio
      ) {
        const render = entity.getComponent(RenderComponent);
        if (render?.object3D && audioComp.audio.parent !== render.object3D) {
          render.object3D.add(audioComp.audio);
          console.log(
            `[AudioSystem] Attached PositionalAudio to Entity ${entity.name}`,
          );
        }
      }
    }
  }

  /**
   * Load an audio clip and cache its buffer
   */
  async loadClip(name: string, url: string): Promise<AudioBuffer> {
    if (this.audioBuffers.has(name)) return this.audioBuffers.get(name)!;

    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          this.audioBuffers.set(name, buffer);
          resolve(buffer);
        },
        undefined,
        (err) => {
          console.error(`[AudioSystem] Failed to load clip: ${url}`, err);
          reject(err);
        },
      );
    });
  }

  getClip(name: string): AudioBuffer | undefined {
    return this.audioBuffers.get(name);
  }

  /**
   * Get the master volume level (0.0 to 1.0)
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Set the master volume level (0.0 to 1.0)
   */
  setMasterVolume(value: number): void {
    this.masterVolume = Math.max(0, Math.min(1, value));
  }

  destroy(): void {
    this.audioBuffers.clear();
    console.log("🛑 AudioSystem: Shutdown");
  }
}
