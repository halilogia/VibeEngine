import { Component } from "@engine";

export interface AudioClip {
  name: string;
  buffer: AudioBuffer;
}

export class AudioComponent extends Component {
  static readonly TYPE = "Audio";

  readonly clips: Map<string, AudioClip> = new Map();

  volume: number = 1.0;

  spatial: boolean = false;

  private readonly activeSources: Map<string, AudioBufferSourceNode> =
    new Map();

  private readonly gainNodes: Map<string, GainNode> = new Map();

  static audioContext: AudioContext | null = null;

  static getAudioContext(): AudioContext {
    if (!AudioComponent.audioContext) {
      AudioComponent.audioContext = new AudioContext();
    }
    return AudioComponent.audioContext;
  }

  addClip(name: string, buffer: AudioBuffer): this {
    this.clips.set(name, { name, buffer });
    return this;
  }

  play(
    name: string,
    options: { loop?: boolean; volume?: number } = {},
  ): AudioBufferSourceNode | null {
    const clip = this.clips.get(name);
    if (!clip) return null;

    const ctx = AudioComponent.getAudioContext();

    this.stop(name);

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    source.buffer = clip.buffer;
    source.loop = options.loop ?? false;
    gainNode.gain.value = options.volume ?? this.volume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();

    this.activeSources.set(name, source);
    this.gainNodes.set(name, gainNode);

    source.onended = () => {
      this.activeSources.delete(name);
      this.gainNodes.delete(name);
    };

    return source;
  }

  stop(name: string): void {
    const source = this.activeSources.get(name);
    if (source) {
      try {
        source.stop();
      } catch {
        /* empty */
      }
      this.activeSources.delete(name);
      this.gainNodes.delete(name);
    }
  }

  stopAll(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        /* empty */
      }
    });
    this.activeSources.clear();
    this.gainNodes.clear();
  }

  isPlaying(name: string): boolean {
    return this.activeSources.has(name);
  }

  setVolume(name: string, volume: number): void {
    const gain = this.gainNodes.get(name);
    if (gain) {
      gain.gain.value = volume;
    }
  }

  updatePositions(): void {}

  override onDestroy(): void {
    this.stopAll();
    this.clips.clear();
  }

  override clone(): AudioComponent {
    const cloned = new AudioComponent();
    cloned.volume = this.volume;
    cloned.spatial = this.spatial;

    this.clips.forEach((clip, name) => {
      cloned.clips.set(name, clip);
    });
    return cloned;
  }
}
