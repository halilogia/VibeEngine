

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const inspectorStyles = createVibeStyles({
    panel: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    section: {
        background: VibeTheme.colors.bgSubtle,
        borderRadius: '8px',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        overflow: 'hidden',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        background: VibeTheme.colors.glassBg,
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: '12px',
        fontWeight: 600,
        color: VibeTheme.colors.textMain,
    },
    sectionBody: {
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    fieldLabel: {
        fontSize: '11px',
        fontWeight: 700,
        color: VibeTheme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    vectorGroup: {
        display: 'flex',
        gap: '4px',
    },
    vectorField: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        background: VibeTheme.colors.bgSecondary,
        borderRadius: '4px',
        border: `1px solid ${VibeTheme.colors.border}`,
        overflow: 'hidden',
    },
    vectorLabel: {
        width: '18px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 900,
        color: VibeTheme.colors.textMain,
        opacity: 0.8,
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
