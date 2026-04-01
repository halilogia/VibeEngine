/**
 * Application - Engine entry point and game loop manager
 * Initializes Three.js, manages systems, and runs the update loop.
 * 
 * @example
 * const app = new Application(document.getElementById('canvas') as HTMLCanvasElement);
 * app.addSystem(new RenderSystem());
 * app.addSystem(new InputSystem());
 * await app.start();
 */

import * as THREE from 'three';
import { Scene } from './Scene';
import { System } from './System';
import { initLoadingBridge, updateLoadingStatus } from './AppLoadingBridge';
import type { ApplicationOptions } from './types';

export class Application {
    // Three.js
    readonly threeScene: THREE.Scene;
    readonly camera: THREE.PerspectiveCamera;
    readonly renderer: THREE.WebGLRenderer;
    readonly canvas: HTMLCanvasElement;

    // ECS
    readonly scene: Scene;
    private readonly systems: System[] = [];

    // Loop
    private running: boolean = false;
    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly targetFPS: number;
    private readonly useFixedTimestep: boolean;
    private readonly fixedTimeStep: number;
    private readonly maxAccumulator: number = 0.25;

    // Stats
    deltaTime: number = 0;
    elapsedTime: number = 0;
    frameCount: number = 0;

    constructor(canvas: HTMLCanvasElement, options: ApplicationOptions = {}) {
        this.canvas = canvas;
        this.targetFPS = options.targetFPS ?? 60;
        this.useFixedTimestep = options.useFixedTimestep ?? false;
        this.fixedTimeStep = options.fixedTimeStep ?? (1 / 60);

        // Initialize Three.js Scene
        this.threeScene = new THREE.Scene();
        this.threeScene.background = new THREE.Color(options.backgroundColor ?? 0x000000);

        // Initialize Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);

        // Initialize Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: options.antialias ?? true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // AAA Quality Settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Initialize ECS Scene
        this.scene = new Scene('MainScene');

        // Handle resize
        window.addEventListener('resize', this.onResize.bind(this));

        console.log('✅ Application initialized');
    }

    // ============ SYSTEM MANAGEMENT ============

    /**
     * Add a system to the application
     */
    addSystem<T extends System>(system: T): T {
        system.app = this;
        this.systems.push(system);

        // Sort by priority
        this.systems.sort((a, b) => a.priority - b.priority);

        // Initialize if already running
        if (this.running && system.initialize) {
            system.initialize();
        }

        console.log(`📦 System added: ${system.constructor.name} (priority: ${system.priority})`);
        return system;
    }

    /**
     * Remove a system
     */
    removeSystem(system: System): boolean {
        const index = this.systems.indexOf(system);
        if (index === -1) return false;

        if (system.destroy) system.destroy();
        system.app = null;
        this.systems.splice(index, 1);
        return true;
    }

    /**
     * Get a system by type
     */
    getSystem<T extends System>(type: new (...args: any[]) => T): T | null {
        return this.systems.find(s => s instanceof type) as T ?? null;
    }

    // ============ LIFECYCLE ============

    /**
     * Start the application and initialize the loading bridge
     */
    start(): void {
        if (this.running) return;

        // Initialize Loading Bridge
        initLoadingBridge();

        const totalModules = this.systems.length + 1; // +1 for renderer

        // Initialize Renderer first
        try {
            updateLoadingStatus('Renderer', 'success', 'WebGL Graphics Ready', totalModules);
        } catch (e) {
            updateLoadingStatus('Renderer', 'error', 'WebGL Initialization Failed', totalModules);
        }

        // Initialize all systems
        for (const system of this.systems) {
            try {
                if (system.initialize) system.initialize();
                updateLoadingStatus(system.constructor.name, 'success', `${system.constructor.name} Initialized`, totalModules);
            } catch (e) {
                updateLoadingStatus(system.constructor.name, 'error', `Failed to initialize ${system.constructor.name}`, totalModules);
            }
        }

        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }

    /**
     * Stop the application
     */
    stop(): void {
        this.running = false;
        if ((window as any).VibeLoading) {
            (window as any).VibeLoading.status = 'stopped';
        }
        console.log('⏹️ Application stopped');
    }

    /**
     * Destroy the application and cleanup
     */
    destroy(): void {
        this.stop();

        // Destroy systems
        for (const system of this.systems) {
            if (system.destroy) system.destroy();
            system.app = null;
        }
        this.systems.length = 0;

        // Clear scene
        this.scene.clear();

        // Dispose renderer
        this.renderer.dispose();

        window.removeEventListener('resize', this.onResize.bind(this));

        console.log('🗑️ Application destroyed');
    }

    // ============ LOOP ============

    private loop = (): void => {
        if (!this.running) return;

        requestAnimationFrame(this.loop);

        const currentTime = performance.now();
        let frameTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Clamp frame time to prevent spiral of death
        if (frameTime > this.maxAccumulator) {
            frameTime = this.maxAccumulator;
        }

        this.elapsedTime += frameTime;
        this.frameCount++;

        if (this.useFixedTimestep) {
            this.accumulator += frameTime;

            while (this.accumulator >= this.fixedTimeStep) {
                this.deltaTime = this.fixedTimeStep;
                this.updateSystems(this.fixedTimeStep);
                this.accumulator -= this.fixedTimeStep;
            }
        } else {
            this.deltaTime = frameTime;
            this.updateSystems(frameTime);
        }

        // Render
        this.renderer.render(this.threeScene, this.camera);
    };

    private updateSystems(deltaTime: number): void {
        const entities = this.scene.getAllEntities();

        for (const system of this.systems) {
            if (!system.enabled) continue;

            const matchingEntities = system.filterEntities(entities);
            system.update(deltaTime, matchingEntities);
        }

        // Post-update
        for (const system of this.systems) {
            if (!system.enabled) continue;
            if (system.postUpdate) system.postUpdate(deltaTime);
        }
    }

    // ============ HELPERS ============

    private onResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * Get current FPS
     */
    get fps(): number {
        return this.deltaTime > 0 ? 1 / this.deltaTime : 0;
    }
}
