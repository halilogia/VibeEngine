/**
 * ScriptEditorPanel Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const scriptStyles = createVibeStyles({
    panel: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0a0f',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        height: '36px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
    },
    tabs: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        overflowX: 'auto',
        height: '100%',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 14px',
        height: '100%',
        color: VibeTheme.colors.textSecondary,
        fontSize: '12px',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        borderRight: `1px solid ${VibeTheme.colors.glassBorder}`,
        transition: 'all 0.15s ease',
        position: 'relative',
        userSelect: 'none',
    },
    tabActive: {
        background: '#0a0a0f',
        color: VibeTheme.colors.accent,
        borderBottom: `2px solid ${VibeTheme.colors.accent}`,
    },
    tabHover: {
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
    },
    dirtyDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#f59e0b',
        boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
    },
    closeBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        opacity: 0.6,
    },
    closeBtnHover: {
        background: 'rgba(244, 63, 94, 0.2)',
        color: '#f43f5e',
        opacity: 1,
    },
    editorContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: VibeTheme.colors.textSecondary,
        textAlign: 'center',
    },
    badge: {
        fontSize: '11px',
        fontWeight: 700,
        color: VibeTheme.colors.accent,
        background: 'rgba(99, 102, 241, 0.1)',
        padding: '2px 8px',
        borderRadius: '4px',
        border: `1px solid rgba(99, 102, 241, 0.2)`,
    }
});
