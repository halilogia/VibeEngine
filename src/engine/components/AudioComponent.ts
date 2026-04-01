/**
 * AudioComponent - Sound playback for entities
 * Simplified version that uses Web Audio API directly.
 */

import { Component } from '@engine';

export interface AudioClip {
    name: string;
    buffer: AudioBuffer;
}

export class AudioComponent extends Component {
    static readonly TYPE = 'Audio';

    /** Audio clips available for this entity */
    readonly clips: Map<string, AudioClip> = new Map();

    /** Volume (0-1) */
    volume: number = 1.0;

    /** Is 3D positional audio (not implemented in simplified version) */
    spatial: boolean = false;

    /** Currently playing audio sources */
    private readonly activeSources: Map<string, AudioBufferSourceNode> = new Map();

    /** Gain nodes for volume control */
    private readonly gainNodes: Map<string, GainNode> = new Map();

    /** Shared audio context */
    static audioContext: AudioContext | null = null;

    /**
     * Get or create audio context
     */
    static getAudioContext(): AudioContext {
        if (!AudioComponent.audioContext) {
            AudioComponent.audioContext = new AudioContext();
        }
        return AudioComponent.audioContext;
    }

    /**
     * Add an audio clip
     */
    addClip(name: string, buffer: AudioBuffer): this {
        this.clips.set(name, { name, buffer });
        return this;
    }

    /**
     * Play a clip by name
     */
    play(name: string, options: { loop?: boolean; volume?: number } = {}): AudioBufferSourceNode | null {
        const clip = this.clips.get(name);
        if (!clip) return null;

        const ctx = AudioComponent.getAudioContext();

        // Stop if already playing
        this.stop(name);

        // Create source and gain nodes
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();

        source.buffer = clip.buffer;
        source.loop = options.loop ?? false;
        gainNode.gain.value = options.volume ?? this.volume;

        // Connect: source -> gain -> destination
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start();

        this.activeSources.set(name, source);
        this.gainNodes.set(name, gainNode);

        // Cleanup when finished
        source.onended = () => {
            this.activeSources.delete(name);
            this.gainNodes.delete(name);
        };

        return source;
    }

    /**
     * Stop a playing clip
     */
    stop(name: string): void {
        const source = this.activeSources.get(name);
        if (source) {
            try {
                source.stop();
            } catch {
                // Already stopped
            }
            this.activeSources.delete(name);
            this.gainNodes.delete(name);
        }
    }

    /**
     * Stop all playing sounds
     */
    stopAll(): void {
        this.activeSources.forEach((source, name) => {
            try {
                source.stop();
            } catch {
                // Already stopped
            }
        });
        this.activeSources.clear();
        this.gainNodes.clear();
    }

    /**
     * Check if a clip is playing
     */
    isPlaying(name: string): boolean {
        return this.activeSources.has(name);
    }

    /**
     * Set volume for a playing clip
     */
    setVolume(name: string, volume: number): void {
        const gain = this.gainNodes.get(name);
        if (gain) {
            gain.gain.value = volume;
        }
    }

    /**
     * Update positions for spatial audio (stub for future implementation)
     */
    updatePositions(): void {
        // Not implemented in simplified version
    }

    override onDestroy(): void {
        this.stopAll();
        this.clips.clear();
    }

    override clone(): AudioComponent {
        const cloned = new AudioComponent();
        cloned.volume = this.volume;
        cloned.spatial = this.spatial;
        // Copy clip references (buffers are shared)
        this.clips.forEach((clip, name) => {
            cloned.clips.set(name, clip);
        });
        return cloned;
    }
}
