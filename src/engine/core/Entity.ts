

import { Component, type ComponentClass } from './Component';

let entityIdCounter = 0;

export class Entity {
    
    readonly id: number;

    name: string;

    private _enabled: boolean = true;

    parent: Entity | null = null;

    readonly children: Entity[] = [];

    private readonly components: Map<string, Component> = new Map();

    readonly tags: Set<string> = new Set();

    constructor(name: string = 'Entity') {
        this.id = ++entityIdCounter;
        this.name = name;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled === value) return;
        this._enabled = value;

        this.components.forEach(component => {
            if (value && component.onEnable) component.onEnable();
            if (!value && component.onDisable) component.onDisable();
        });
    }

    get activeInHierarchy(): boolean {
        if (!this._enabled) return false;
        if (this.parent) return this.parent.activeInHierarchy;
        return true;
    }

    addComponent<T extends Component>(component: T): T {
        const type = component.type;

        if (this.components.has(type)) {
            console.warn(`Entity "${this.name}" already has component "${type}". Replacing.`);
            this.removeComponent(component.constructor as ComponentClass);
        }

        component.entity = this;
        this.components.set(type, component);

        if (component.onAttach) component.onAttach();
        if (this._enabled && component.onEnable) component.onEnable();

        return component;
    }

    getComponent<T extends Component>(type: ComponentClass<T>): T | null {
        return (this.components.get(type.TYPE) as T) ?? null;
    }

    hasComponent(type: ComponentClass): boolean {
        return this.components.has(type.TYPE);
    }

    removeComponent(type: ComponentClass): boolean {
        const component = this.components.get(type.TYPE);
        if (!component) return false;

        if (component.onDisable) component.onDisable();
        if (component.onDetach) component.onDetach();

        component.entity = null;
        return this.components.delete(type.TYPE);
    }

    getAllComponents(): Component[] {
        return Array.from(this.components.values());
    }

    addChild(entity: Entity): void {
        if (entity.parent === this) return;

        if (entity.parent) {
            entity.parent.removeChild(entity);
        }

        entity.parent = this;
        this.children.push(entity);
    }

    removeChild(entity: Entity): boolean {
        const index = this.children.indexOf(entity);
        if (index === -1) return false;

        this.children.splice(index, 1);
        entity.parent = null;
        return true;
    }

    findByName(name: string): Entity | null {
        if (this.name === name) return this;

        for (const child of this.children) {
            const found = child.findByName(name);
            if (found) return found;
        }

        return null;
    }

    findByTag(tag: string): Entity | null {
        if (this.tags.has(tag)) return this;

        for (const child of this.children) {
            const found = child.findByTag(tag);
            if (found) return found;
        }

        return null;
    }

    findAllByTag(tag: string): Entity[] {
        const result: Entity[] = [];

        if (this.tags.has(tag)) result.push(this);

        for (const child of this.children) {
            result.push(...child.findAllByTag(tag));
        }

        return result;
    }

    destroy(): void {
        
        for (const child of [...this.children]) {
            child.destroy();
        }

        if (this.parent) {
            this.parent.removeChild(this);
        }

        this.components.forEach(component => {
            if (component.onDisable) component.onDisable();
            if (component.onDestroy) component.onDestroy();
            component.entity = null;
        });

        this.components.clear();
        this.children.length = 0;
    }

    clone(newName?: string): Entity {
        const cloned = new Entity(newName ?? `${this.name}_clone`);

        this.components.forEach(component => {
            cloned.addComponent(component.clone());
        });

        this.tags.forEach(tag => cloned.tags.add(tag));

        for (const child of this.children) {
            cloned.addChild(child.clone());
        }

        return cloned;
    }
}
