import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { System, Entity, UIComponent, TransformComponent } from "@engine";

export class UISystem extends System {
  readonly priority = 90; // Just before render systems
  private uiMap: Map<number, CSS2DObject> = new Map();

  initialize(): void {
    console.log("🌐 UISystem: HTML-Ready World-Space UI Core Enriched");
  }

  update(_deltaTime: number, entities: Entity[]): void {
    if (!this.app) return;

    for (const entity of entities) {
      const uiComp = entity.getComponent(UIComponent);
      const transform = entity.getComponent(TransformComponent);
      if (!uiComp || !transform) continue;

      let uiObject = this.uiMap.get(entity.id);

      // Create UI Object if missing
      if (!uiObject) {
        const div = document.createElement("div");
        div.className = uiComp.className;
        div.textContent = uiComp.content;

        // ELITE styling
        div.style.color = "#ffffff";
        div.style.padding = "4px 8px";
        div.style.background = "rgba(0, 0, 0, 0.6)";
        div.style.borderRadius = "4px";
        div.style.fontSize = "12px";
        div.style.border = "1px solid rgba(255, 255, 255, 0.2)";
        div.style.pointerEvents = "auto"; // Allow interaction

        uiObject = new CSS2DObject(div);
        this.uiMap.set(entity.id, uiObject);
        this.app.threeScene.add(uiObject);
      }

      // Update position (world pos + offset)
      uiObject.position.copy(transform.position).add(uiComp.offset);

      // Update visibility/content
      uiObject.visible = uiComp.visible;
      if (uiObject.element.textContent !== uiComp.content) {
        uiObject.element.textContent = uiComp.content;
      }
    }
  }

  onEntityRemoved(entity: Entity): void {
    const uiObject = this.uiMap.get(entity.id);
    if (uiObject && this.app) {
      this.app.threeScene.remove(uiObject);
      this.uiMap.delete(entity.id);
    }
  }

  destroy(): void {
    this.uiMap.forEach((v) => {
      if (this.app) this.app.threeScene.remove(v);
    });
    this.uiMap.clear();
  }
}
