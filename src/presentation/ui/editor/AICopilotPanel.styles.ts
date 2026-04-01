/**
 * AICopilotPanel Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const aiStyles = createVibeStyles({
    panel: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: VibeTheme.colors.bgPrimary,
        overflow: 'visible',
    },
    header: {
        padding: '10px 16px',
        background: VibeTheme.colors.bgSubtle,
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    chatArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    message: {
        display: 'flex',
        gap: '14px',
        maxWidth: '90%',
        animation: 'msg-slide 0.3s ease-out',
    },
    messageUser: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: VibeTheme.colors.bgSecondary,
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        flexShrink: 0,
    },
    avatarUser: {
        background: VibeTheme.colors.accent,
        color: VibeTheme.colors.textMain,
    },
    bubble: {
        background: VibeTheme.colors.bgSecondary,
        backdropFilter: 'blur(10px)',
        padding: '12px 16px',
        borderRadius: '16px',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        fontSize: '13px',
        lineHeight: 1.6,
        color: VibeTheme.colors.textMain,
    },
    bubbleUser: {
        background: VibeTheme.colors.accent,
        borderColor: 'transparent',
    },
    inputArea: {
        padding: '16px',
        borderTop: `1px solid ${VibeTheme.colors.glassBorder}`,
        background: VibeTheme.colors.glassBg,
    },
    inputWrapper: {
        display: 'flex',
        gap: '10px',
        background: VibeTheme.colors.bgSubtle,
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '12px',
        padding: '6px 6px 6px 14px',
        transition: 'all 0.2s ease',
    },
    inputWrapperFocus: {
        borderColor: VibeTheme.colors.accent,
        boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
    },
    quickActions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px',
    },
    modelBadge: {
        fontSize: '10px',
        fontWeight: 800,
        color: VibeTheme.colors.accent,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        opacity: 0.6,
    }
});

export const aiAnimations = `
    @keyframes msg-slide {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
`;
