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
        background: 'rgba(10, 10, 15, 0.4)',
    },
    toolbar: {
        padding: '12px 16px',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
    },
    filterGroup: {
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
    },
    searchRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flex: 1,
        maxWidth: '300px',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '16px',
    },
    assetItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '12px 8px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        cursor: 'grab',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
    },
    assetItemHover: {
        background: 'rgba(255, 255, 255, 0.08)',
        borderColor: `${VibeTheme.colors.accent}44`,
        transform: 'translateY(-4px)',
        shadow: `0 15px 30px -10px ${VibeTheme.colors.accent}44`,
    },
    breadcrumb: {
        gridColumn: '1 / -1',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 0 12px 0',
        fontSize: '11px',
        color: 'var(--vibe-text-secondary)',
        fontWeight: 600,
        opacity: 0.8,
    },
    breadcrumbItem: {
        cursor: 'pointer',
        transition: 'color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    iconWrapper: {
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
    },
    assetName: {
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--vibe-text-secondary)',
        textAlign: 'center',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        textAlign: 'center',
        gap: '20px',
        opacity: 0.8,
    }
});
