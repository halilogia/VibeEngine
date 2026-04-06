

import React from 'react';
import { VibeIcons, VibeIconName } from '@ui/common/VibeIcons';
import { VibeTheme } from '@themes/VibeStyles';

declare module 'react' {
    interface CSSProperties {
        WebkitAppRegion?: 'drag' | 'no-drag';
    }
}

interface WindowControls {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    [key: string]: (() => void) | undefined;
}

declare global {
    interface Window {
        windowControls?: WindowControls;
    }
}

export const TitleBar: React.FC = () => {
    
    const handleAction = (action: string) => {
        const controls = window.windowControls;
        if (controls) {
            const fn = controls[action];
            if (fn) fn();
        }
    };

    return (
        <div style={{
            height: '32px',
            background: VibeTheme.colors.glassBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            userSelect: 'none',
            WebkitAppRegion: 'drag', 
            borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`
        }}>
            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                <img src="/assets/icon1.png" alt="V" style={{ height: '14px' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color: VibeTheme.colors.textMain }}>VIBEENGINE STUDIO</span>
            </div>

            {}
            <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 600, color: VibeTheme.colors.textSecondary }}>
                SOVEREIGN ELITE EDITION
            </div>

            {}
            <div style={{ display: 'flex', WebkitAppRegion: 'no-drag' }}>
                <WindowControlButton icon="Minus" onClick={() => handleAction('minimize')} />
                <WindowControlButton icon="Maximize" onClick={() => handleAction('maximize')} />
                <WindowControlButton icon="X" onClick={() => handleAction('close')} hoverColor="#ef4444" />
            </div>
        </div>
    );
};

const WindowControlButton: React.FC<{ icon: VibeIconName, onClick: () => void, hoverColor?: string }> = ({ icon, onClick, hoverColor }) => {
    const [hover, setHover] = React.useState(false);
    return (
        <div 
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: hover ? (hoverColor || VibeTheme.colors.bgSubtle) : 'transparent',
                transition: 'all 0.2s',
                color: hover ? (hoverColor ? '#fff' : VibeTheme.colors.textMain) : VibeTheme.colors.textSecondary,
            }}
        >
            <VibeIcons name={icon} size={12} color="currentColor" />
        </div>
    );
};