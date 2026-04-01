/**
 * VibeButton Atom - Sovereign Elite Button
 * Implements logic-driven hover/active states with TypeScript protection.
 * 🏛️⚛️💎🚀
 */

import React, { useState } from 'react';
import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

interface VibeButtonProps {
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    title?: string;
    className?: string;
    style?: React.CSSProperties;
}

const styles = createVibeStyles({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        userSelect: 'none',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
    },
    primary: {
        background: VibeTheme.colors.accent,
        color: '#fff',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
    },
    secondary: {
        background: 'rgba(255, 255, 255, 0.05)',
        color: VibeTheme.colors.textMain,
        borderColor: VibeTheme.colors.glassBorder,
    },
    ghost: {
        background: 'transparent',
        color: VibeTheme.colors.textSecondary,
    },
    danger: {
        background: 'rgba(244, 63, 94, 0.1)',
        color: '#f43f5e',
        borderColor: 'rgba(244, 63, 94, 0.2)',
    },
    sm: { height: '28px', padding: '0 10px', fontSize: '11px' },
    md: { height: '34px', padding: '0 16px', fontSize: '13px' },
    lg: { height: '42px', padding: '0 24px', fontSize: '15px' },
});

export const VibeButton: React.FC<VibeButtonProps> = ({ 
    onClick, children, variant = 'secondary', size = 'md', 
    disabled, title, className, style 
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const getVariantStyle = () => {
        let s = { ...styles[variant] };
        
        if (disabled) {
            return {
                ...s,
                opacity: 0.5,
                cursor: 'not-allowed',
                boxShadow: 'none',
            };
        }

        if (isActive) {
            return {
                ...s,
                transform: 'scale(0.96)',
                background: variant === 'primary' ? 'var(--editor-accent-hover)' : 'rgba(255, 255, 255, 0.1)',
            };
        }

        if (isHovered) {
             const variantStyle = styles[variant] as any;
             return {
                ...s,
                transform: 'translateY(-1px)',
                background: variant === 'primary' ? 'var(--editor-accent-hover)' : 'rgba(255, 255, 255, 0.08)',
                borderColor: variant === 'ghost' ? 'rgba(255, 255, 255, 0.1)' : variantStyle.borderColor,
                boxShadow: variant === 'primary' ? '0 8px 25px rgba(99, 102, 241, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
                color: '#fff',
            };
        }

        return s;
    };

    const combinedStyle: React.CSSProperties = {
        ...styles.base,
        ...styles[size],
        ...getVariantStyle(),
        ...style
    };

    return (
        <button
            className={`vibe-btn ${className || ''}`}
            style={combinedStyle}
            onClick={!disabled ? onClick : undefined}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
            onMouseDown={() => !disabled && setIsActive(true)}
            onMouseUp={() => setIsActive(false)}
            title={title}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
