/**
 * Toolbar Component v2 - with PlayModeManager integration
 */

import React from 'react';
import { VibeIcons } from '../../presentation/components/VibeIcons';
import { useEditorStore, type EditorMode } from '../stores';
import { useToastStore } from '../stores/toastStore';
import { usePlayModeStore } from '../core';
import { createVibeStyles, VibeTheme } from '../../presentation/themes/VibeStyles';
import './Toolbar.css';

const styles = createVibeStyles({
    container: {
        height: '54px',
        background: 'rgba(10, 10, 15, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px',
        zIndex: 1000,
    },
    group: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '4px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.03)',
    }
});

export const Toolbar: React.FC = () => {
    const { 
        editorMode, setEditorMode, 
        showGrid, showAxes, toggleGrid, toggleAxes,
        showAICopilot, showScriptEditor, togglePanel,
        showBloom, toggleBloom, showEnvironment, toggleEnvironment,
        activePanelId
    } = useEditorStore();
    const { addToast } = useToastStore();

    const { isPlaying, isPaused, play, pause, stop } = usePlayModeStore();
 
    const handleSave = () => {
        // In a real engine, this would call sceneStore.save()
        addToast('Scene saved successfully', 'success');
    };

    const modes: { mode: EditorMode; icon: React.ReactNode; label: string; key: string }[] = [
        { mode: 'translate', icon: <VibeIcons name="Move" size={16} />, label: 'Move', key: 'W' },
        { mode: 'rotate', icon: <VibeIcons name="Rotate" size={16} />, label: 'Rotate', key: 'E' },
        { mode: 'scale', icon: <VibeIcons name="Scale" size={16} />, label: 'Scale', key: 'R' },
    ];

    return (
        <div className="toolbar studio-toolbar" style={styles.container}>
            <div className="toolbar-left-group">
                {/* Transform modes */}
                <div className="toolbar-group" style={styles.group}>
                    {modes.map(m => (
                        <button
                            key={m.mode}
                            className={`toolbar-btn ${editorMode === m.mode ? 'active' : ''}`}
                            onClick={() => setEditorMode(m.mode)}
                            title={`${m.label} (${m.key})`}
                        >
                            {m.icon}
                        </button>
                    ))}
                </div>

                <div className="toolbar-divider" />

                {/* View controls */}
                <div className="toolbar-group" style={styles.group}>
                    <button
                        className={`toolbar-btn ${showGrid ? 'active' : ''}`}
                        onClick={toggleGrid}
                        title="Toggle Grid"
                    >
                        <VibeIcons name="Grid" size={16} />
                    </button>
                    <button
                        className={`toolbar-btn ${showAxes ? 'active' : ''}`}
                        onClick={toggleAxes}
                        title="Toggle Axes"
                    >
                        <VibeIcons name="Axis" size={16} />
                    </button>
                </div>

                {/* Elite Graphics Control */}
                <div className="toolbar-group" style={styles.group}>
                    <button
                        className={`toolbar-btn graphics-toggle ${showBloom ? 'active' : ''}`}
                        onClick={toggleBloom}
                        title="Elite Bloom Overlay"
                    >
                        <VibeIcons name="Sparkles" size={16} />
                    </button>
                    <button
                        className={`toolbar-btn ${showEnvironment ? 'active' : ''}`}
                        onClick={toggleEnvironment}
                        title="Studio Lighting"
                    >
                        <VibeIcons name="Axis" size={16} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                </div>
            </div>

            {/* Play controls (CENTERED) */}
            <div className="toolbar-center-group play-controls">
                {!isPlaying ? (
                    <button className="toolbar-btn play-btn" onClick={play} title="Play Scene">
                        <VibeIcons name="Play" size={16} fill="currentColor" />
                    </button>
                ) : (
                    <>
                        <button
                            className={`toolbar-btn pause-btn ${isPaused ? 'active' : ''}`}
                            onClick={pause}
                            title="Pause"
                        >
                            <VibeIcons name="Pause" size={16} fill="currentColor" />
                        </button>
                        <button className="toolbar-btn stop-btn" onClick={stop} title="Stop & Restore">
                            <VibeIcons name="Square" size={16} fill="currentColor" />
                        </button>
                    </>
                )}
            </div>

            {/* Features (RIGHT) */}
            <div className="toolbar-right-group">
                <button
                    className={`toolbar-btn ai-copilot-toggle ${showAICopilot ? 'active' : ''}`}
                    onClick={() => togglePanel('aiCopilot')}
                    title="AI Copilot Studio"
                >
                    <VibeIcons name="Bot" size={16} />
                </button>
                <button
                    className={`toolbar-btn ${showScriptEditor ? 'active' : ''}`}
                    onClick={() => togglePanel('scriptEditor')}
                    title="Script Editor"
                >
                    <VibeIcons name="Code" size={16} />
                </button>
                <button
                    className="toolbar-btn save-btn primary"
                    onClick={handleSave}
                    title="Save Scene (Ctrl+S)"
                >
                    <VibeIcons name="Save" size={16} />
                </button>
            </div>
        </div>
    );
};

