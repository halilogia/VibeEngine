/**
 * Toolbar Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const toolbarStyles = createVibeStyles({
    container: {
        height: '56px',
        background: VibeTheme.colors.glassBg,
        backdropFilter: 'blur(30px) saturate(150%)',
        WebkitBackdropFilter: 'blur(30px) saturate(150%)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    group: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: VibeTheme.colors.bgSubtle,
        padding: '4px',
        borderRadius: '12px',
        border: `1px solid ${VibeTheme.colors.border}`,
    },
    section: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    playControls: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        padding: '4px 16px',
        background: VibeTheme.colors.bgSecondary,
        borderRadius: '30px',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
    },
    divider: {
        width: '1px',
        height: '24px',
        background: VibeTheme.colors.glassBorder,
    }
});
