/**
 * StatusBar Component - Thin glass bar at the bottom for quick stats
 */

import React from 'react';
import { useEditorStore, useSceneStore } from '../stores';
import { Cpu, Layout, Eye, MousePointer2 } from 'lucide-react';
import './StatusBar.css';

export const StatusBar: React.FC = () => {
    const { selectedEntityId, editorMode } = useEditorStore();
    const { entities } = useSceneStore();
    
    const entityCount = entities.size;
    const selectedName = selectedEntityId !== null ? entities.get(selectedEntityId)?.name : 'None';

    return (
        <div className="status-bar glass-panel">
            <div className="status-group">
                <Layout size={12} />
                <span>Entities: {entityCount}</span>
            </div>
            
            <div className="status-divider" />
            
            <div className="status-group">
                <MousePointer2 size={12} />
                <span>Selected: <span className="entity-highlight">{selectedName}</span></span>
            </div>

            <div className="status-divider" />
            
            <div className="status-group">
                <span className="mode-badge">{editorMode.toUpperCase()}</span>
            </div>

            <div className="status-spacer" />
            
            <div className="status-group fps-counter">
                <Eye size={12} />
                <span>FPS: <span className="fps-value">60</span></span>
            </div>
            
            <div className="status-divider" />
            
            <div className="status-group version-badge">
                <Cpu size={12} />
                <span>VibeEngine v1.0.0 Sovereign Beta</span>
            </div>
        </div>
    );
};
