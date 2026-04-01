import { create } from 'zustand';

export type LogLevel = 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
}

interface ConsoleState {
    logs: LogEntry[];
    addLog: (level: LogLevel, message: string) => void;
    clearLogs: () => void;
}

export const useConsoleStore = create<ConsoleState>((set) => ({
    logs: [
        { level: 'success', message: 'VibeEngine Editor v1.0.0-beta initialized', timestamp: new Date() },
        { level: 'info', message: 'AI Copilot Bridge: Active', timestamp: new Date() },
        { level: 'info', message: 'Graphics: ACESFilmic Rendering Enabled', timestamp: new Date() },
    ],
    addLog: (level, message) => set((state) => ({
        logs: [...state.logs, { level, message, timestamp: new Date() }]
    })),
    clearLogs: () => set({ logs: [] }),
}));
