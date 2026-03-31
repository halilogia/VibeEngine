/**
 * Component - Base class for all components in the ECS
 * Components hold DATA only, no logic. Logic goes in Systems or Scripts.
 * 
 * @example
 * class HealthComponent extends Component {
 *   static readonly TYPE = 'Health';
 *   current = 100;
 *   max = 100;
 * }
 */

import type { Entity } from './Entity';

export abstract class Component {
    /** Unique type identifier - MUST be overridden by subclasses */
    static readonly TYPE: string = 'Component';

    /** Reference to the entity this component is attached to */
    entity: Entity | null = null;

    /** Whether this component is active */
    enabled: boolean = true;

    /**
     * Get the component type name
     */
    get type(): string {
        return (this.constructor as typeof Component).TYPE;
    }

    /**
     * Called when component is added to an entity
     */
    onAttach?(): void;

    /**
     * Called when component is enabled
     */
    onEnable?(): void;

    /**
     * Called when component is disabled
     */
    onDisable?(): void;

    /**
     * Called when component is removed from entity
     */
    onDetach?(): void;

    /**
     * Called when entity is destroyed
     */
    onDestroy?(): void;

    /**
     * Clone this component (for prefab instantiation)
     */
    clone(): Component {
        const cloned = Object.create(Object.getPrototypeOf(this));
        Object.assign(cloned, this);
        cloned.entity = null;
        return cloned;
    }
}

/** Type helper for component classes */
export type ComponentClass<T extends Component = Component> = {
    new(...args: any[]): T;
    readonly TYPE: string;
};
