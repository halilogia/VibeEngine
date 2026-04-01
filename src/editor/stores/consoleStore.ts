import { create } from 'zustand';

export type LogLevel = 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
    id: string;
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
        { id: '1', level: 'success', message: 'VibeEngine Editor v1.0.0-beta initialized', timestamp: new Date() },
        { id: '2', level: 'info', message: 'AI Copilot Bridge: Active', timestamp: new Date() },
        { id: '3', level: 'info', message: 'Graphics: ACESFilmic Rendering Enabled', timestamp: new Date() },
    ],
    addLog: (level, message) => set((state) => ({
        logs: [...state.logs, { 
            id: Math.random().toString(36).substr(2, 9), 
            level, 
            message, 
            timestamp: new Date() 
        }]
    })),
    clearLogs: () => set({ logs: [] }),
}));
