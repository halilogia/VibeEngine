import { Component } from "../core/Component";

export type WeatherType = "clear" | "rain" | "snow" | "storm";

export interface WeatherParams {
  weatherType?: WeatherType;
  intensity?: number;
  timeOfDay?: number; // 0 to 24 (0 = midnight, 12 = noon)
  windSpeed?: number;
}

export class WeatherComponent extends Component {
  static readonly TYPE = "Weather";
  weatherType: WeatherType;
  intensity: number;
  timeOfDay: number;
  windSpeed: number;

  constructor(params: WeatherParams = {}) {
    super();
    this.weatherType = params.weatherType ?? "clear";
    this.intensity = params.intensity ?? 0.5;
    this.timeOfDay = params.timeOfDay ?? 12;
    this.windSpeed = params.windSpeed ?? 1.0;
  }
}
