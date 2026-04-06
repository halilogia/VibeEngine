

import * as THREE from 'three';
import { Component } from '@engine';

export interface AnimationClipInfo {
    name: string;
    clip: THREE.AnimationClip;
    action?: THREE.AnimationAction;
}

export class AnimationComponent extends Component {
    static readonly TYPE = 'Animation';

    mixer: THREE.AnimationMixer | null = null;

    readonly clips: Map<string, AnimationClipInfo> = new Map();

    currentAnimation: string | null = null;

    transitionDuration: number = 0.2;

    timeScale: number = 1.0;

    setRootObject(object: THREE.Object3D): this {
        this.mixer = new THREE.AnimationMixer(object);
        return this;
    }

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

        if (this.currentAnimation && this.currentAnimation !== name) {
            const currentInfo = this.clips.get(this.currentAnimation);
            if (currentInfo?.action) {
                currentInfo.action.fadeOut(options.fadeIn ?? this.transitionDuration);
            }
        }

        action.reset();
        action.setLoop(options.loop ?? THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = options.clampWhenFinished ?? false;
        action.fadeIn(options.fadeIn ?? this.transitionDuration);
        action.play();

        this.currentAnimation = name;
        return action;
    }

    playOnce(name: string, fadeIn?: number): THREE.AnimationAction | null {
        return this.play(name, {
            loop: THREE.LoopOnce,
            clampWhenFinished: true,
            fadeIn,
        });
    }

    stop(fadeOut?: number): void {
        if (!this.currentAnimation) return;

        const info = this.clips.get(this.currentAnimation);
        if (info?.action) {
            info.action.fadeOut(fadeOut ?? this.transitionDuration);
        }

        this.currentAnimation = null;
    }

    stopAll(): void {
        this.mixer?.stopAllAction();
        this.currentAnimation = null;
    }

    pause(): void {
        if (!this.currentAnimation) return;
        const info = this.clips.get(this.currentAnimation);
        if (info?.action) {
            info.action.paused = true;
        }
    }

    resume(): void {
        if (!this.currentAnimation) return;
        const info = this.clips.get(this.currentAnimation);
        if (info?.action) {
            info.action.paused = false;
        }
    }

    isPlaying(name?: string): boolean {
        if (name) {
            const info = this.clips.get(name);
            return info?.action?.isRunning() ?? false;
        }
        return this.currentAnimation !== null;
    }

    setTimeScale(scale: number): this {
        this.timeScale = scale;
        if (this.mixer) {
            this.mixer.timeScale = scale;
        }
        return this;
    }

    getAnimationNames(): string[] {
        return Array.from(this.clips.keys());
    }

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
        
        return cloned;
    }
}
