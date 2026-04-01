/**
 * VibeAudio - Pure Web Audio API engine
 * Professional high-fidelity audio system with 3D (Spatial) sound support.
 * Zero external dependencies (No Howler.js, No Sound.js).
 */

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
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);

        // Standard panner for 3D spatial audio
        this.panner = this.context.createPanner();
        this.panner.panningModel = 'HRTF';
        this.panner.distanceModel = 'inverse';
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

    /**
     * Load an audio file and cache it
     */
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

    /**
     * Play a sound by ID
     */
    public play(id: string, options: AudioOptions = {}): AudioBufferSourceNode | null {
        if (this.context.state === 'suspended') {
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

        // Path: Source -> Gain -> (Optional Panner) -> MasterGain -> Destination
        if (options.spatial && options.position) {
            const panner = this.context.createPanner();
            panner.setPosition(...options.position);
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

    /**
     * Update the listener (camera) position for 3D audio
     */
    public updateListener(position: [number, number, number], orientation: [number, number, number, number, number, number]): void {
        const listener = this.context.listener;
        if (listener.positionX) {
            // Modern Web Audio API
            listener.positionX.setValueAtTime(position[0], this.context.currentTime);
            listener.positionY.setValueAtTime(position[1], this.context.currentTime);
            listener.positionZ.setValueAtTime(position[2], this.context.currentTime);
            listener.forwardX.setValueAtTime(orientation[0], this.context.currentTime);
            listener.forwardY.setValueAtTime(orientation[1], this.context.currentTime);
            listener.forwardZ.setValueAtTime(orientation[2], this.context.currentTime);
            listener.upX.setValueAtTime(orientation[3], this.context.currentTime);
            listener.upY.setValueAtTime(orientation[4], this.context.currentTime);
            listener.upZ.setValueAtTime(orientation[5], this.context.currentTime);
        } else {
            // Legacy/Safari support
            listener.setPosition(...position);
            listener.setOrientation(...orientation);
        }
    }

    public stopAll(): void {
        this.activeSources.forEach((source) => {
            try { source.stop(); } catch (e) {}
            source.disconnect();
        });
        this.activeSources.clear();
    }

    public setMasterVolume(volume: number): void {
        this.masterGain.gain.setValueAtTime(volume, this.context.currentTime);
    }
}
