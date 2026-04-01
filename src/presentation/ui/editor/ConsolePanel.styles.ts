/**
 * ConsolePanel Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const consoleStyles = createVibeStyles({
    panel: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    toolbar: {
        padding: '8px 16px',
        background: VibeTheme.colors.bgSubtle,
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    filters: {
        display: 'flex',
        gap: '4px',
        background: VibeTheme.colors.glassBg,
        padding: '4px',
        borderRadius: '20px',
        border: `1px solid ${VibeTheme.colors.border}`,
    },
    content: {
        flex: 1,
        overflow: 'auto',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '12px',
    },
    entry: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '10px 16px',
        borderLeft: '4px solid transparent',
        borderBottom: `1px solid ${VibeTheme.colors.border}`,
        transition: 'all 0.1s ease',
    },
    entryHover: {
        background: VibeTheme.colors.bgSubtle,
    },
    time: {
        flexShrink: 0,
        color: VibeTheme.colors.textSecondary,
        fontSize: '10px',
        fontWeight: 700,
        opacity: 0.5,
        marginTop: '2px',
    },
    message: {
        flex: 1,
        color: VibeTheme.colors.textMain,
        lineHeight: 1.5,
        wordBreak: 'break-word',
    },
    info: { borderLeftColor: '#60a5fa' },
    warn: { borderLeftColor: '#fbbf24', background: 'rgba(251, 191, 36, 0.03)' },
    error: { borderLeftColor: '#f43f5e', background: 'rgba(251, 113, 133, 0.05)' },
    success: { borderLeftColor: '#10b981', background: 'rgba(52, 211, 153, 0.03)' },
    empty: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
        gap: '12px',
    }
});
