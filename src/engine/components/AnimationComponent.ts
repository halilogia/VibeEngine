/**
 * AnimationComponent - Animation playback using Three.js AnimationMixer
 * Supports skeletal animations from GLTF/GLB models.
 */

import * as THREE from 'three';
import { Component } from '../core/Component';

export interface AnimationClipInfo {
    name: string;
    clip: THREE.AnimationClip;
    action?: THREE.AnimationAction;
}

export class AnimationComponent extends Component {
    static readonly TYPE = 'Animation';

    /** Three.js animation mixer */
    mixer: THREE.AnimationMixer | null = null;

    /** Available animation clips */
    readonly clips: Map<string, AnimationClipInfo> = new Map();

    /** Currently playing animation name */
    currentAnimation: string | null = null;

    /** Default transition duration between animations */
    transitionDuration: number = 0.2;

    /** Animation speed multiplier */
    timeScale: number = 1.0;

    /**
     * Initialize mixer with a root object (usually the loaded model)
     */
    setRootObject(object: THREE.Object3D): this {
        this.mixer = new THREE.AnimationMixer(object);
        return this;
    }

    /**
     * Add animation clips (usually from model.animations)
     */
    addClips(clips: THREE.AnimationClip[]): this {
        if (!this.mixer) {
            console.warn('AnimationComponent: Mixer not initialized. Call setRootObject first.');
            return this;
        }

        for (const clip of clips) {
            const action = this.mixer.clipAction(clip);
            this.clips.set(clip.name, {
                name: clip.name,
                clip,
                action,
            });
        }

        return this;
    }

    /**
     * Play an animation by name
     */
    play(name: string, options: {
        loop?: THREE.AnimationActionLoopStyles;
        clampWhenFinished?: boolean;
        fadeIn?: number;
    } = {}): THREE.AnimationAction | null {
        const info = this.clips.get(name);
        if (!info?.action) {
            console.warn(`AnimationComponent: Animation "${name}" not found.`);
            return null;
        }

        const action = info.action;

        // Stop current animation with crossfade
        if (this.currentAnimation && this.currentAnimation !== name) {
            const currentInfo = this.clips.get(this.currentAnimation);
            if (currentInfo?.action) {
                currentInfo.action.fadeOut(options.fadeIn ?? this.transitionDuration);
            }
        }

        // Configure and play
        action.reset();
        action.setLoop(options.loop ?? THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = options.clampWhenFinished ?? false;
        action.fadeIn(options.fadeIn ?? this.transitionDuration);
        action.play();

        this.currentAnimation = name;
        return action;
    }

    /**
     * Play animation once (no loop)
     */
    playOnce(name: string, fadeIn?: number): THREE.AnimationAction | null {
        return this.play(name, {
            loop: THREE.LoopOnce,
            clampWhenFinished: true,
            fadeIn,
        });
    }

    /**
     * Stop current animation
     */
    stop(fadeOut?: number): void {
        if (!this.currentAnimation) return;

        const info = this.clips.get(this.currentAnimation);
        if (info?.action) {
            info.action.fadeOut(fadeOut ?? this.transitionDuration);
        }

        this.currentAnimation = null;
    }

    /**
     * Stop all animations
     */
    stopAll(): void {
        this.mixer?.stopAllAction();
        this.currentAnimation = null;
    }

    /**
     * Pause current animation
     */
    pause(): void {
        if (!this.currentAnimation) return;
        const info = this.clips.get(this.currentAnimation);
        if (info?.action) {
            info.action.paused = true;
        }
    }

    /**
     * Resume current animation
     */
    resume(): void {
        if (!this.currentAnimation) return;
        const info = this.clips.get(this.currentAnimation);
        if (info?.action) {
            info.action.paused = false;
        }
    }

    /**
     * Check if an animation is playing
     */
    isPlaying(name?: string): boolean {
        if (name) {
            const info = this.clips.get(name);
            return info?.action?.isRunning() ?? false;
        }
        return this.currentAnimation !== null;
    }

    /**
     * Set animation time scale (speed)
     */
    setTimeScale(scale: number): this {
        this.timeScale = scale;
        if (this.mixer) {
            this.mixer.timeScale = scale;
        }
        return this;
    }

    /**
     * Get animation names
     */
    getAnimationNames(): string[] {
        return Array.from(this.clips.keys());
    }

    /**
     * Update the mixer (called by AnimationSystem)
     */
    update(deltaTime: number): void {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }

    override onDestroy(): void {
        this.stopAll();
        this.mixer = null;
        this.clips.clear();
    }

    override clone(): AnimationComponent {
        const cloned = new AnimationComponent();
        cloned.transitionDuration = this.transitionDuration;
        cloned.timeScale = this.timeScale;
        // Note: Mixer and clips need to be set up separately for cloned entities
        return cloned;
    }
}
