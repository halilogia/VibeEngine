import React from 'react';
import { motion } from 'framer-motion';
import { VibeTheme } from '@themes/VibeStyles';

interface VibeSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export const VibeSwitch: React.FC<VibeSwitchProps> = ({ checked, onChange, label, disabled }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '8px', opacity: disabled ? 0.5 : 1 }}>
            {label && <span style={{ fontSize: '12px', color: VibeTheme.colors.textMain, fontWeight: 500 }}>{label}</span>}
            <div 
                onClick={() => !disabled && onChange(!checked)}
                style={{
                    width: '32px',
                    height: '18px',
                    borderRadius: '20px',
                    background: checked ? VibeTheme.colors.accent : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: checked ? `0 0 10px ${VibeTheme.colors.accent}40` : 'none',
                }}
            >
                <motion.div 
                    animate={{ x: checked ? 14 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                        position: 'absolute',
                        top: '2px',
                        left: 0,
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                />
            </div>
        </div>
    );
};
