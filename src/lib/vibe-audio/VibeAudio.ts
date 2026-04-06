export interface AudioOptions {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
  spatial?: boolean;
  position?: [number, number, number];
}

export class VibeAudio {
  private static instance: VibeAudio;
  private context: AudioContext;
  private masterGain: GainNode;
  private buffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private panner: PannerNode;

  private constructor() {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    this.panner = this.context.createPanner();
    this.panner.panningModel = "HRTF";
    this.panner.distanceModel = "inverse";
    this.panner.refDistance = 1;
    this.panner.maxDistance = 10000;
    this.panner.rolloffFactor = 1;
  }

  public static getInstance(): VibeAudio {
    if (!VibeAudio.instance) {
      VibeAudio.instance = new VibeAudio();
    }
    return VibeAudio.instance;
  }

  public async load(url: string, id: string): Promise<void> {
    if (this.buffers.has(id)) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.buffers.set(id, audioBuffer);
      console.log(`🔊 [VibeAudio] Loaded: ${id}`);
    } catch (error) {
      console.error(`❌ [VibeAudio] Error loading audio "${url}":`, error);
    }
  }

  public play(
    id: string,
    options: AudioOptions = {},
  ): AudioBufferSourceNode | null {
    if (this.context.state === "suspended") {
      this.context.resume();
    }

    const buffer = this.buffers.get(id);
    if (!buffer) {
      console.error(`❌ [VibeAudio] Sound not found: ${id}`);
      return null;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = options.loop || false;
    source.playbackRate.value = options.playbackRate || 1;

    const gainNode = this.context.createGain();
    gainNode.gain.value = options.volume ?? 1;

    if (options.spatial && options.position) {
      const panner = this.context.createPanner();
      panner.positionX.setValueAtTime(
        options.position[0],
        this.context.currentTime,
      );
      panner.positionY.setValueAtTime(
        options.position[1],
        this.context.currentTime,
      );
      panner.positionZ.setValueAtTime(
        options.position[2],
        this.context.currentTime,
      );
      source.connect(gainNode).connect(panner).connect(this.masterGain);
    } else {
      source.connect(gainNode).connect(this.masterGain);
    }

    source.start(0);
    this.activeSources.add(source);

    source.onended = () => {
      source.disconnect();
      this.activeSources.delete(source);
    };

    return source;
  }

  public updateListener(
    position: [number, number, number],
    orientation: [number, number, number, number, number, number],
  ): void {
    const listener = this.context.listener;
    if (listener.positionX) {
      listener.positionX.setValueAtTime(position[0], this.context.currentTime);
      listener.positionY.setValueAtTime(position[1], this.context.currentTime);
      listener.positionZ.setValueAtTime(position[2], this.context.currentTime);
      listener.forwardX.setValueAtTime(
        orientation[0],
        this.context.currentTime,
      );
      listener.forwardY.setValueAtTime(
        orientation[1],
        this.context.currentTime,
      );
      listener.forwardZ.setValueAtTime(
        orientation[2],
        this.context.currentTime,
      );
      listener.upX.setValueAtTime(orientation[3], this.context.currentTime);
      listener.upY.setValueAtTime(orientation[4], this.context.currentTime);
      listener.upZ.setValueAtTime(orientation[5], this.context.currentTime);
    }
  }

  public stopAll(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        /* empty */
      }
      source.disconnect();
    });
    this.activeSources.clear();
  }

  public setMasterVolume(volume: number): void {
    this.masterGain.gain.setValueAtTime(volume, this.context.currentTime);
  }

  public dispose(): void {
    this.stopAll();
    this.buffers.clear();
    this.context.close().then(() => {
      console.log("🔊 [VibeAudio] AudioContext closed successfully");
    });
    VibeAudio.instance = null as unknown as VibeAudio;
  }
}
