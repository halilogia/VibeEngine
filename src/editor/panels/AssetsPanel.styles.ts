/**
 * AssetsPanel Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const assetsStyles = createVibeStyles({
    panel: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    toolbar: {
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    filterGroup: {
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
    },
    searchRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        overflow: 'auto',
        padding: '16px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'record(auto-fill, minmax(80px, 1fr))',
        gap: '12px',
    },
    assetItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '10px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        cursor: 'grab',
        transition: 'all 0.2s ease',
        position: 'relative',
    },
    assetItemHover: {
        background: 'rgba(255, 255, 255, 0.08)',
        borderColor: VibeTheme.colors.accent,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    iconWrapper: {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.2)',
    },
    assetName: {
        fontSize: '11px',
        fontWeight: 500,
        color: VibeTheme.colors.textSecondary,
        textAlign: 'center',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '16px',
    }
});
