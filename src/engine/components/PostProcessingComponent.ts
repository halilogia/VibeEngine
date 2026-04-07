import { Component } from "../core/Component";

export interface PostProcessingParams {
  bloomEnabled?: boolean;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  exposure?: number;
  toneMapping?: number;
}

export class PostProcessingComponent extends Component {
  static readonly TYPE = "PostProcessing";

  bloomEnabled: boolean;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  exposure: number;
  toneMapping: number;

  constructor(params: PostProcessingParams = {}) {
    super();
    this.bloomEnabled = params.bloomEnabled ?? true;
    this.bloomStrength = params.bloomStrength ?? 1.5;
    this.bloomRadius = params.bloomRadius ?? 0.4;
    this.bloomThreshold = params.bloomThreshold ?? 0.85;
    this.exposure = params.exposure ?? 1.0;
    this.toneMapping = params.toneMapping ?? 3; // ACESFilmic
  }
}
