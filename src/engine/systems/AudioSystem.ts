/**
 * AudioSystem - Manages audio context and updates sound positions
 */

import { System } from '../core/System';
import type { Entity } from '../core/Entity';
import { AudioComponent } from '../components/AudioComponent';

export class AudioSystem extends System {
    readonly priority = 40; // After animation
    readonly requiredComponents = [AudioComponent];

    /** Master volume (0-1) */
    private masterVolume: number = 1.0;

    initialize(): void {
        // Initialize audio context on first user interaction (browser requirement)
        const initAudio = () => {
            AudioComponent.getAudioContext();
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
            console.log('✅ AudioSystem initialized');
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    }

    update(_deltaTime: number, entities: Entity[]): void {
        // Update spatial audio positions (stub for future)
        for (const entity of entities) {
            const audio = entity.getComponent(AudioComponent);
            if (audio?.spatial) {
                audio.updatePositions();
            }
        }
    }

    /**
     * Load an audio file and return the buffer
     */
    async loadAudio(url: string): Promise<AudioBuffer> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const ctx = AudioComponent.getAudioContext();
        return ctx.decodeAudioData(arrayBuffer);
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume: number): void {
        this.masterVolume = volume;
        // Note: Applied to new sounds, existing sounds unchanged
    }

    /**
     * Get master volume
     */
    getMasterVolume(): number {
        return this.masterVolume;
    }
}
