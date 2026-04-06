import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioSystem } from '../AudioSystem';
import { Entity } from '@engine';
import { AudioComponent } from '@engine';

describe('AudioSystem', () => {
    let audioSystem: AudioSystem;

    beforeEach(() => {
        
        class MockAudioCtx {
            decodeAudioData = vi.fn();
            createBufferSource = vi.fn().mockReturnValue({ connect: vi.fn(), start: vi.fn(), stop: vi.fn() });
            createGain = vi.fn().mockReturnValue({ gain: { value: 1 }, connect: vi.fn() });
            get destination() { return {}; }
        }
        vi.stubGlobal('AudioContext', MockAudioCtx);
        
        audioSystem = new AudioSystem();
    });

    it('should initialize audio context on user interaction', () => {
        const getCtxSpy = vi.spyOn(AudioComponent, 'getAudioContext');
        audioSystem.initialize();

        document.dispatchEvent(new MouseEvent('click'));
        
        expect(getCtxSpy).toHaveBeenCalled();
    });

    it('should update positions for spatial audio', () => {
        const entity = new Entity('SpatialEntity');
        const audioComp = entity.addComponent(new AudioComponent());
        audioComp.spatial = true;
        
        const updatePosSpy = vi.spyOn(audioComp, 'updatePositions');
        
        audioSystem.update(0.016, [entity]);
        
        expect(updatePosSpy).toHaveBeenCalled();
    });

    it('should set and get master volume', () => {
        audioSystem.setMasterVolume(0.5);
        expect(audioSystem.getMasterVolume()).toBe(0.5);
    });
});
