/**
 * EditorLayout Component - High-Performance Sovereign Studio Layout
 * Restores the Elite Studio feel with Smart-Docked glassmorphic panels.
 */

import React, { useEffect } from 'react';
import { HierarchyPanel } from '../panels/HierarchyPanel';
import { ViewportPanel } from '../panels/ViewportPanel';
import { InspectorPanel } from '../panels/InspectorPanel';
import { AssetsPanel } from '../panels/AssetsPanel';
import { ConsolePanel } from '../panels/ConsolePanel';
import { AICopilotPanel } from '../panels/AICopilotPanel';
import { ScriptEditorPanel } from '../panels/ScriptEditorPanel';
import { useEditorStore } from '../stores';
import { useVibeDrag } from '../../lib/vibe-motion/useVibeDrag';
import './EditorLayout.css';

export const EditorLayout: React.FC = () => {
    const { 
        showHierarchy, showInspector, showAssets, 
        showConsole, showAICopilot, showScriptEditor, activePanelId, setActivePanel 
    } = useEditorStore();

    // --- 🏛️ Sovereign Heroic Anchors (Safe-Zone) ---
    // Using mathematically distinct coordinates to ensure zero-overlap on smaller viewports.
    const getDefaults = () => {
        const gap = 20;
        const panelWidth = 340;
        const bottomPanelHeight = 340;

        return {
            hierarchy: { x: gap, y: 74 },
            inspector: { x: window.innerWidth - (panelWidth + gap), y: 74 },
            assets: { x: panelWidth + (gap * 2), y: window.innerHeight - (bottomPanelHeight + 60) },
            console: { x: window.innerWidth - (520 + gap), y: window.innerHeight - (300 + 60) },
            aiCopilot: { x: window.innerWidth / 2 - 200, y: 150 } // Center-ish default
        };
    };

    const hDrag = useVibeDrag({ initialX: getDefaults().hierarchy.x, initialY: getDefaults().hierarchy.y });
    const iDrag = useVibeDrag({ initialX: getDefaults().inspector.x, initialY: getDefaults().inspector.y });
    const aDrag = useVibeDrag({ initialX: getDefaults().assets.x, initialY: getDefaults().assets.y });
    const cDrag = useVibeDrag({ initialX: getDefaults().console.x, initialY: getDefaults().console.y });
    const aiDrag = useVibeDrag({ initialX: getDefaults().aiCopilot.x, initialY: getDefaults().aiCopilot.y });

    // Handle signals to reset layout
    useEffect(() => {
        const handleReset = (immediate = false) => {
            const defaults = getDefaults();
            hDrag.setPosition(defaults.hierarchy.x, defaults.hierarchy.y, immediate);
            iDrag.setPosition(defaults.inspector.x, defaults.inspector.y, immediate);
            aDrag.setPosition(defaults.assets.x, defaults.assets.y, immediate);
            cDrag.setPosition(defaults.console.x, defaults.console.y, immediate);
            aiDrag.setPosition(defaults.aiCopilot.x, defaults.aiCopilot.y, immediate);
        };

        (window as any).resetVibeLayout = () => handleReset(false);
        handleReset(true);

        return () => { (window as any).resetVibeLayout = undefined; };
    }, [hDrag, iDrag, aDrag, cDrag, aiDrag]);


    return (
        <div className="editor-layout">
            {/* --- Layer 1: Immserive Background (The Viewport) --- */}
            <div className="viewport-backdrop">
                <ViewportPanel />
            </div>

            {/* --- Layer 2: Sovereign Stuido Overlays --- */}
            <div className="studio-overlay-layer">
                
                {/* 🏰 [Sovereign] Hierarchy Panel */}
                {showHierarchy && (
                    <div 
                        ref={hDrag.targetRef as any}
                        className={`sovereign-panel hierarchy-frame ${activePanelId === 'hierarchy' ? 'active-glow' : ''}`}
                        onClick={() => setActivePanel('hierarchy')}
                        style={{ zIndex: activePanelId === 'hierarchy' ? 100 : 10 }}
                    >
                        <HierarchyPanel dragHandleProps={hDrag.dragProps} />
                    </div>
                )}

                {/* 🔬 [Sovereign] Inspector Panel */}
                {showInspector && (
                    <div 
                        ref={iDrag.targetRef as any}
                        className={`sovereign-panel inspector-frame ${activePanelId === 'inspector' ? 'active-glow' : ''}`}
                        onClick={() => setActivePanel('inspector')}
                        style={{ zIndex: activePanelId === 'inspector' ? 100 : 10 }}
                    >
                        <InspectorPanel dragHandleProps={iDrag.dragProps} />
                    </div>
                )}

                {/* 📦 [Sovereign] Assets Panel */}
                {showAssets && !showScriptEditor && (
                    <div 
                        ref={aDrag.targetRef as any}
                        className={`sovereign-panel assets-frame ${activePanelId === 'assets' ? 'active-glow' : ''}`}
                        onClick={() => setActivePanel('assets')}
                        style={{ zIndex: activePanelId === 'assets' ? 100 : 10 }}
                    >
                        <AssetsPanel dragHandleProps={aDrag.dragProps} />
                    </div>
                )}

                {/* 📟 [Sovereign] Console Panel */}
                {showConsole && !showScriptEditor && (
                    <div 
                        ref={cDrag.targetRef as any}
                        className={`sovereign-panel console-frame visible ${activePanelId === 'console' ? 'active-glow' : ''}`}
                        onClick={() => setActivePanel('console')}
                        style={{ zIndex: activePanelId === 'console' ? 100 : 10 }}
                    >
                        <ConsolePanel dragHandleProps={cDrag.dragProps} />
                    </div>
                )}

                {/* 🤖 [Sovereign] AI Copilot Panel */}
                {showAICopilot && !showScriptEditor && (
                    <div 
                        ref={aiDrag.targetRef as any}
                        className={`sovereign-panel ai-copilot-frame ${activePanelId === 'aiCopilot' ? 'active-glow' : ''}`}
                        onClick={() => setActivePanel('aiCopilot')}
                        style={{ zIndex: activePanelId === 'aiCopilot' ? 100 : 12 }}
                    >
                        <AICopilotPanel dragHandleProps={aiDrag.dragProps} />
                    </div>
                )}



                {/* 📜 Fullscreen Script Overlay */}
                {showScriptEditor && (
                    <div className="script-editor-overlay glass-panel">
                        <ScriptEditorPanel />
                    </div>
                )}
            </div>
        </div>
    );
};

