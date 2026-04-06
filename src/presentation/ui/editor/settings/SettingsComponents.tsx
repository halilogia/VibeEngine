import React from 'react';
import { motion } from 'framer-motion';
import { VibeTheme } from '@themes/VibeStyles';

interface GroupProps {
    title: string;
    children: React.ReactNode;
}

export const SettingsGroup: React.FC<GroupProps> = ({ title, children }) => (
    <section style={{
        padding: '1.25rem', 
        background: VibeTheme.colors.bgSubtle, 
        border: `1px solid ${VibeTheme.colors.border}`, 
        borderRadius: '6px',
        marginBottom: '1rem'
    }}>
        <div style={{
            fontSize: '11px', 
            fontWeight: 700, 
            color: VibeTheme.colors.textSecondary, 
            letterSpacing: '1px', 
            marginBottom: '1rem',
            textTransform: 'uppercase'
        }}>
            {title}
        </div>
        {children}
    </section>
);

export const SettingsGrid: React.FC<{ children: React.ReactNode; columns?: string }> = ({ children, columns = '1fr 1fr' }) => (
    <div style={{ display: 'grid', gridTemplateColumns: columns, gap: '1.25rem' }}>
        {children}
    </div>
);

export const SettingsField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12.5px', fontWeight: 500, color: VibeTheme.colors.textMain }}>
            {label}
        </label>
        {children}
    </div>
);

const eliteInputBaseStyle: React.CSSProperties = {
    width: '100%', 
    padding: '8px 12px', 
    background: VibeTheme.colors.bgSecondary, 
    border: `1px solid ${VibeTheme.colors.glassBorder}`,
    borderRadius: '4px', 
    color: VibeTheme.colors.textMain, 
    fontSize: '13px', 
    outline: 'none', 
    transition: 'all 0.15s ease',
    fontFamily: 'inherit'
};

export const SettingsInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        style={{ 
            ...eliteInputBaseStyle, 
            opacity: props.disabled ? 0.4 : 1,
            cursor: props.disabled ? 'not-allowed' : 'text',
            ...props.style 
        }} 
        onFocus={(e) => {
            if (props.disabled) return;
            e.currentTarget.style.borderColor = VibeTheme.colors.accent;
            e.currentTarget.style.boxShadow = `0 0 0 1px ${VibeTheme.colors.accent}40`;
        }}
        onBlur={(e) => {
            if (props.disabled) return;
            e.currentTarget.style.borderColor = VibeTheme.colors.glassBorder;
            e.currentTarget.style.boxShadow = 'none';
        }}
    />
);

export const SettingsSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }> = ({ options, ...props }) => (
    <select 
        {...props} 
        style={{ 
            ...eliteInputBaseStyle, appearance: 'auto', 
            opacity: props.disabled ? 0.4 : 1,
            cursor: props.disabled ? 'not-allowed' : 'pointer',
            ...props.style 
        }}
        onFocus={(e) => {
            if (props.disabled) return;
            e.currentTarget.style.borderColor = VibeTheme.colors.accent;
        }}
        onBlur={(e) => {
            if (props.disabled) return;
            e.currentTarget.style.borderColor = VibeTheme.colors.glassBorder;
        }}
    >
        {options.map(opt => <option key={opt} value={opt} style={{ background: VibeTheme.colors.bgPrimary, color: VibeTheme.colors.textMain }}>{opt}</option>)}
    </select>
);

export const SettingsToggle: React.FC<{ label: string; checked?: boolean; onChange?: (val: boolean) => void }> = ({ label, checked = false, onChange }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onChange?.(!checked)}>
            <div style={{
                width: '32px', height: '18px', borderRadius: '10px',
                background: checked ? VibeTheme.colors.accent : VibeTheme.colors.border,
                position: 'relative', transition: 'all 0.2s ease',
            }}>
                <motion.div 
                    initial={false}
                    animate={{ x: checked ? 16 : 2 }}
                    style={{
                        width: '14px', height: '14px', background: '#fff', borderRadius: '50%',
                        position: 'absolute', top: '2px', left: '0',
                    }}
                />
            </div>
            <span style={{ color: checked ? VibeTheme.colors.textMain : VibeTheme.colors.textSecondary, fontSize: '13px', fontWeight: 500, transition: 'color 0.2s' }}>
                {label}
            </span>
        </div>
    );
};
