/**
 * Toolbar (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useEditorStore, type EditorMode } from '@editor/stores';
import { useToastStore } from '@editor/stores/toastStore';
import { usePlayModeStore } from '@editor/core';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { toolbarStyles as styles } from './Toolbar.styles';

export const Toolbar: React.FC = () => {
    const { 
        editorMode, setEditorMode, 
        showGrid, toggleGrid, 
        showAxes, toggleAxes,
        showBloom, toggleBloom,
        showEnvironment, toggleEnvironment,
        togglePanel, showAICopilot, showScriptEditor
    } = useEditorStore();
    
    const { addToast } = useToastStore();
    const { isPlaying, isPaused, play, pause, stop } = usePlayModeStore();

    const handleSave = () => {
        addToast('Scene saved successfully', 'success');
    };

    const transformModes: { mode: EditorMode; icon: string; label: string }[] = [
        { mode: 'translate', icon: 'Move', label: 'Move' },
        { mode: 'rotate', icon: 'Rotate', label: 'Rotate' },
        { mode: 'scale', icon: 'Scale', label: 'Scale' },
    ];

    return (
        <div className="toolbar" style={styles.container}>
            {/* Left Section: Modes & Tools */}
            <div style={styles.section}>
                <div style={styles.group}>
                    {transformModes.map((m) => (
                        <VibeButton
                            key={m.mode}
                            variant={editorMode === m.mode ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setEditorMode(m.mode)}
                            title={m.label}
                        >
                            <VibeIcons name={m.icon as any} size={16} />
                        </VibeButton>
                    ))}
                </div>

                <div style={styles.divider} />

                <div style={styles.group}>
                    <VibeButton variant={showGrid ? 'primary' : 'ghost'} size="sm" onClick={toggleGrid} title="Toggle Grid">
                        <VibeIcons name="Grid" size={16} />
                    </VibeButton>
                    <VibeButton variant={showAxes ? 'primary' : 'ghost'} size="sm" onClick={toggleAxes} title="Toggle Axes">
                        <VibeIcons name="Axis" size={16} />
                    </VibeButton>
                </div>

                <div style={styles.group}>
                    <VibeButton variant={showBloom ? 'primary' : 'ghost'} size="sm" onClick={toggleBloom} title="Elite Bloom">
                        <VibeIcons name="Sparkles" size={16} />
                    </VibeButton>
                    <VibeButton variant={showEnvironment ? 'primary' : 'ghost'} size="sm" onClick={toggleEnvironment} title="Studio Env">
                        <VibeIcons name="Sun" size={16} />
                    </VibeButton>
                </div>
            </div>

            {/* Center Section: Play Controls */}
            <div style={styles.playControls}>
                {!isPlaying ? (
                    <VibeButton variant="primary" size="sm" onClick={play} title="Play Scene" style={{ borderRadius: '20px', background: '#10b981' }}>
                        <VibeIcons name="Play" size={16} />
                    </VibeButton>
                ) : (
                    <>
                        <VibeButton variant={isPaused ? 'primary' : 'ghost'} size="sm" onClick={pause} title="Pause">
                            <VibeIcons name="Pause" size={16} />
                        </VibeButton>
                        <VibeButton variant="danger" size="sm" onClick={stop} title="Stop & Restore" style={{ background: '#ef4444' }}>
                            <VibeIcons name="Square" size={16} />
                        </VibeButton>
                    </>
                )}
            </div>

            {/* Right Section: Features & Save */}
            <div style={styles.section}>
                <div style={styles.group}>
                    <VibeButton variant={showAICopilot ? 'primary' : 'ghost'} size="sm" onClick={() => togglePanel('aiCopilot')} title="AI Copilot">
                        <VibeIcons name="Bot" size={16} />
                    </VibeButton>
                    <VibeButton variant={showScriptEditor ? 'primary' : 'ghost'} size="sm" onClick={() => togglePanel('scriptEditor')} title="Code Editor">
                        <VibeIcons name="Code" size={16} />
                    </VibeButton>
                </div>
            </div>
        </div>
    );
};
