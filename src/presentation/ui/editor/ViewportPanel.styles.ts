/**
 * ViewportPanel Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const viewportStyles = createVibeStyles({
    panel: {
        position: 'relative',
        width: '100%',
        height: '100%',
        background: VibeTheme.colors.bgPrimary,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    canvasContainer: {
        flex: 1,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stats: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: VibeTheme.colors.glassBg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        width: 'fit-content',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
    },
    statsItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: VibeTheme.colors.textSecondary,
    },
    statsHighlight: {
        color: VibeTheme.colors.accent,
        fontWeight: 700,
    },
    liveBadge: {
        position: 'absolute',
        top: '16px',
        left: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
    },
    liveDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#ef4444',
        boxShadow: '0 0 10px #ef4444',
    },
    liveText: {
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '1.5px',
        color: VibeTheme.colors.textMain,
        textTransform: 'uppercase',
    }
});

export const viewportAnimations = `
    @keyframes live-pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
`;
