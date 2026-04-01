/**
 * VibeStyles - Sovereign TypeScript Styling System
 * Provides type-safe styling objects for VibeEngine components.
 * 🏛️💎 CSS-in-TS Architecture
 */

import { CSSProperties } from 'react';

export type VibeStyleObject = {
    [key: string]: CSSProperties;
};

/**
 * Utility to define and verify Sovereign styles
 */
export const createVibeStyles = <T extends VibeStyleObject>(styles: T): T => {
    return styles;
};

/**
 * Global Sovereign Theme Tokens (Synced with index.css)
 */
export const VibeTheme = {
    colors: {
        accent: '#6366f1',
        accentHover: '#4f46e5',
        bgPrimary: '#05050a',
        bgSecondary: '#0a0a15',
        border: 'rgba(255, 255, 255, 0.08)',
        textMain: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.65)',
        glassBg: 'rgba(10, 10, 15, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.12)',
    },
    blur: {
        standard: 'blur(45px)',
        deep: 'blur(60px)',
    },
    radius: {
        panel: '14px',
        pill: '100px',
    }
} as const;
