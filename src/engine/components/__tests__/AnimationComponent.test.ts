import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { AnimationComponent } from '../AnimationComponent';

describe('AnimationComponent', () => {
    let animationComponent: AnimationComponent;
    let mockRoot: THREE.Object3D;

    beforeEach(() => {
        animationComponent = new AnimationComponent();
        mockRoot = new THREE.Object3D();
    });

    it('should initialize with null mixer', () => {
        expect(animationComponent.mixer).toBeNull();
    });

    it('should initialize mixer when setRootObject is called', () => {
        animationComponent.setRootObject(mockRoot);
        expect(animationComponent.mixer).toBeInstanceOf(THREE.AnimationMixer);
    });

    it('should add animation clips', () => {
        animationComponent.setRootObject(mockRoot);
        const clip1 = new THREE.AnimationClip('idle', 1, []);
        const clip2 = new THREE.AnimationClip('walk', 1, []);
        
        animationComponent.addClips([clip1, clip2]);
        
        expect(animationComponent.clips.size).toBe(2);
        expect(animationComponent.clips.has('idle')).toBe(true);
        expect(animationComponent.clips.has('walk')).toBe(true);
    });

    it('should play animations and handle crossfades', () => {
        animationComponent.setRootObject(mockRoot);
        const clip1 = new THREE.AnimationClip('idle', 1, []);
        const clip2 = new THREE.AnimationClip('run', 1, []);
        animationComponent.addClips([clip1, clip2]);
        
        const action1 = animationComponent.play('idle');
        expect(animationComponent.currentAnimation).toBe('idle');
        expect(action1?.isRunning()).toBe(true);
        
        const action2 = animationComponent.play('run');
        expect(animationComponent.currentAnimation).toBe('run');
        expect(action2?.isRunning()).toBe(true);
    });

    it('should stop all animations', () => {
        animationComponent.setRootObject(mockRoot);
        const clip = new THREE.AnimationClip('test', 1, []);
        animationComponent.addClips([clip]);
        animationComponent.play('test');
        
        animationComponent.stopAll();
        expect(animationComponent.currentAnimation).toBeNull();
    });

    it('should update mixer on update call', () => {
        animationComponent.setRootObject(mockRoot);
        const mixerSpy = vi.spyOn(animationComponent.mixer!, 'update');
        
        animationComponent.update(0.016);
        expect(mixerSpy).toHaveBeenCalledWith(0.016);
    });
});
