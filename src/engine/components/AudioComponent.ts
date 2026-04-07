import { Audio, PositionalAudio, AudioListener } from "three";
import { Component } from "@engine";

export interface AudioOptions {
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
  panningModel?: "equalpower" | "HRTF";
  distanceModel?: "linear" | "inverse" | "exponential";
  maxDistance?: number;
  refDistance?: number;
  rolloffFactor?: number;
}

export class AudioComponent extends Component {
  static readonly TYPE = "Audio";

  volume: number;
  loop: boolean;
  autoplay: boolean;
  isPositional: boolean;

  audio: Audio<AudioNode> | PositionalAudio | null = null;
  private buffer: AudioBuffer | null = null;
  private listener: AudioListener | null = null;

  constructor(isPositional = true, options: AudioOptions = {}) {
    super();
    this.isPositional = isPositional;
    this.volume = options.volume ?? 1.0;
    this.loop = options.loop ?? false;
    this.autoplay = options.autoplay ?? false;
  }

  initialize(listener: AudioListener): void {
    this.listener = listener;
    if (this.isPositional) {
      this.audio = new PositionalAudio(listener);
    } else {
      this.audio = new Audio(listener);
    }

    if (this.buffer) {
      this.audio.setBuffer(this.buffer);
      this.setupAudio();
    }
  }

  setBuffer(buffer: AudioBuffer): void {
    this.buffer = buffer;
    if (this.audio) {
      this.audio.setBuffer(buffer);
      this.setupAudio();
    }
  }

  private setupAudio(): void {
    if (!this.audio) return;
    this.audio.setVolume(this.volume);
    this.audio.setLoop(this.loop);

    if (this.autoplay) {
      this.play();
    }
  }

  play(): void {
    if (this.audio && !this.audio.isPlaying) {
      this.audio.play();
    }
  }

  stop(): void {
    if (this.audio && this.audio.isPlaying) {
      this.audio.stop();
    }
  }

  setVolume(v: number): void {
    this.volume = v;
    if (this.audio) this.audio.setVolume(v);
  }

  override onDetach(): void {
    this.stop();
    if (this.audio && this.audio.parent) {
      this.audio.parent.remove(this.audio);
    }
  }

  override onDestroy(): void {
    this.stop();
  }
}
