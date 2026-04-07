import { Component, ComponentClass } from "./Component";

let entityIdCounter = 0;

export class Entity {

    private readonly _id: number;

    get id(): number {
        return this._id;
    }

    name: string;

    private _enabled: boolean = true;

    readonly components: Map<ComponentClass, Component> = new Map();

    readonly children: Entity[] = [];

    parent: Entity | null = null;

    readonly tags: Set<string> = new Set();

    constructor(name: string = 'Entity', id?: number) {
        this._id = id ?? ++entityIdCounter;
        if (id !== undefined && id >= entityIdCounter) {
            entityIdCounter = id;
        }
        this.name = name;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    get activeInHierarchy(): boolean {
        if (!this.enabled) return false;
        let current = this.parent;
        while (current) {
            if (!current.enabled) return false;
            current = current.parent;
        }
        return true;
    }

    addComponent<T extends Component>(component: T): T {
        const type = component.constructor as ComponentClass;
        this.components.set(type, component);
        component.entity = this;
        if (component.onAttach) component.onAttach();
        return component;
    }

    removeComponent<T extends Component>(type: ComponentClass<T>): boolean {
        const component = this.components.get(type);
        if (component) {
            if (component.onDetach) component.onDetach();
            component.entity = null;
            this.components.delete(type);
            return true;
        }
        return false;
    }

    getComponent<T extends Component>(type: ComponentClass<T>): T | null {
        return (this.components.get(type) as T) ?? null;
    }

    hasComponent<T extends Component>(type: ComponentClass<T>): boolean {
        return this.components.has(type);
    }

    addChild(child: Entity): void {
        if (this.children.includes(child)) return;
        this.children.push(child);
        child.parent = this;
    }

    removeChild(child: Entity): void {
        const index = this.children.indexOf(child);
        if (index === -1) return;
        this.children.splice(index, 1);
        child.parent = null;
    }

    findByName(name: string): Entity | null {
        if (this.name === name) return this;
        for (const child of this.children) {
            const found = child.findByName(name);
            if (found) return found;
        }
        return null;
    }

    getTransform(): Component | null {
        return this.components.get(
          Array.from(this.components.keys()).find(
            (c) => c.TYPE === "Transform"
          ) as ComponentClass
        ) ?? null;
    }

    clone(): Entity {
        const cloned = new Entity(`${this.name}_clone`);
        cloned._enabled = this._enabled;
        this.tags.forEach((tag) => cloned.tags.add(tag));
        this.components.forEach((comp) => {
            const clonedComp = comp.clone();
            clonedComp.entity = cloned;
            cloned.components.set(comp.constructor as ComponentClass, clonedComp);
        });
        this.children.forEach((child) => {
            const clonedChild = child.clone();
            cloned.addChild(clonedChild);
        });
        return cloned;
    }

    destroy(): void {
        for (const child of [...this.children]) {
            child.destroy();
        }
        this.components.clear();
        this.children.length = 0;
        this.parent = null;
        this.tags.clear();
    }
}
