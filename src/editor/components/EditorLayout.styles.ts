/**
 * EditorLayout Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const layoutStyles = createVibeStyles({
    container: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        background: '#05050a',
        width: '100%',
        height: '100%',
    },
    viewportBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    overlayLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
    },
    panel: {
        pointerEvents: 'auto',
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 10, 15, 0.35)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '14px',
        boxShadow: `
            0 24px 60px -12px rgba(0, 0, 0, 0.8),
            0 12px 24px -8px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
        `,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    panelActive: {
        borderColor: 'rgba(99, 102, 241, 0.5)',
        boxShadow: `
            0 0 50px -10px rgba(99, 102, 241, 0.25),
            0 32px 90px -15px rgba(0, 0, 0, 0.95),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.15)
        `,
        zIndex: 100,
    },
    scriptOverlay: {
        position: 'absolute',
        top: '50px',
        left: '50px',
        right: '50px',
        bottom: '50px',
        zIndex: 1000,
        pointerEvents: 'auto',
        borderRadius: '16px',
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(50px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        boxShadow: '0 0 100px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden',
    }
});

// Default dimensions for panels
export const PANEL_DIMENSIONS = {
    hierarchy: { width: 300, height: '65vh' },
    inspector: { width: 340, height: '75vh' },
    assets: { width: 'calc(100vw - 700px)', height: 320 },
    console: { width: 540, height: 300 },
    aiCopilot: { width: 420, height: '60vh' }
};
