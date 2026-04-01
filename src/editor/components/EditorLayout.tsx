/**
 * EditorLayout (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
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
import { layoutStyles as styles, PANEL_DIMENSIONS } from './EditorLayout.styles';

export const EditorLayout: React.FC = () => {
    const { 
        showHierarchy, showInspector, showAssets, 
        showConsole, showAICopilot, showScriptEditor, activePanelId, setActivePanel 
    } = useEditorStore();

    // Default positioning logic
    const getDefaults = () => {
        const gap = 20;
        return {
            hierarchy: { x: gap, y: 74 },
            inspector: { x: window.innerWidth - (340 + gap), y: 74 },
            assets: { x: 360, y: window.innerHeight - (340 + 60) },
            console: { x: window.innerWidth - (560 + gap), y: window.innerHeight - (320 + 60) },
            ai: { x: window.innerWidth / 2 - 210, y: 150 }
        };
    };

    const hDrag = useVibeDrag({ initialX: getDefaults().hierarchy.x, initialY: getDefaults().hierarchy.y });
    const iDrag = useVibeDrag({ initialX: getDefaults().inspector.x, initialY: getDefaults().inspector.y });
    const aDrag = useVibeDrag({ initialX: getDefaults().assets.x, initialY: getDefaults().assets.y });
    const cDrag = useVibeDrag({ initialX: getDefaults().console.x, initialY: getDefaults().console.y });
    const aiDrag = useVibeDrag({ initialX: getDefaults().ai.x, initialY: getDefaults().ai.y });

    useEffect(() => {
        const handleReset = (immediate = false) => {
            const d = getDefaults();
            hDrag.setPosition(d.hierarchy.x, d.hierarchy.y, immediate);
            iDrag.setPosition(d.inspector.x, d.inspector.y, immediate);
            aDrag.setPosition(d.assets.x, d.assets.y, immediate);
            cDrag.setPosition(d.console.x, d.console.y, immediate);
            aiDrag.setPosition(d.ai.x, d.ai.y, immediate);
        };
        (window as any).resetVibeLayout = () => handleReset(false);
        handleReset(true);
        return () => { (window as any).resetVibeLayout = undefined; };
    }, [hDrag, iDrag, aDrag, cDrag, aiDrag]);

    return (
        <div style={styles.container}>
            <div style={styles.viewportBackdrop}>
                <ViewportPanel />
            </div>

            <div style={styles.overlayLayer}>
                {showHierarchy && (
                    <div 
                        ref={hDrag.targetRef as any}
                        onClick={() => setActivePanel('hierarchy')}
                        style={{ 
                            ...styles.panel, 
                            ...PANEL_DIMENSIONS.hierarchy,
                            ...(activePanelId === 'hierarchy' ? styles.panelActive : {})
                        }}
                    >
                        <HierarchyPanel dragHandleProps={hDrag.dragProps} />
                    </div>
                )}

                {showInspector && (
                    <div 
                        ref={iDrag.targetRef as any}
                        onClick={() => setActivePanel('inspector')}
                        style={{ 
                            ...styles.panel, 
                            ...PANEL_DIMENSIONS.inspector,
                            ...(activePanelId === 'inspector' ? styles.panelActive : {})
                        }}
                    >
                        <InspectorPanel dragHandleProps={iDrag.dragProps} />
                    </div>
                )}

                {showAssets && !showScriptEditor && (
                    <div 
                        ref={aDrag.targetRef as any}
                        onClick={() => setActivePanel('assets')}
                        style={{ 
                            ...styles.panel, 
                            ...PANEL_DIMENSIONS.assets,
                            ...(activePanelId === 'assets' ? styles.panelActive : {})
                        }}
                    >
                        <AssetsPanel dragHandleProps={aDrag.dragProps} />
                    </div>
                )}

                {showConsole && !showScriptEditor && (
                    <div 
                        ref={cDrag.targetRef as any}
                        onClick={() => setActivePanel('console')}
                        style={{ 
                            ...styles.panel, 
                            ...PANEL_DIMENSIONS.console,
                            ...(activePanelId === 'console' ? styles.panelActive : {})
                        }}
                    >
                        <ConsolePanel dragHandleProps={cDrag.dragProps} />
                    </div>
                )}

                {showAICopilot && !showScriptEditor && (
                    <div 
                        ref={aiDrag.targetRef as any}
                        onClick={() => setActivePanel('aiCopilot')}
                        style={{ 
                            ...styles.panel, 
                            ...PANEL_DIMENSIONS.aiCopilot,
                            ...(activePanelId === 'aiCopilot' ? styles.panelActive : {})
                        }}
                    >
                        <AICopilotPanel dragHandleProps={aiDrag.dragProps} />
                    </div>
                )}

                {showScriptEditor && (
                    <div style={styles.scriptOverlay}>
                        <ScriptEditorPanel />
                    </div>
                )}
            </div>
        </div>
    );
};
