

import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useToastStore, type ToastType } from '@infrastructure/store/toastStore';
import { VibeTheme, createVibeStyles } from '@themes/VibeStyles';

const styles = createVibeStyles({
    container: {
        position: 'fixed',
        bottom: '40px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 10000,
        pointerEvents: 'none',
    },
    item: {
        pointerEvents: 'auto',
        minWidth: '280px',
        maxWidth: '360px',
        padding: '14px 18px',
        background: 'rgba(15, 15, 25, 0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '12px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        animation: 'toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        position: 'relative',
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        flex: 1,
        fontSize: '13px',
        lineHeight: 1.4,
        fontWeight: 600,
        color: '#fff',
    },
    close: {
        background: 'transparent',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.4)',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
    }
});

const animations = `
    @keyframes toast-in {
        from { opacity: 0; transform: translateX(50px) scale(0.9); }
        to { opacity: 1; transform: translateX(0) scale(1); }
    }
`;

const getToastIcon = (type: ToastType) => {
    switch (type) {
        case 'success': return { name: 'Plus' as const, color: '#10b981' };
        case 'error': return { name: 'Trash' as const, color: '#f43f5e' };
        case 'warning': return { name: 'Settings' as const, color: '#fbbf24' };
        default: return { name: 'Search' as const, color: '#60a5fa' };
    }
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div style={styles.container}>
            <style dangerouslySetInnerHTML={{ __html: animations }} />
            {toasts.map((toast) => {
                const icon = getToastIcon(toast.type);
                return (
                    <div key={toast.id} style={styles.item}>
                        <div style={styles.icon}>
                            <VibeIcons name={icon.name} size={16} style={{ color: icon.color }} />
                        </div>
                        <div style={styles.message}>{toast.message}</div>
                        <button 
                            style={styles.close}
                            onClick={() => removeToast(toast.id)}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <VibeIcons name="Plus" size={14} style={{ transform: 'rotate(45deg)' }} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
