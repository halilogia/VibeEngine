import { AIProvider } from "../../../features/editor/bridge/NeuralService";

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    thought?: string;
    thoughtCollapsed?: boolean;
    timestamp: Date;
    commands?: any[];
    streaming?: boolean;
}

export interface AICopilotPanelProps {
    dragHandleProps?: any;
}

export interface ModelOption {
    provider: string;
    model: string;
}
