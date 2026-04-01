/**
 * MenuBar Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const menuBarStyles = createVibeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '40px',
        background: 'rgba(10, 10, 15, 0.45)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        padding: '0 16px',
        userSelect: 'none',
        zIndex: 1000,
    },
    logoGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingRight: '20px',
        cursor: 'pointer',
    },
    logoText: {
        fontSize: '13px',
        fontWeight: 900,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: '#fff',
    },
    trigger: {
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        color: VibeTheme.colors.textSecondary,
        transition: 'all 0.2s ease',
        position: 'relative',
    },
    triggerActive: {
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#fff',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: '0',
        minWidth: '220px',
        background: 'rgba(15, 15, 25, 0.9)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '10px',
        padding: '6px',
        zIndex: 2000,
        marginTop: '4px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        color: VibeTheme.colors.textSecondary,
        transition: 'all 0.15s ease',
    },
    menuItemHover: {
        background: VibeTheme.colors.accent,
        color: '#fff',
    },
    shortcut: {
        fontSize: '10px',
        opacity: 0.5,
        marginLeft: 'auto',
        fontFamily: 'monospace',
    },
    divider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.05)',
        margin: '6px 8px',
    },
    sceneBadge: {
        fontSize: '12px',
        fontWeight: 700,
        color: '#fff',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '4px 14px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    }
});
