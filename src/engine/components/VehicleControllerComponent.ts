import { Component } from "../core/Component";

export class VehicleControllerComponent extends Component {
  static readonly type = "VehicleControllerComponent";

  // Movement Constants
  public acceleration: number = 30.0;
  public maxSpeed: number = 50.0;
  public steeringSensitivity: number = 2.5;
  public brakeForce: number = 15.0;
  public driftFactor: number = 0.95;

  // Runtime State
  public currentSpeed: number = 0;
  public currentSteering: number = 0;
  public isBraking: boolean = false;
  
  // Input References (optional mapping)
  public inputForward: string = "moveForward";
  public inputBackward: string = "moveBackward";
  public inputLeft: string = "moveLeft";
  public inputRight: string = "moveRight";
  public inputBrake: string = "jump"; // Mapping Space to brake

  constructor(config: Partial<VehicleControllerComponent> = {}) {
    super();
    Object.assign(this, config);
  }
}
