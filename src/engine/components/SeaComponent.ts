import { Component } from "../core/Component";

export interface SeaParams {
  speed?: number;
  amplitude?: number;
  frequency?: number;
  color?: string;
  transparency?: number;
  reflection?: boolean;
}

export class SeaComponent extends Component {
  speed: number;
  amplitude: number;
  frequency: number;
  color: string;
  transparency: number;
  reflection: boolean;

  constructor(params: SeaParams = {}) {
    super();
    this.speed = params.speed ?? 1.5;
    this.amplitude = params.amplitude ?? 0.8;
    this.frequency = params.frequency ?? 1.0;
    this.color = params.color ?? "#1e3a8a";
    this.transparency = params.transparency ?? 0.85;
    this.reflection = params.reflection ?? true;
  }
}
