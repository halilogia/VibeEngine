/**
 * ScriptEditorPanel (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useEditorStore, useSceneStore } from '../stores';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';
import { scriptStyles as styles } from './ScriptEditorPanel.styles';

// #region Components
interface TabProps {
    name: string;
    isActive: boolean;
    isDirty: boolean;
    onClick: () => void;
    onClose: () => void;
}

const ScriptTab: React.FC<TabProps> = ({ name, isActive, isDirty, onClick, onClose }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{ 
                ...styles.tab, 
                ...(isActive ? styles.tabActive : {}),
                ...(isHovered && !isActive ? styles.tabHover : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <VibeIcons name="Code" size={14} style={{ opacity: isActive ? 1 : 0.6 }} />
            <span>{name}</span>
            {isDirty && <div style={styles.dirtyDot} />}
            {(isHovered || isActive) && (
                <button
                    style={{ 
                        ...styles.closeBtn,
                        ...(isHovered ? styles.closeBtnHover : {})
                    }}
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    <VibeIcons name="Plus" size={12} style={{ transform: 'rotate(45deg)' }} />
                </button>
            )}
        </div>
    );
};
// #endregion

interface ScriptEditorPanelProps {
    dragHandleProps?: any;
}

export const ScriptEditorPanel: React.FC<ScriptEditorPanelProps> = ({ dragHandleProps }) => {
    const { activePanelId, setActivePanel } = useEditorStore();
    const { selectedEntityId, entities } = useSceneStore();
    const [openScripts, setOpenScripts] = useState<{ id: string; name: string; isDirty: boolean }[]>([
        { id: '1', name: 'PlayerController.ts', isDirty: true },
        { id: '2', name: 'GameManager.ts', isDirty: false }
    ]);
    const [activeScriptId, setActiveScriptId] = useState('1');

    const selectedEntity = selectedEntityId ? entities.get(selectedEntityId) : null;

    if (openScripts.length === 0) {
        return (
            <div 
                className={`editor-panel script-editor-panel ${activePanelId === 'scripts' ? 'active-panel' : ''}`}
                onClick={() => setActivePanel('scripts')}
                style={styles.panel}
            >
                <div style={styles.emptyState}>
                    <VibeIcons name="Code" size={48} style={{ opacity: 0.1, color: VibeTheme.colors.accent }} />
                    <h3 style={{ margin: 0, color: '#fff' }}>NO SCRIPTS OPEN</h3>
                    <p style={{ margin: 0, fontSize: '12px' }}>Open a script from the Assets panel to start coding.</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`editor-panel script-editor-panel ${activePanelId === 'scripts' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('scripts')}
            style={styles.panel}
        >
            <div style={styles.header}>
                <div style={styles.tabs}>
                    {openScripts.map(script => (
                        <ScriptTab
                            key={script.id}
                            name={script.name}
                            isActive={activeScriptId === script.id}
                            isDirty={script.isDirty}
                            onClick={() => setActiveScriptId(script.id)}
                            onClose={() => setOpenScripts(prev => prev.filter(s => s.id !== script.id))}
                        />
                    ))}
                    <button style={{ ...styles.tab, background: 'transparent', border: 'none', width: '36px', padding: 0 }}>
                        <VibeIcons name="Plus" size={14} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '4px' }}>
                    {selectedEntity && (
                        <div style={styles.badge}>TARGET: {selectedEntity.name.toUpperCase()}</div>
                    )}
                    <VibeButton variant="primary" size="sm">
                        <VibeIcons name="Save" size={14} /> SAVE
                    </VibeButton>
                </div>
            </div>

            <div style={styles.editorContainer}>
                {/* Monaco Editor Placeholder */}
                <div style={{ padding: '20px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'monospace' }}>
                    <div>{"1 | class PlayerController extends Entity {"}</div>
                    <div>{"2 |   onUpdate(dt: number) {"}</div>
                    <div>{"3 |     const input = this.engine.input;"}</div>
                    <div>{"4 |     if (input.isKeyDown('Space')) {"}</div>
                    <div>{"5 |       this.jump();"}</div>
                    <div>{"6 |     }"}</div>
                    <div>{"7 |   }"}</div>
                    <div>{"8 | }"}</div>
                </div>
            </div>
        </div>
    );
};
