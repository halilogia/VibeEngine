import { Component } from "../core/Component";
import { ActionMapping } from "../systems/InputSystem";

export class InputReceiverComponent extends Component {
  static readonly TYPE = "InputReceiver";
  
  mappings: Map<string, ActionMapping> = new Map();
  playerId: number = 0;

  constructor(playerId = 0) {
    super();
    this.playerId = playerId;
  }

  addOverride(mapping: ActionMapping): void {
    this.mappings.set(mapping.name, mapping);
  }
}
