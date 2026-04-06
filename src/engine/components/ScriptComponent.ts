import { Component } from "@engine";
import type { Entity } from "@engine";
import type { Application } from "@engine";
import type { ComponentClass } from "@engine";

export abstract class Script {
  scriptComponent: ScriptComponent | null = null;

  get entity(): Entity | null {
    return this.scriptComponent?.entity ?? null;
  }

  get app(): Application | null {
    return this.scriptComponent?.app ?? null;
  }

  getComponent<T extends Component>(type: ComponentClass<T>): T | null {
    return this.entity?.getComponent(type) ?? null;
  }

  initialize?(): void;

  start?(): void;

  update?(deltaTime: number): void;

  lateUpdate?(deltaTime: number): void;

  destroy?(): void;

  clone(): Script {
    const cloned = Object.create(Object.getPrototypeOf(this));

    Object.assign(cloned, this);
    cloned.scriptComponent = null;
    return cloned;
  }
}

export class ScriptComponent extends Component {
  static readonly TYPE = "Script";

  readonly scripts: Script[] = [];

  app: Application | null = null;

  private started: boolean = false;

  addScript<T extends Script>(script: T): T {
    script.scriptComponent = this;
    this.scripts.push(script);

    if (this.entity && script.initialize) {
      script.initialize();
    }

    if (this.started && this.entity?.enabled && script.start) {
      script.start();
    }

    return script;
  }

  getScript<T extends Script>(type: new (...args: unknown[]) => T): T | null {
    return (this.scripts.find((s) => s instanceof type) as T) ?? null;
  }

  removeScript(script: Script): boolean {
    const index = this.scripts.indexOf(script);
    if (index === -1) return false;

    if (script.destroy) script.destroy();
    script.scriptComponent = null;
    this.scripts.splice(index, 1);
    return true;
  }

  initializeAll(): void {
    for (const script of this.scripts) {
      if (script.initialize) script.initialize();
    }
  }

  startAll(): void {
    if (this.started) return;
    this.started = true;

    for (const script of this.scripts) {
      if (script.start) script.start();
    }
  }

  updateAll(deltaTime: number): void {
    for (const script of this.scripts) {
      if (script.update) script.update(deltaTime);
    }
  }

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
