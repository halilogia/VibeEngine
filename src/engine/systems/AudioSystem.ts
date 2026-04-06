import { System } from '@engine';
import type { Entity } from '@engine';
import { AudioComponent } from '@engine';

export class AudioSystem extends System {
    
    readonly priority = 40;

    readonly requiredComponents = [AudioComponent];

    private masterVolume: number = 1.0;

    private interactionHandler: (() => void) | null = null;

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

    update(_deltaTime: number, entities: Entity[]): void {
        for (const entity of entities) {
            const audio = entity.getComponent(AudioComponent);
            if (audio?.spatial) {
                audio.updatePositions();
            }
        }
    }

    async loadAudio(url: string): Promise<AudioBuffer> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const ctx = AudioComponent.getAudioContext();
        return ctx.decodeAudioData(arrayBuffer);
    }

    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    getMasterVolume(): number {
        return this.masterVolume;
    }

    destroy(): void {
        
        if (this.interactionHandler) {
            document.removeEventListener('click', this.interactionHandler);
            document.removeEventListener('keydown', this.interactionHandler);
            this.interactionHandler = null;
        }

        const ctx = AudioComponent.getAudioContext();
        if (ctx.state !== 'closed') {
            ctx.close().catch(err => console.warn('Failed to close AudioContext:', err));
        }
        
        console.log('🛑 AudioSystem destroyed');
    }
}
