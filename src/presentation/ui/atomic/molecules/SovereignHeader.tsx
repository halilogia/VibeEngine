/**
 * SovereignHeader Molecule - Standardized Studio Panel Header
 * Consolidates Drag Handle, Icon, Title, and Action buttons.
 * 🏛️⚛️💎🖱️🚀
 */

import React from 'react';
import { VibeIcons, type VibeIconName } from '@ui/common/VibeIcons';
import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

interface SovereignHeaderProps {
    title: string;
    icon: VibeIconName;
    dragHandleProps?: any;
    actions?: React.ReactNode;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    iconColor?: string;
}

const styles = createVibeStyles({
    header: {
        cursor: 'grab',
        userSelect: 'none',
        height: '38px',
        background: 'rgba(255, 255, 255, 0.04)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box',
    },
    dragHandle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '14px',
        height: '14px',
        color: 'rgba(255, 255, 255, 0.4)',
        cursor: 'grab',
        transition: 'color 0.2s ease',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
    },
    title: {
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        color: VibeTheme.colors.textMain,
        margin: 0,
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    }
});

export const SovereignHeader: React.FC<SovereignHeaderProps> = ({ 
    title, icon, dragHandleProps, actions, children, style, iconColor 
}) => {
    return (
        <div 
            className="sovereign-panel-header" 
            style={{ ...styles.header, ...style }} 
            {...dragHandleProps}
        >
            <div className="drag-handle-pill" style={styles.dragHandle}>
                <VibeIcons name="Grip" size={14} />
            </div>

            <div className="panel-header-left" style={styles.left}>
                <VibeIcons 
                    name={icon} 
                    size={14} 
                    style={{ color: iconColor || VibeTheme.colors.accent }} 
                />
                <h2 style={styles.title}>{title}</h2>
                {children}
            </div>

            {actions && (
                <div className="panel-header-actions" style={styles.actions} onClick={e => e.stopPropagation()}>
                    {actions}
                </div>
            )}
        </div>
    );
};
