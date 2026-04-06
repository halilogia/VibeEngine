

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const layoutStyles = createVibeStyles({
    appContainer: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: VibeTheme.colors.bgPrimary,
        overflow: 'hidden',
        color: VibeTheme.colors.textMain,
        fontFamily: "'Inter', sans-serif",
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        cursor: 'default',
    },
    topBar: {
        height: '48px', 
        flexShrink: 0,
        zIndex: 1000,
        background: VibeTheme.colors.glassBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
    },
    sidebarLeft: {
        width: '260px',
        height: '100%',
        background: VibeTheme.colors.bgPrimary,
        borderRight: `1px solid ${VibeTheme.colors.glassBorder}`,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
    },
    viewportArea: {
        flex: 1,
        position: 'relative',
        background: VibeTheme.colors.bgSecondary,
        overflow: 'hidden',
    },
    sidebarRight: {
        width: '320px',
        height: '100%',
        background: VibeTheme.colors.glassBg,
        backdropFilter: 'blur(35px)',
        borderLeft: `1px solid ${VibeTheme.colors.glassBorder}`,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
    },
    floatingLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
    },
    hudPanel: {
        position: 'absolute',
        pointerEvents: 'auto',
        background: VibeTheme.colors.glassBg,
        backdropFilter: 'blur(45px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
    },
    panelActive: {
        borderColor: VibeTheme.colors.accent,
        boxShadow: `0 0 20px ${VibeTheme.colors.accent}22`,
    },
});

export const PANEL_DIMENSIONS = {
    hierarchy: { width: 260, height: '100%' },
    inspector: { width: 320, height: '100%' },
    assets: { width: '100%', height: 320 },
    console: { width: 540, height: 300 },
    aiCopilot: { width: 420, height: 560 }
};
