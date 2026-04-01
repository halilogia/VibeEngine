/**
 * VibeMotionManager - Central Animation Loop (RAF)
 * Ensures all active VibeSprings are updated in a single loop.
 */

import { VibeSpring } from './VibeSpring';

type AnimationCallback = (position: number) => void;

interface ActiveAnimation {
    spring: VibeSpring;
    callback: AnimationCallback;
}

export class VibeMotionManager {
    private static instance: VibeMotionManager;
    private activeAnimations: Map<string, ActiveAnimation> = new Map();
    private isRunning = false;
    private lastTime = 0;

    private constructor() {}

    static getInstance() {
        if (!VibeMotionManager.instance) {
            VibeMotionManager.instance = new VibeMotionManager();
        }
        return VibeMotionManager.instance;
    }

    register(id: string, spring: VibeSpring, callback: AnimationCallback) {
        this.activeAnimations.set(id, { spring, callback });
        if (!this.isRunning) {
            this.start();
        }
    }

    unregister(id: string) {
        this.activeAnimations.delete(id);
        if (this.activeAnimations.size === 0) {
            this.stop();
        }
    }

    private start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    private stop() {
        this.isRunning = false;
    }

    private loop(now: number) {
        if (!this.isRunning) return;

        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        const toRemove: string[] = [];

        this.activeAnimations.forEach((anim, id) => {
            const pos = anim.spring.update(dt);
            anim.callback(pos);

            if (anim.spring.isAtRest) {
                toRemove.push(id);
            }
        });

        toRemove.forEach(id => this.activeAnimations.delete(id));

        if (this.activeAnimations.size > 0) {
            requestAnimationFrame(this.loop.bind(this));
        } else {
            this.stop();
        }
    }
}
