import { type AICommand } from "./AICopilot";

declare global {
  interface Window {
    VibeAI: {
      execute: (command: string) => Promise<void>;
      executeBatch: (commands: AICommand[]) => void;
    };

    VibeLoading: {
      progress: number;
      status: "initializing" | "ready" | "stopped" | "error";
      modules: Record<string, "loading" | "success" | "error">;
      details: string;
    };

    VibeEngine: {
      app: unknown;
      initialize: () => void;
      scene: unknown;
    };
  }
}

export {};
