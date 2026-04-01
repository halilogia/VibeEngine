/**
 * StatusBar Component (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React from 'react';
import { useEditorStore, useSceneStore } from '../stores';
import { VibeIcons } from '../../presentation/components/VibeIcons';
import { statusBarStyles as styles } from './StatusBar.styles';

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
                <VibeIcons name="Cursor" size={12} style={{ opacity: 0.6 }} />
                <span>Selected: <span style={styles.highlight}>{selectedName}</span></span>
            </div>

            <div style={styles.divider} />
            
            <div style={styles.group}>
                <span style={styles.modeBadge}>{editorMode.toUpperCase()}</span>
            </div>

            <div style={styles.group}>
                <div style={styles.fpsBadge}>
                    <VibeIcons name="Eye" size={12} style={{ color: '#10b981', opacity: 0.8 }} />
                    <span>FPS: <span style={styles.fpsValue}>60</span></span>
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
