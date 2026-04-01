/**
 * Global Type Definitions for VibeEngine Bridge
 */

import { type AICommand } from './AICopilot';

declare global {
    interface Window {
        /**
         * VibeAI - Natural Language AI command execution bridge.
         */
        VibeAI: {
            execute: (command: string) => Promise<void>;
            executeBatch: (commands: AICommand[]) => void;
        };

        /**
         * VibeLoading - Initialization status bridge for Splash Screen.
         */
        VibeLoading: {
            progress: number;
            status: 'initializing' | 'ready';
            modules: Record<string, 'success' | 'error'>;
            details: string;
        };

        /**
         * VibeEngine - Main engine entry point.
         */
        VibeEngine: {
            app: any; // External engine core (third party/compiled)
            initialize: () => void;
            scene: any;
        };
    }
}

export {};
