/**
 * StatusBar Component (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React from 'react';
import { useEditorStore, useSceneStore } from '@infrastructure/store';
import { VibeIcons } from '@ui/common/VibeIcons';
import { VibeTheme } from '@themes/VibeStyles';
import { statusBarStyles as styles } from './StatusBar.styles';

const FPSCounter: React.FC = () => {
    const [fps, setFps] = React.useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => {
            const current = (window as any).VibeFPS || 0;
            if (current !== fps) setFps(current);
        }, 1000);
        return () => clearInterval(interval);
    }, [fps]);
    return <span style={{ color: fps > 60 ? '#10b981' : (fps > 30 ? '#f59e0b' : '#ef4444'), fontWeight: 900 }}>{fps} FPS</span>;
};

export const StatusBar: React.FC = () => {
    const { selectedEntityId, editorMode } = useEditorStore();
    const { entities } = useSceneStore();
    
    const entityCount = entities.size;
    const selectedName = selectedEntityId !== null ? entities.get(selectedEntityId)?.name : 'None';

    return (
        <div className="status-bar" style={styles.container}>
            <div style={styles.group}>
                <VibeIcons name="Layers" size={12} style={{ opacity: 0.6 }} />
                <span>Entities: <span style={styles.highlight}>{entityCount}</span></span>
            </div>

            <div style={styles.divider} />

            <div style={styles.group}>
                <div style={styles.fpsBadge}>
                    <VibeIcons name="Activity" size={12} style={{ color: '#10b981', opacity: 0.8 }} />
                    <FPSCounter />
                </div>
            </div>
            
            <div style={styles.group}>
                <VibeIcons name="Cursor" size={12} style={{ opacity: 0.6 }} />
                <span>Selected: <span style={styles.highlight}>{selectedName}</span></span>
            </div>

            <div style={styles.divider} />
            
            <div style={styles.section}>
                <div style={{ ...styles.badge, background: 'rgba(99, 102, 241, 0.1)', color: VibeTheme.colors.accent, fontWeight: 900 }}>
                    {editorMode === 'translate' ? 'MOVE MODE' : editorMode.toUpperCase() + ' MODE'}
                </div>
            </div>

            <div style={styles.divider} />
            
            <div style={{ ...styles.group, ...styles.version }}>
                <VibeIcons name="Cpu" size={12} />
                <span>VibeEngine v1.0.0 Sovereign Elite</span>
            </div>
        </div>
    );
};
