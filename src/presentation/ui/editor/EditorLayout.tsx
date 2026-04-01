/**
 * EditorLayout (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useCallback } from 'react';
import { 
    HierarchyPanel, 
    ViewportPanel, 
    InspectorPanel, 
    AssetsPanel, 
    ConsolePanel, 
    AICopilotPanel, 
    MenuBar, 
    TitleBar, 
    StatusBar 
} from './index';
import { useEditorStore } from '@infrastructure/store';
import { VibeTheme } from '@themes/VibeStyles';
import { layoutStyles as styles } from './EditorLayout.styles';
import { VibeErrorBoundary } from '@ui/common/VibeErrorBoundary';

export const EditorLayout: React.FC = () => {
    const { 
        showHierarchy, showInspector, showConsole, showAssets, showAICopilot, showScriptEditor, setActivePanel 
    } = useEditorStore();

    // 🟢 Sidebar & Bottom Panel Resizing State
    const [leftWidth, setLeftWidth] = useState(260);
    const [rightWidth, setRightWidth] = useState(420);
    const [bottomHeight, setBottomHeight] = useState(300);

    const handleResize = useCallback((dir: 'L' | 'R' | 'B') => (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = dir === 'L' ? leftWidth : rightWidth;
        const startH = bottomHeight;

        const onMove = (moveEvent: MouseEvent) => {
            if (dir === 'L') setLeftWidth(Math.max(160, startW + (moveEvent.clientX - startX)));
            if (dir === 'R') setRightWidth(Math.max(260, startW - (moveEvent.clientX - startX)));
            if (dir === 'B') setBottomHeight(Math.max(100, startH - (moveEvent.clientY - startY)));
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [leftWidth, rightWidth, bottomHeight]);

    return (
        <div style={styles.appContainer}>
            <TitleBar />
            <div style={styles.topBar}><MenuBar /></div>

            <div style={styles.mainContent}>
                {/* 1. Left Sidebar (Hierarchy) */}
                {showHierarchy && (
                    <>
                        <div style={{ ...styles.sidebarLeft, width: leftWidth }} onClick={() => setActivePanel('hierarchy')}>
                            <VibeErrorBoundary name="Hierarchy"><HierarchyPanel /></VibeErrorBoundary>
                        </div>
                        <div onMouseDown={handleResize('L')} className="v-resizer" />
                    </>
                )}

                {/* 2. Center Viewport Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <VibeErrorBoundary name="Viewport"><ViewportPanel /></VibeErrorBoundary>
                    </div>

                    {/* 🟢 Bottom Tray (Assets & Console) - Sovereign Guarantee */}
                    {(showAssets || showConsole) && (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            zIndex: 100, 
                            borderTop: `1px solid ${VibeTheme.colors.glassBorder}`,
                            background: '#050508'
                        }}>
                            <div 
                                onMouseDown={handleResize('B')} 
                                className="h-resizer" 
                                title="Resize Panel"
                                style={{ height: '4px', background: 'rgba(255,255,255,0.05)', cursor: 'row-resize', width: '100%', zIndex: 110 }}
                            />
                            <div style={{ 
                                height: `${bottomHeight}px`, 
                                display: 'flex', 
                                overflow: 'hidden'
                            }}>
                                {showAssets && <div style={{ flex: 1, borderRight: showConsole ? `1px solid ${VibeTheme.colors.glassBorder}` : 'none', overflow: 'hidden' }}>
                                    <VibeErrorBoundary name="Assets"><AssetsPanel /></VibeErrorBoundary>
                                </div>}
                                {showConsole && <div style={{ width: showAssets ? '45%' : '100%', overflow: 'hidden' }}>
                                    <VibeErrorBoundary name="Console"><ConsolePanel /></VibeErrorBoundary>
                                </div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Right Sidebar Area (Inspector & AI Copilot) */}
                <div style={{ display: 'flex' }}>
                    {showInspector && (
                        <div style={{ ...styles.sidebarRight, width: 320 }} onClick={() => setActivePanel('inspector')}>
                            <VibeErrorBoundary name="Inspector"><InspectorPanel /></VibeErrorBoundary>
                        </div>
                    )}
                    
                    {(showInspector || showAICopilot) && (
                        <div onMouseDown={handleResize('R')} className="v-resizer" />
                    )}

                    {showAICopilot && (
                        <div style={{ ...styles.sidebarRight, width: rightWidth, borderLeft: `2px solid ${VibeTheme.colors.accent}44` }} onClick={() => setActivePanel('ai')}>
                            <VibeErrorBoundary name="AI Copilot"><AICopilotPanel /></VibeErrorBoundary>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .v-resizer { width: 4px; cursor: col-resize; z-index: 1000; transition: background 0.2s; background: rgba(255,255,255,0.02); }
                .v-resizer:hover { background: ${VibeTheme.colors.accent}88; }
                .h-resizer { height: 4px; cursor: row-resize; z-index: 1000; transition: background 0.2s; background: rgba(255,255,255,0.02); }
                .h-resizer:hover { background: ${VibeTheme.colors.accent}88; }
            ` }} />
            <StatusBar />
        </div>
    );
};
