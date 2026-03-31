import { System } from '../core/System';
import type { Entity } from '../core/Entity';
import { AudioComponent } from '../components/AudioComponent';

/**
 * AudioSystem - Manages global audio context and updates spatial sound positions.
 * It handles the initialization of the AudioContext on user interaction 
 * and ensures proper cleanup of resources.
 */
export class AudioSystem extends System {
    /** Priority determines the order of system execution. Audio updates after animation. */
    readonly priority = 40;

    /** Lists the components this system treats as its data source. */
    readonly requiredComponents = [AudioComponent];

    /** Internal master volume multiplier (0.0 to 1.0) */
    private masterVolume: number = 1.0;

    /** Reference to the interaction-bound initializer for cleanup */
    private interactionHandler: (() => void) | null = null;

    /**
     * Initializes the system and sets up listeners for the first user interaction
     * to unlock the Web Audio API context.
     */
    initialize(): void {
        this.interactionHandler = () => {
            AudioComponent.getAudioContext();
            if (this.interactionHandler) {
                document.removeEventListener('click', this.interactionHandler);
                document.removeEventListener('keydown', this.interactionHandler);
                this.interactionHandler = null;
            }
            console.log('✅ AudioSystem: AudioContext unlocked by user interaction');
        };

        document.addEventListener('click', this.interactionHandler);
        document.addEventListener('keydown', this.interactionHandler);
    }

    /**
     * Updates spatial audio positions for all entities with an AudioComponent.
     * @param _deltaTime - Time elapsed since the last frame.
     * @param entities - Entities that match the requiredComponents filter.
     */
    update(_deltaTime: number, entities: Entity[]): void {
        for (const entity of entities) {
            const audio = entity.getComponent(AudioComponent);
            if (audio?.spatial) {
                audio.updatePositions();
            }
        }
    }

    /**
     * Loads an audio file from a URL and decodes it into an AudioBuffer.
     * @param url - The path to the audio file.
     * @returns A promise that resolves with the decoded AudioBuffer.
     */
    async loadAudio(url: string): Promise<AudioBuffer> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const ctx = AudioComponent.getAudioContext();
        return ctx.decodeAudioData(arrayBuffer);
    }

    /**
     * Sets the master volume for the entire engine.
     * Note: This primarily affects newly triggered sounds.
     * @param volume - Volume level from 0.0 (silent) to 1.0 (full).
     */
    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Returns the current master volume level.
     */
    getMasterVolume(): number {
        return this.masterVolume;
    }

    /**
     * Shuts down the AudioSystem, closing the AudioContext and 
     * removing any pending event listeners to prevent memory leaks.
     */
    destroy(): void {
        // Cleanup event listeners if they haven't fired yet
        if (this.interactionHandler) {
            document.removeEventListener('click', this.interactionHandler);
            document.removeEventListener('keydown', this.interactionHandler);
            this.interactionHandler = null;
        }

        // Close AudioContext
        const ctx = AudioComponent.getAudioContext();
        if (ctx.state !== 'closed') {
            ctx.close().catch(err => console.warn('Failed to close AudioContext:', err));
        }
        
        console.log('🛑 AudioSystem destroyed');
    }
}
