/**
 * ScriptComponent - Attach custom behavior to entities
 * Scripts are classes that can access entity, components, and application.
 * 
 * @example
 * class PlayerScript extends Script {
 *   speed = 5;
 *   
 *   update(deltaTime: number) {
 *     const input = this.app?.getSystem(InputSystem);
 *     const transform = this.getComponent(TransformComponent);
 *     if (input && transform) {
 *       transform.translate(input.horizontal * this.speed * deltaTime, 0, 0);
 *     }
 *   }
 * }
 */

import { Component } from '@engine';
import type { Entity } from '@engine';
import type { Application } from '@engine';
import type { ComponentClass } from '@engine';

/**
 * Base class for all scripts
 */
export abstract class Script {
    /** Reference to the script component */
    scriptComponent: ScriptComponent | null = null;

    /** Get the entity this script is attached to */
    get entity(): Entity | null {
        return this.scriptComponent?.entity ?? null;
    }

    /** Get the application */
    get app(): Application | null {
        return this.scriptComponent?.app ?? null;
    }

    /**
     * Get a component from the entity
     */
    getComponent<T extends Component>(type: ComponentClass<T>): T | null {
        return this.entity?.getComponent(type) ?? null;
    }

    /**
     * Called once when script is initialized
     */
    initialize?(): void;

    /**
     * Called once after initialize, when entity is enabled
     */
    start?(): void;

    /**
     * Called every frame
     */
    update?(deltaTime: number): void;

    /**
     * Called after all updates
     */
    lateUpdate?(deltaTime: number): void;

    /**
     * Called when script is destroyed
     */
    destroy?(): void;

    /**
     * Clone this script (for prefab instantiation)
     */
    clone(): Script {
        // Create new instance of the same class
        const cloned = Object.create(Object.getPrototypeOf(this));
        // Copy properties
        Object.assign(cloned, this);
        cloned.scriptComponent = null;
        return cloned;
    }
}

/**
 * ScriptComponent - Container for Script instances
 */
export class ScriptComponent extends Component {
    static readonly TYPE = 'Script';

    /** All attached scripts */
    readonly scripts: Script[] = [];

    /** Application reference (set by ScriptSystem) */
    app: Application | null = null;

    /** Whether scripts have been started */
    private started: boolean = false;

    /**
     * Add a script to this component
     */
    addScript<T extends Script>(script: T): T {
        script.scriptComponent = this;
        this.scripts.push(script);

        // Initialize immediately if already attached
        if (this.entity && script.initialize) {
            script.initialize();
        }

        // Start if already started and entity is enabled
        if (this.started && this.entity?.enabled && script.start) {
            script.start();
        }

        return script;
    }

    /**
     * Get a script by type
     */
    getScript<T extends Script>(type: new (...args: any[]) => T): T | null {
        return this.scripts.find(s => s instanceof type) as T ?? null;
    }

    /**
     * Remove a script
     */
    removeScript(script: Script): boolean {
        const index = this.scripts.indexOf(script);
        if (index === -1) return false;

        if (script.destroy) script.destroy();
        script.scriptComponent = null;
        this.scripts.splice(index, 1);
        return true;
    }

    /**
     * Initialize all scripts
     */
    initializeAll(): void {
        for (const script of this.scripts) {
            if (script.initialize) script.initialize();
        }
    }

    /**
     * Start all scripts (called once)
     */
    startAll(): void {
        if (this.started) return;
        this.started = true;

        for (const script of this.scripts) {
            if (script.start) script.start();
        }
    }

    /**
     * Update all scripts
     */
    updateAll(deltaTime: number): void {
        for (const script of this.scripts) {
            if (script.update) script.update(deltaTime);
        }
    }

    /**
     * Late update all scripts
     */
    lateUpdateAll(deltaTime: number): void {
        for (const script of this.scripts) {
            if (script.lateUpdate) script.lateUpdate(deltaTime);
        }
    }

    override onAttach(): void {
        this.initializeAll();
    }

    override onEnable(): void {
        if (!this.started) {
            this.startAll();
        }
    }

    override onDestroy(): void {
        for (const script of this.scripts) {
            if (script.destroy) script.destroy();
            script.scriptComponent = null;
        }
        this.scripts.length = 0;
    }

    override clone(): ScriptComponent {
        const cloned = new ScriptComponent();
        for (const script of this.scripts) {
            cloned.addScript(script.clone());
        }
        return cloned;
    }
}
