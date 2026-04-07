

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
    },
    watermark: {
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        fontWeight: 200,
        letterSpacing: '8px',
        color: 'rgba(255,255,255,0.15)',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        userSelect: 'none',
    },
    performanceHud: {
        position: 'absolute',
        bottom: '80px',
        right: '25px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
        pointerEvents: 'none',
    },
    performanceItem: {
        fontSize: '10px',
        fontFamily: "'JetBrains Mono', monospace",
        color: 'rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    performanceValue: {
        color: VibeTheme.colors.accent,
        fontWeight: 700,
        minWidth: '50px',
        textAlign: 'right',
    },
    cameraInfo: {
        position: 'absolute',
        top: '25px',
        right: '25px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        pointerEvents: 'none',
    },
    cameraBadge: {
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        padding: '4px 10px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '10px',
        fontWeight: 600,
        color: '#60a5fa',
    }
});

export const viewportAnimations = `
    @keyframes live-pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
`;
