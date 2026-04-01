import { create } from 'zustand';

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
    id: string;
    level: LogLevel;
    message: string;
    timestamp: number;
}

interface ConsoleState {
    logs: LogEntry[];
    addLog: (level: LogLevel, message: string) => void;
    clearLogs: () => void;
}

export const useConsoleStore = create<ConsoleState>((set) => ({
    logs: [
        { id: '1', level: 'success', message: 'VibeEngine Editor v1.0.0-beta initialized', timestamp: Date.now() },
        { id: '2', level: 'info', message: 'AI Copilot Bridge: Active', timestamp: Date.now() },
        { id: '3', level: 'info', message: 'Graphics: ACESFilmic Rendering Enabled', timestamp: Date.now() },
    ],
    addLog: (level, message) => set((state) => ({
        logs: [...state.logs, { 
            id: Math.random().toString(36).substr(2, 9), 
            level, 
            message, 
            timestamp: Date.now() 
        }]
    })),
    clearLogs: () => set({ logs: [] }),
}));
