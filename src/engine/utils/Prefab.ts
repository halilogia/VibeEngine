import { Entity } from "@engine";
import type { Scene } from "@engine";
import { Component } from "@engine";

type ComponentFactory<T extends Component> = () => T;

interface PrefabComponentEntry {
  factory: ComponentFactory<Component>;
}

export class Prefab {
  readonly name: string;

  private readonly components: PrefabComponentEntry[] = [];

  private readonly tags: string[] = [];

  private readonly children: Prefab[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addComponent<T extends Component>(componentClass: new () => T): this {
    this.components.push({
      factory: () => new componentClass(),
    });
    return this;
  }

  addComponentFactory<T extends Component>(factory: () => T): this {
    this.components.push({ factory });
    return this;
  }

  addComponentInstance<T extends Component>(instance: T): this {
    this.components.push({
      factory: () => instance.clone(),
    });
    return this;
  }

  addTag(tag: string): this {
    this.tags.push(tag);
    return this;
  }

  addChild(prefab: Prefab): this {
    this.children.push(prefab);
    return this;
  }

  instantiate(scene?: Scene): Entity {
    const entity = new Entity(this.name);

    for (const entry of this.components) {
      const component = entry.factory();
      entity.addComponent(component);
    }

    for (const tag of this.tags) {
      entity.tags.add(tag);
    }

    for (const childPrefab of this.children) {
      const child = childPrefab.instantiate();
      entity.addChild(child);
    }

    if (scene) {
      scene.addEntity(entity);
    }

    return entity;
  }

  instantiateMany(count: number, scene?: Scene): Entity[] {
    const entities: Entity[] = [];
    for (let i = 0; i < count; i++) {
      entities.push(this.instantiate(scene));
    }
    return entities;
  }
}
