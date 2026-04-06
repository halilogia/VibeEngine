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
    Object.assign(cloned, this);
    cloned.entity = null;
    return cloned;
  }
}

export type ComponentClass<T extends Component = Component> = {
  new (...args: unknown[]): T;
  readonly TYPE: string;
};
