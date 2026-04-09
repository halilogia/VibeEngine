import { Component } from "../core/Component";

export class CheckpointComponent extends Component {
  static readonly type = "CheckpointComponent";

  /** The order of the checkpoint (0 to N) */
  public index: number = 0;
  
  /** If true, passing this checkpoint completes the lap */
  public isFinishLine: boolean = false;
  
  /** Runtime visual state (optional) */
  public isNext: boolean = false;

  constructor(config: Partial<CheckpointComponent> = {}) {
    super();
    Object.assign(this, config);
  }
}
