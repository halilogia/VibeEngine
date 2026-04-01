/**
 * Toolbar Component v2 - with PlayModeManager integration
 */

import React from 'react';
import {
    Move, RotateCcw, Expand,
    Play, Pause, Square,
    Grid3X3, Axis3D,
    Maximize2, Sparkles, Code2
} from 'lucide-react';
import { useEditorStore, type EditorMode } from '../stores';
import { usePlayModeStore } from '../core';
import './Toolbar.css';

export const Toolbar: React.FC = () => {
    const { 
        editorMode, setEditorMode, 
        showGrid, showAxes, toggleGrid, toggleAxes,
        showAICopilot, showScriptEditor, togglePanel
    } = useEditorStore();
    const { isPlaying, isPaused, play, pause, stop } = usePlayModeStore();

    const modes: { mode: EditorMode; icon: React.ReactNode; label: string; key: string }[] = [
        { mode: 'translate', icon: <Move size={16} />, label: 'Move', key: 'W' },
        { mode: 'rotate', icon: <RotateCcw size={16} />, label: 'Rotate', key: 'E' },
        { mode: 'scale', icon: <Expand size={16} />, label: 'Scale', key: 'R' },
    ];

    return (
        <div className="toolbar">
            {/* Transform modes */}
            <div className="toolbar-group-container">
                <span className="group-label">Transform</span>
                <div className="toolbar-group">
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
            </div>

            <div className="toolbar-divider" />

            {/* View controls */}
            <div className="toolbar-group-container">
                <span className="group-label">View</span>
                <div className="toolbar-group">
                    <button
                        className={`toolbar-btn ${showGrid ? 'active' : ''}`}
                        onClick={toggleGrid}
                        title="Toggle Grid"
                    >
                        <Grid3X3 size={16} />
                    </button>
                    <button
                        className={`toolbar-btn ${showAxes ? 'active' : ''}`}
                        onClick={toggleAxes}
                        title="Toggle Axes"
                    >
                        <Axis3D size={16} />
                    </button>
                </div>
            </div>

            <div className="toolbar-spacer" />

            {/* AI Co-pilot & Script Editor */}
            <div className="toolbar-group-container">
                <span className="group-label">Features</span>
                <div className="toolbar-group features-group">
                    <button
                        className={`toolbar-btn ai-copilot-toggle ${showAICopilot ? 'active' : ''}`}
                        onClick={() => togglePanel('aiCopilot')}
                        title="AI Co-pilot Chat"
                    >
                        <Sparkles size={16} />
                    </button>
                    <button
                        className={`toolbar-btn ${showScriptEditor ? 'active' : ''}`}
                        onClick={() => togglePanel('scriptEditor')}
                        title="Script Editor"
                    >
                        <Code2 size={16} />
                    </button>
                </div>
            </div>

            <div className="toolbar-spacer" />

            {/* Play controls */}
            <div className="toolbar-group play-controls">
                {!isPlaying ? (
                    <button className="toolbar-btn play-btn" onClick={play} title="Play Scene">
                        <Play size={16} />
                    </button>
                ) : (
                    <>
                        <button
                            className={`toolbar-btn ${isPaused ? 'active' : ''}`}
                            onClick={pause}
                            title="Pause"
                        >
                            <Pause size={16} />
                        </button>
                        <button className="toolbar-btn stop-btn" onClick={stop} title="Stop & Restore">
                            <Square size={16} />
                        </button>
                    </>
                )}
            </div>

            <div className="toolbar-spacer" />

            {/* Maximize */}
            <div className="toolbar-group">
                <button className="toolbar-btn" title="Maximize Viewport">
                    <Maximize2 size={16} />
                </button>
            </div>
        </div>
    );
};
