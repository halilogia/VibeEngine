/**
 * EditorLayout (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useEffect } from 'react';
import { 
    HierarchyPanel, 
    ViewportPanel, 
    InspectorPanel, 
    AssetsPanel, 
    ConsolePanel, 
    AICopilotPanel, 
    ScriptEditorPanel,
    MenuBar,
    StatusBar,
    Toolbar
} from './index';
import { useEditorStore } from '@infrastructure/store';
import { useVibeDrag } from '@lib/vibe-motion/useVibeDrag';
import { layoutStyles as styles, PANEL_DIMENSIONS } from './EditorLayout.styles';
import { VibeErrorBoundary } from '@ui/common/VibeErrorBoundary';

export const EditorLayout: React.FC = () => {
    const { 
        showHierarchy, showInspector, showAICopilot, activePanelId, setActivePanel 
    } = useEditorStore();

    // Only AI Copilot remains floating as an interactive Assistant HUD
    const aiInitial = { x: window.innerWidth / 2 - 210, y: 150 };
    const aiDrag = useVibeDrag({ initialX: aiInitial.x, initialY: aiInitial.y });

    useEffect(() => {
        const preventDefaults = (e: MouseEvent) => {
            // Allow context menu only if needed, or disable globally for engine feel
            // e.preventDefault(); 
        };

        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        window.addEventListener('contextmenu', preventContextMenu);
        return () => {
            window.removeEventListener('contextmenu', preventContextMenu);
        };
    }, []);

    return (
        <div style={styles.appContainer}>
            {/* 1. Top Section (Fixed Unified Header) */}
            <div style={styles.topBar}>
                <MenuBar />
            </div>

            {/* 2. Main Workspace (Flex Row) */}
            <div style={styles.mainContent}>
                {/* Left Sidebar: Hierarchy (Deep Black) */}
                {showHierarchy && (
                    <div 
                        style={styles.sidebarLeft}
                        onClick={() => setActivePanel('hierarchy')}
                    >
                        <VibeErrorBoundary name="Hierarchy">
                            <HierarchyPanel />
                        </VibeErrorBoundary>
                    </div>
                )}

                {/* Center: Viewport (Flexible) */}
                <div style={styles.viewportArea}>
                    <VibeErrorBoundary name="Viewport">
                        <ViewportPanel />
                    </VibeErrorBoundary>
                </div>

                {/* Right Sidebar: Inspector (Translucent Glass) */}
                {showInspector && (
                    <div 
                        style={styles.sidebarRight}
                        onClick={() => setActivePanel('inspector')}
                    >
                        <VibeErrorBoundary name="Inspector">
                            <InspectorPanel />
                        </VibeErrorBoundary>
                    </div>
                )}

                {/* 3. Floating HUD Layer */}
                <div style={styles.floatingLayer}>
                    {showAICopilot && (
                        <div 
                            ref={aiDrag.targetRef as any}
                            onClick={() => setActivePanel('aiCopilot')}
                            style={{ 
                                ...styles.hudPanel, 
                                width: '420px',
                                height: '560px',
                                top: aiDrag.currentPos.y,
                                left: aiDrag.currentPos.x,
                                ...(activePanelId === 'aiCopilot' ? styles.panelActive : {})
                            }}
                        >
                            <VibeErrorBoundary name="AI Copilot">
                                <AICopilotPanel dragHandleProps={aiDrag.dragProps} />
                            </VibeErrorBoundary>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Bottom Section (Fixed) */}
            <StatusBar />
        </div>
    );
};
