import { Component } from "../core/Component";
import * as THREE from "three";

export type UIType = "Label" | "Button" | "HealthBar" | "Panel";

export interface UIParams {
  type?: UIType;
  content?: string;
  offset?: THREE.Vector3;
  className?: string;
  visible?: boolean;
}

export class UIComponent extends Component {
  static readonly TYPE = "UI";

  uiType: UIType;
  content: string;
  offset: THREE.Vector3;
  className: string;
  visible: boolean;

  constructor(params: UIParams = {}) {
    super();
    this.uiType = params.type ?? "Label";
    this.content = params.content ?? "VibeEntity";
    this.offset = params.offset ?? new THREE.Vector3(0, 2, 0);
    this.className = params.className ?? "vibe-ui-element";
    this.visible = params.visible ?? true;
  }
}
