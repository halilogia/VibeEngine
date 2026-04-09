import type { Entity } from "./Entity";

export abstract class Component {
  static readonly TYPE: string = "Component";

  entity: Entity | null = null;

  enabled: boolean = true;

  get type(): string {
    return (this.constructor as typeof Component).TYPE;
  }

  onAttach?(): void;

  onEnable?(): void;

  onDisable?(): void;

  onDetach?(): void;

  onDestroy?(): void;

  clone(): Component {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.getOwnPropertyNames(this).forEach((key) => {
      const value = (this as Record<string, unknown>)[key];
      if (value && typeof value === 'object' && 'clone' in value && typeof (value as { clone: unknown }).clone === 'function') {
        (cloned as Record<string, unknown>)[key] = (value as { clone: () => unknown }).clone();
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        (cloned as Record<string, unknown>)[key] = { ...value };
      } else {
        (cloned as Record<string, unknown>)[key] = value;
      }
    });
    cloned.entity = null;
    return cloned;
  }
}

export type ComponentClass<T extends Component = Component> = {
  new (...args: any[]): T;
  readonly TYPE: string;
};