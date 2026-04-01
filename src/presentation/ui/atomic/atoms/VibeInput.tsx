/**
 * VibeInput Atom - Sovereign Elite Input
 * Type-safe styling and logic-driven focus states.
 * 🏛️⚛️💎🚀
 */

import React, { useState } from 'react';
import { createVibeStyles, VibeTheme } from '../../themes/VibeStyles';

interface VibeInputProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const styles = createVibeStyles({
    wrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minWidth: '0',
    },
    input: {
        width: '100%',
        height: '32px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '6px',
        padding: '0 12px',
        color: VibeTheme.colors.textMain,
        fontSize: '13px',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
    },
});

export const VibeInput: React.FC<VibeInputProps> = ({ 
    value, onChange, placeholder, type = 'text', 
    className, style, disabled, onKeyDown 
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const getDynamicStyles = (): React.CSSProperties => {
        if (disabled) {
            return {
                opacity: 0.5,
                cursor: 'not-allowed',
            };
        }

        if (isFocused) {
            return {
                borderColor: VibeTheme.colors.accent,
                background: 'rgba(255, 255, 255, 0.08)',
                boxShadow: `0 0 10px rgba(99, 102, 241, 0.2)`,
            };
        }

        return {};
    };

    const combinedStyle: React.CSSProperties = {
        ...styles.input,
        ...getDynamicStyles(),
        ...style
    };

    return (
        <div className={`vibe-input-wrapper ${className || ''}`} style={styles.wrapper}>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={combinedStyle}
                disabled={disabled}
                onKeyDown={onKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </div>
    );
};
