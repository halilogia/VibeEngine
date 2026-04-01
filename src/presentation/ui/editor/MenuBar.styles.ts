/**
 * Unified MenuBar Styles (Sovereign Minimalist Edition)
 * 🏛️⚛&💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const menuBarStyles = createVibeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '48px',
        background: 'rgba(5, 5, 10, 0.6)',
        backdropFilter: 'blur(30px) saturate(160%)',
        WebkitBackdropFilter: 'blur(30px) saturate(160%)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        padding: '0 12px',
        userSelect: 'none',
        zIndex: 2000,
        position: 'relative',
    },
    logoGroup: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
    },
    trigger: {
        padding: '4px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        color: VibeTheme.colors.textSecondary,
        transition: 'all 0.2s ease',
        position: 'relative',
    },
    triggerActive: {
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#fff',
    },
    playbackGroup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 10,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: '0',
        minWidth: '220px',
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(40px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '8px',
        padding: '6px',
        zIndex: 3000,
        marginTop: '6px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
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
    dividerVertical: {
        width: '1px',
        height: '24px',
        background: 'rgba(255, 255, 255, 0.08)',
        margin: '0 12px',
    },
    divider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.05)',
        margin: '6px 8px',
    },
    sceneBadge: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#fff',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '4px 12px',
        borderRadius: '4px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    }
});
