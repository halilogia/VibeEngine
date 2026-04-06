

import { CSSProperties } from 'react';

export type VibeStyleObject = {
    [key: string]: CSSProperties;
};

export const createVibeStyles = <T extends VibeStyleObject>(styles: T): T => {
    return styles;
};

export const VibeTheme = {
    colors: {
        accent: 'var(--vibe-accent)',
        accentHover: 'var(--vibe-accent-hover)',
        bgPrimary: 'var(--vibe-bg-primary)',
        bgSecondary: 'var(--vibe-bg-secondary)',
        bgSubtle: 'var(--vibe-bg-subtle)',
        border: 'var(--vibe-border)',
        textMain: 'var(--vibe-text-main)',
        textSecondary: 'var(--vibe-text-secondary)',
        glassBg: 'var(--vibe-glass-bg)',
        glassBorder: 'var(--vibe-glass-border)',
        error: 'var(--vibe-error)',
        success: 'var(--vibe-success)',
        warning: 'var(--vibe-warning)',
    },
    blur: {
        standard: 'var(--vibe-blur-standard)',
        deep: 'var(--vibe-blur-deep)',
    },
    radius: {
        panel: 'var(--vibe-radius-panel)',
        button: 'var(--vibe-radius-button)',
        pill: 'var(--vibe-radius-pill)',
    }
} as const;
