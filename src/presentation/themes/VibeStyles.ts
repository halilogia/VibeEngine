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
        accent: 'var(--editor-accent)',
        accentHover: 'var(--editor-accent-hover)',
        bgPrimary: 'var(--editor-bg-primary)',
        bgSecondary: 'var(--editor-bg-secondary)',
        border: 'var(--editor-border)',
        textMain: 'var(--editor-text-main)',
        textSecondary: 'var(--editor-text-secondary)',
        glassBg: 'rgba(10, 10, 15, 0.45)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
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
