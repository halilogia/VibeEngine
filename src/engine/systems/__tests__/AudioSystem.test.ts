import { describe, it, expect, vi, beforeEach } from "vitest";
import { AudioSystem } from "../AudioSystem";
import { Entity, AudioComponent } from "@engine";
import * as THREE from 'three';

describe("AudioSystem", () => {
  let audioSystem: AudioSystem;

  beforeEach(() => {
    vi.stubGlobal("AudioContext", class {
      decodeAudioData = vi.fn();
      createBufferSource = vi.fn().mockReturnValue({ connect: vi.fn(), start: vi.fn(), stop: vi.fn() });
      createGain = vi.fn().mockReturnValue({ gain: { value: 1 }, connect: vi.fn() });
      get destination() { return {}; }
      state = 'suspended';
      resume = vi.fn().mockResolvedValue(undefined);
    });

    audioSystem = new AudioSystem();
  });

  it("should initialize audio context mock", () => {
    audioSystem.initialize();
    expect(audioSystem.priority).toBe(40);
  });

  it("should attempt to update positional audio entities", () => {
    const entity = new Entity("SpatialEntity");
    const audioComp = new AudioComponent(true);
    entity.addComponent(audioComp);

    // Mocking Application context
    const mockApp = {
        listener: new THREE.AudioListener(),
        threeScene: new THREE.Scene()
    };
    (audioSystem as any).app = mockApp;

    // The system should not crash even if internal threeScene is updated
    expect(() => audioSystem.update(0.016, [entity])).not.toThrow();
  });
});
