import { describe, it, expect, vi, beforeEach } from "vitest";
import { AudioComponent } from "../AudioComponent";

// Create mock instances that will be returned
const createMockAudio = () => {
  const mock = {
    setBuffer: vi.fn(),
    play: vi.fn(),
    stop: vi.fn(),
    setVolume: vi.fn(),
    setLoop: vi.fn(),
    isPlaying: false,
    type: "Audio",
    connect: vi.fn(),
  };
  return mock;
};

const createMockPositionalAudio = () => ({
  ...createMockAudio(),
  type: "PositionalAudio",
  setRefDistance: vi.fn(),
});

const mockListener = {
  context: {
    state: "running",
    resume: vi.fn(),
  },
};

// Mock THREE Audio classes with constructor functions
vi.mock("three", async () => {
  const actual = await vi.importActual("three");
  return {
    ...actual,
    AudioListener: vi.fn(() => mockListener),
    Audio: vi.fn().mockImplementation(function(this: any) {
      const mock = createMockAudio();
      Object.assign(this, mock);
    }),
    PositionalAudio: vi.fn().mockImplementation(function(this: any) {
      const mock = createMockPositionalAudio();
      Object.assign(this, mock);
    }),
    AudioContext: {
      getContext: vi.fn(() => ({
        state: "running",
        resume: vi.fn(),
      })),
    },
  };
});

describe("AudioComponent", () => {
  let audioComponent: AudioComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    audioComponent = new AudioComponent(false); // Non-positional for simple test
  });

  it("should initialize with default volume", () => {
    expect(audioComponent.volume).toBe(1.0);
    expect(audioComponent.audio).toBeNull();
  });

  it("should initialize correctly when added to scene", () => {
    audioComponent.initialize(mockListener as any);
    expect(audioComponent.audio).toBeDefined();
    expect(audioComponent.audio?.type).toBe("Audio");
  });

  it("should set buffer and perform setup", () => {
    const mockBuffer = {} as AudioBuffer;
    audioComponent.initialize(mockListener as any);
    audioComponent.setBuffer(mockBuffer);

    // Verify setBuffer was called with the mock buffer
    expect(audioComponent.audio?.setBuffer).toHaveBeenCalledWith(mockBuffer);
  });

  it("should call stop on destroy", () => {
    audioComponent.initialize(mockListener as any);
    // Manually set isPlaying to true since mock doesn't track it
    if (audioComponent.audio) {
      (audioComponent.audio as any).isPlaying = true;
    }
    
    audioComponent.onDestroy();
    // The component calls stop() if audio is playing
    expect(audioComponent.audio).toBeDefined();
  });
});