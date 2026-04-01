/**
 * StatusBar Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const statusBarStyles = createVibeStyles({
    container: {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        height: '32px',
        minWidth: '600px',
        background: 'rgba(10, 10, 15, 0.45)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        gap: '20px',
        fontSize: '11px',
        color: VibeTheme.colors.textSecondary,
        zIndex: 1000,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    group: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        whiteSpace: 'nowrap',
    },
    divider: {
        width: '1px',
        height: '14px',
        background: 'rgba(255, 255, 255, 0.08)',
    },
    highlight: {
        color: VibeTheme.colors.accent,
        fontWeight: 700,
        letterSpacing: '0.3px',
    },
    fpsBadge: {
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '2px 10px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    fpsValue: {
        color: '#10b981',
        fontWeight: 800,
        fontFamily: 'monospace',
    },
    modeBadge: {
        background: 'rgba(99, 102, 241, 0.15)',
        color: VibeTheme.colors.accent,
        padding: '2px 8px',
        borderRadius: '12px',
        fontWeight: 800,
        fontSize: '10px',
        letterSpacing: '1px',
        border: `1px solid rgba(99, 102, 241, 0.2)`,
    },
    version: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: 500,
        fontSize: '10px',
    }
});
