/**
 * HierarchyPanel Styles - Sovereign TypeScript Styling
 * Implements architectural separation of design and layout.
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const hierarchyStyles = createVibeStyles({
    panel: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    toolbar: {
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
    },
    searchWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 8px',
        height: '32px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    content: {
        flex: 1,
        overflow: 'auto',
        padding: '8px 0',
    },
    treeItem: {
        display: 'flex',
        alignItems: 'center',
        height: '28px',
        padding: '0 12px',
        cursor: 'pointer',
        fontSize: '13px',
        color: VibeTheme.colors.textSecondary,
        transition: 'all 0.15s ease',
        userSelect: 'none',
        gap: '8px',
    },
    treeItemHover: {
        background: 'rgba(255, 255, 255, 0.04)',
        color: VibeTheme.colors.textMain,
    },
    treeItemSelected: {
        background: 'rgba(99, 102, 241, 0.15)',
        color: '#fff',
        borderLeft: `2px solid ${VibeTheme.colors.accent}`,
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '12px',
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#fff',
        margin: 0,
    },
    emptyDesc: {
        fontSize: '12px',
        color: VibeTheme.colors.textSecondary,
        margin: 0,
        maxWidth: '200px',
        lineHeight: 1.5,
    }
});
