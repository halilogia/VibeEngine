/**
 * EditorLayout Component - Main layout with VibeMotion interactivity
 */

import React from 'react';
import { HierarchyPanel } from '../panels/HierarchyPanel';
import { ViewportPanel } from '../panels/ViewportPanel';
import { InspectorPanel } from '../panels/InspectorPanel';
import { AssetsPanel } from '../panels/AssetsPanel';
import { ConsolePanel } from '../panels/ConsolePanel';
import { ScriptEditorPanel } from '../panels/ScriptEditorPanel';
import { useEditorStore } from '../stores';
import { useVibeDrag } from '../../lib/vibe-motion/useVibeDrag';
import './EditorLayout.css';

export const EditorLayout: React.FC = () => {
    const { 
        showHierarchy, showInspector, showAssets, 
        showConsole, showScriptEditor, activePanelId, setActivePanel 
    } = useEditorStore();

    // VibeMotion Hooks for Each Panel
    const hierarchyDrag = useVibeDrag({ initialX: 20, initialY: 50 });
    const inspectorDrag = useVibeDrag({ initialX: window.innerWidth - 320, initialY: 50 });
    const assetsDrag = useVibeDrag({ initialX: 300, initialY: window.innerHeight - 320 });
    const consoleDrag = useVibeDrag({ initialX: window.innerWidth - 420, initialY: window.innerHeight - 250 });

    return (
        <div className="editor-layout">
            {/* Layer 1: Immserive Background (Viewport) */}
            <div className="viewport-backdrop">
                <ViewportPanel />
            </div>

            {/* Layer 2: Studio Tool Overlays */}
            <div className="studio-overlay-layer">
                
                {/* Floating Hierarchy */}
                {showHierarchy && (
                    <div 
                        ref={hierarchyDrag.targetRef as any}
                        {...hierarchyDrag.dragProps}
                        className={`floating-panel hierarchy-overlay ${activePanelId === 'hierarchy' ? 'active-panel' : ''}`}
                        onClick={() => setActivePanel('hierarchy')}
                    >
                        <HierarchyPanel />
                    </div>
                )}

                {/* Floating Inspector */}
                {showInspector && (
                    <div 
                        ref={inspectorDrag.targetRef as any}
                        {...inspectorDrag.dragProps}
                        className={`floating-panel inspector-overlay ${activePanelId === 'inspector' ? 'active-panel' : ''}`}
                        onClick={() => setActivePanel('inspector')}
                    >
                        <InspectorPanel />
                    </div>
                )}

                {/* Floating Assets */}
                {showAssets && !showScriptEditor && (
                    <div 
                        ref={assetsDrag.targetRef as any}
                        {...assetsDrag.dragProps}
                        className={`floating-panel assets-overlay ${activePanelId === 'assets' ? 'active-panel' : ''}`}
                        onClick={() => setActivePanel('assets')}
                    >
                        <AssetsPanel />
                    </div>
                )}

                {/* Floating Console */}
                {showConsole && !showScriptEditor && (
                    <div 
                        ref={consoleDrag.targetRef as any}
                        {...consoleDrag.dragProps}
                        className={`floating-panel console-overlay visible ${activePanelId === 'console' ? 'active-panel' : ''}`}
                        onClick={() => setActivePanel('console')}
                    >
                        <ConsolePanel />
                    </div>
                )}

                {/* Fullscreen Script Editor (Overlaying everything when open) */}
                {showScriptEditor && (
                    <div className="script-editor-overlay glass-panel">
                        <ScriptEditorPanel />
                    </div>
                )}
            </div>
        </div>
    );
};
