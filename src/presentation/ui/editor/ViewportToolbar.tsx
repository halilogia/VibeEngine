/**
 * ViewportToolbar (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useEditorStore } from '@editor/stores';
import { VibeTheme, createVibeStyles } from '@themes/VibeStyles';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';

const styles = createVibeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px',
        background: 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'auto',
    },
    group: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    divider: {
        width: '1px',
        height: '20px',
        background: 'rgba(255, 255, 255, 0.08)',
        margin: '0 4px',
    }
});

export const ViewportToolbar: React.FC = () => {
    const { 
        shadingMode, setShadingMode, 
        showGrid, toggleGrid, 
        showAxes, toggleAxes,
        showBloom, toggleBloom,
        showEnvironment, toggleEnvironment
    } = useEditorStore();

    return (
        <div style={styles.container}>
            <div style={styles.group}>
                <VibeButton variant={shadingMode === 'lit' ? 'primary' : 'ghost'} size="sm" onClick={() => setShadingMode('lit')} title="Lit">
                    <VibeIcons name="Box" size={14} />
                </VibeButton>
                <VibeButton variant={shadingMode === 'wireframe' ? 'primary' : 'ghost'} size="sm" onClick={() => setShadingMode('wireframe')} title="Wireframe">
                    <VibeIcons name="Grid" size={14} />
                </VibeButton>
                <VibeButton variant={shadingMode === 'solid' ? 'primary' : 'ghost'} size="sm" onClick={() => setShadingMode('solid')} title="Solid">
                    <VibeIcons name="Layers" size={14} />
                </VibeButton>
            </div>

            <div style={styles.divider} />

            <div style={styles.group}>
                <VibeButton variant={showGrid ? 'primary' : 'ghost'} size="sm" onClick={toggleGrid} title="Toggle Grid">
                    <VibeIcons name="Grid" size={14} />
                </VibeButton>
                <VibeButton variant={showAxes ? 'primary' : 'ghost'} size="sm" onClick={toggleAxes} title="Toggle Axes">
                    <VibeIcons name="Axis" size={14} />
                </VibeButton>
            </div>

            <div style={styles.divider} />

            <div style={styles.group}>
                <VibeButton variant={showBloom ? 'primary' : 'ghost'} size="sm" onClick={toggleBloom} title="Bloom Effect">
                    <VibeIcons name="Sparkles" size={14} />
                </VibeButton>
                <VibeButton variant={showEnvironment ? 'primary' : 'ghost'} size="sm" onClick={toggleEnvironment} title="Studio Light">
                    <VibeIcons name="Sun" size={14} />
                </VibeButton>
            </div>
        </div>
    );
};
