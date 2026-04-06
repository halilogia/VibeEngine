import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioComponent } from '../AudioComponent';

const mockSource = {
    buffer: null,
    loop: false,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
};

const mockGain = {
    gain: { value: 1.0 },
    connect: vi.fn(),
};

class MockAudioContext {
    createBufferSource() { return mockSource; }
    createGain() { return mockGain; }
    get destination() { return {}; }
}

const mockAudioBuffer = {} as AudioBuffer;

vi.stubGlobal('AudioContext', MockAudioContext);

describe('AudioComponent', () => {
    let audioComponent: AudioComponent;

    beforeEach(() => {
        vi.clearAllMocks();
        audioComponent = new AudioComponent();
        
        AudioComponent.audioContext = null;
    });

    it('should initialize with empty clips', () => {
        expect(audioComponent.clips.size).toBe(0);
    });

    it('should add audio clips', () => {
        audioComponent.addClip('fire', mockAudioBuffer);
        expect(audioComponent.clips.has('fire')).toBe(true);
    });

    it('should play a clip and manage Web Audio nodes', () => {
        audioComponent.addClip('jump', mockAudioBuffer);
        
        const source = audioComponent.play('jump', { loop: true, volume: 0.5 });
        
        expect(source).toBe(mockSource);
        expect(mockGain.gain.value).toBe(0.5);
        expect(mockSource.loop).toBe(true);
        expect(mockSource.start).toHaveBeenCalled();
    });

    it('should stop a playing clip', () => {
        audioComponent.addClip('ambient', mockAudioBuffer);
        audioComponent.play('ambient');
        
        audioComponent.stop('ambient');
        expect(mockSource.stop).toHaveBeenCalled();
        expect(audioComponent.isPlaying('ambient')).toBe(false);
    });

    it('should stop all sounds on destroy', () => {
        audioComponent.addClip('sfx1', mockAudioBuffer);
        audioComponent.play('sfx1');
        
        audioComponent.onDestroy();
        expect(mockSource.stop).toHaveBeenCalled();
        expect(audioComponent.clips.size).toBe(0);
    });
});
