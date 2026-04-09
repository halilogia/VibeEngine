

import React, { useEffect, useRef, useState } from 'react';
import { VibeTheme, createVibeStyles } from '@themes/VibeStyles';

export interface ContextMenuItem {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
    divider?: boolean;
    disabled?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

const styles = createVibeStyles({
    menu: {
        position: 'fixed',
        minWidth: '180px',
        background: VibeTheme.colors.bgSecondary,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '10px',
        padding: '6px',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        zIndex: 9999,
        animation: 'context-fade-in 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        color: VibeTheme.colors.textSecondary,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        userSelect: 'none',
    },
    itemHover: {
        background: 'rgba(255, 255, 255, 0.08)',
        color: VibeTheme.colors.textMain,
    },
    itemDanger: {
        color: '#f43f5e',
    },
    itemDangerHover: {
        background: 'rgba(244, 63, 94, 0.2)',
        color: '#fb7185',
    },
    divider: {
        height: '1px',
        background: VibeTheme.colors.glassBorder,
        margin: '6px 8px',
    }
});

const animations = `
    @keyframes context-fade-in {
        from { opacity: 0; transform: scale(0.95) translateY(-4px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }
`;

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const adjustedX = Math.min(x, window.innerWidth - 200);
    const adjustedY = Math.min(y, window.innerHeight - (items.length * 40));

    return (
        <div 
            ref={menuRef}
            style={{ ...styles.menu, top: adjustedY, left: adjustedX }}
        >
            <style dangerouslySetInnerHTML={{ __html: animations }} />
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.divider && <div style={styles.divider} />}
                    <div 
                        style={{ 
                            ...styles.item, 
                            ...(item.danger ? styles.itemDanger : {}),
                            ...(hoveredIdx === index && !item.disabled ? (item.danger ? styles.itemDangerHover : styles.itemHover) : {}),
                            ...(item.disabled ? { opacity: 0.4, cursor: 'not-allowed', filter: 'grayscale(1)' } : {})
                        }}
                        onMouseEnter={() => !item.disabled && setHoveredIdx(index)}
                        onMouseLeave={() => !item.disabled && setHoveredIdx(null)}
                        onClick={() => { 
                            if (item.disabled) return;
                            item.onClick?.(); 
                            onClose(); 
                        }}
                    >
                        <span style={{ display: 'flex', opacity: 0.8 }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};
