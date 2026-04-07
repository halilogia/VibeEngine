import { Component } from "../core/Component";

export type LightType = "ambient" | "directional" | "point" | "spot";

export interface LightParams {
  type?: LightType;
  color?: string;
  intensity?: number;
  castShadow?: boolean;
  shadowBias?: number;
  shadowMapSize?: number;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
}

export class LightComponent extends Component {
  static readonly TYPE = "Light";

  lightType: LightType;
  color: string;
  intensity: number;
  castShadow: boolean;
  shadowBias: number;
  shadowMapSize: number;
  distance: number;
  decay: number;
  angle: number;
  penumbra: number;

  constructor(params: LightParams = {}) {
    super();
    this.lightType = params.type ?? "directional";
    this.color = params.color ?? "#ffffff";
    this.intensity = params.intensity ?? 1.0;
    this.castShadow = params.castShadow ?? true;
    this.shadowBias = params.shadowBias ?? -0.0001;
    this.shadowMapSize = params.shadowMapSize ?? 2048;
    this.distance = params.distance ?? 0;
    this.decay = params.decay ?? 2;
    this.angle = params.angle ?? Math.PI / 3;
    this.penumbra = params.penumbra ?? 0;
  }
}
