import * as THREE from "three";
import { System, Entity, WeatherComponent, ParticleComponent, TransformComponent, AudioComponent, AudioSystem } from "@engine";

export class WeatherSystem extends System {
  readonly priority = 0;
  private weatherEntity: Entity | null = null;
  private rainParticle: ParticleComponent | null = null;
  private snowParticle: ParticleComponent | null = null;
  private ambientAudio: AudioComponent | null = null;
  private currentAudioType: string = "none";

  initialize(): void {
    console.log("☁️ WeatherSystem: Atmospheric Simulation Engaged");
  }

  update(deltaTime: number, entities: Entity[]): void {
    const weather = entities.find(e => e.hasComponent(WeatherComponent))?.getComponent(WeatherComponent);
    if (!weather) return;

    this.updateDayNightCycle(weather);
    this.updateWeatherEffects(weather);
  }

  private updateDayNightCycle(weather: WeatherComponent): void {
    if (!this.app) return;

    // Time cycle (0 to 24)
    // Noon = 12, Midnight = 0/24
    const cycle = (weather.timeOfDay / 24) * Math.PI * 2;
    
    // Calculate Sun position (simple orbit)
    const sunX = Math.cos(cycle - Math.PI / 2) * 50;
    const sunY = Math.sin(cycle - Math.PI / 2) * 50;
    const sunZ = 10;

    // Find main directional light
    let sunLight = this.app.threeScene.getObjectByName("MainSunLight") as THREE.DirectionalLight;
    if (!sunLight) {
        sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.name = "MainSunLight";
        sunLight.castShadow = true;
        this.app.threeScene.add(sunLight);
    }
    sunLight.position.set(sunX, sunY, sunZ);

    // Dynamic Sky Color
    // 06:00 - Dawn (Orange/Pink)
    // 12:00 - Day (Bright Blue)
    // 18:00 - Dusk (Gold/Purple)
    // 24:00 - Night (Dark Blue/Black)
    
    let skyColor: THREE.Color;
    let intensity: number;

    if (weather.timeOfDay >= 5 && weather.timeOfDay < 8) { // Dawn
        skyColor = new THREE.Color(0xff8c69).lerp(new THREE.Color(0x87ceeb), (weather.timeOfDay - 5) / 3);
        intensity = 0.8;
    } else if (weather.timeOfDay >= 8 && weather.timeOfDay < 17) { // Day
        skyColor = new THREE.Color(0x87ceeb);
        intensity = 1.4;
    } else if (weather.timeOfDay >= 17 && weather.timeOfDay < 20) { // Dusk
        skyColor = new THREE.Color(0x87ceeb).lerp(new THREE.Color(0x1a1a2e), (weather.timeOfDay - 17) / 3);
        intensity = 0.6;
    } else { // Night
        skyColor = new THREE.Color(0x0a0a1a);
        intensity = 0.2;
    }

    // Weather impact on sky
    if (weather.weatherType === "storm" || weather.weatherType === "rain") {
        skyColor.lerp(new THREE.Color(0x2c3e50), 0.7); // Darken for storm
        intensity *= 0.5;
    }

    this.app.threeScene.background = skyColor;
    sunLight.intensity = intensity;
  }

  private updateWeatherEffects(weather: WeatherComponent): void {
    if (!this.app) return;

    // AUDIO CORE: Update atmospheric sounds
    this.updateAmbientAudio(weather);

    // Check if we need to spawn/update particles
    if (weather.weatherType === "rain" || weather.weatherType === "storm") {
        this.ensureRain(weather);
        if (this.snowParticle) this.snowParticle.enabled = false;
    } else if (weather.weatherType === "snow") {
        this.ensureSnow(weather);
        if (this.rainParticle) this.rainParticle.enabled = false;
    } else {
        if (this.rainParticle) this.rainParticle.enabled = false;
        if (this.snowParticle) this.snowParticle.enabled = false;
    }
  }

  private async updateAmbientAudio(weather: WeatherComponent): Promise<void> {
    const audioSystem = this.app?.getSystem(AudioSystem);
    if (!audioSystem) return;

    const targetAudio = weather.weatherType === "storm" || weather.weatherType === "rain" ? "rain" : "none";

    if (this.currentAudioType === targetAudio) return;
    this.currentAudioType = targetAudio;

    if (targetAudio === "none") {
        this.ambientAudio?.stop();
        return;
    }

    if (!this.ambientAudio) {
        const entity = new Entity("AmbientWeatherAudio", 999);
        this.ambientAudio = new AudioComponent(false, { volume: 0.5, loop: true, autoplay: true });
        entity.addComponent(this.ambientAudio);
        this.app!.scene.addEntity(entity);
    }

    // Load placeholder storm/rain audio url if needed
    // For now, prepare the buffer structure
    const rainUrl = "https://www.soundjay.com/nature/rain-01.mp3";
    try {
        const buffer = await audioSystem.loadClip("rain_ambient", rainUrl);
        this.ambientAudio.setBuffer(buffer);
        this.ambientAudio.play();
        console.log("🔊 WeatherSystem: Playing Atmospheric Storm Context");
    } catch (e) {
        console.warn("WeatherSystem: Could not load ambient audio clip", e);
    }
  }

  private ensureRain(weather: WeatherComponent): void {
      if (!this.rainParticle) {
          const entity = new Entity("RainSystem", 9999);
          entity.addComponent(new TransformComponent(new THREE.Vector3(0, 20, 0)));
          this.rainParticle = new ParticleComponent({
              maxParticles: 5000,
              size: 0.1,
              startColor: new THREE.Color("#aabbee"),
              velocity: new THREE.Vector3(0, -30, 0),
              emissionRate: 300 * weather.intensity,
              lifetime: 2
          });
          entity.addComponent(this.rainParticle);
          this.app!.scene.addEntity(entity);
      }
      this.rainParticle.enabled = true;
      // Could dynamically adjust spawnRate here
  }

  private ensureSnow(weather: WeatherComponent): void {
      if (!this.snowParticle) {
          const entity = new Entity("SnowSystem", 9998);
          entity.addComponent(new TransformComponent(new THREE.Vector3(0, 20, 0)));
          this.snowParticle = new ParticleComponent({
              maxParticles: 3000,
              size: 0.2,
              startColor: new THREE.Color("#ffffff"),
              velocity: new THREE.Vector3(0, -5, 0),
              emissionRate: 100 * weather.intensity,
              lifetime: 5
          });
          entity.addComponent(this.snowParticle);
          this.app!.scene.addEntity(entity);
      }
      this.snowParticle.enabled = true;
  }
}
