export interface Command {
  type: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thought?: string;
  thoughtCollapsed?: boolean;
  timestamp: Date;
  commands?: Command[];
  streaming?: boolean;
}

export interface AICopilotPanelProps {
  dragHandleProps?: unknown;
}

export interface ModelOption {
  provider: string;
  model: string;
}
