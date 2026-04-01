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
import { motion, AnimatePresence } from 'framer-motion';

export const EditorLayout: React.FC = () => {
    const { 
        showHierarchy, showInspector, showConsole, showAssets, showAICopilot, showScriptEditor, setActivePanel,
        leftWidth, rightWidth, bottomHeight, inspectorWidth, assetsWidth, setPanelSize
    } = useEditorStore();

    const handleResize = useCallback((dir: 'L' | 'R' | 'B' | 'I' | 'A') => (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startY = e.clientY;
        
        // Snapshot current widths
        const sL = leftWidth;
        const sR = rightWidth;
        const sI = inspectorWidth;
        const sA = assetsWidth;
        const sH = bottomHeight;

        const onMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (dir === 'L') setPanelSize('left', Math.max(160, sL + deltaX));
            if (dir === 'R') setPanelSize('right', Math.max(260, sR - deltaX));
            if (dir === 'B') setPanelSize('bottom', Math.max(100, sH - deltaY));
            if (dir === 'A') setPanelSize('assets', Math.max(200, sA + deltaX));
            
            if (dir === 'I') {
                // 🌉 Sum-Zero Dual Resize: Share space between Inspector and AI
                const newI = Math.max(200, sI + deltaX);
                const nextDelta = newI - sI; // Actual change after clamping
                setPanelSize('inspector', newI);
                setPanelSize('right', Math.max(200, sR - nextDelta));
            }
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [leftWidth, rightWidth, bottomHeight, inspectorWidth, assetsWidth]);

    return (
        <div style={styles.appContainer}>
            <TitleBar />
            <div style={styles.topBar}><MenuBar /></div>

            <div style={styles.mainContent}>
                {/* 1. Left Sidebar (Hierarchy) */}
                <AnimatePresence>
                    {showHierarchy && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: leftWidth, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            style={{ display: 'flex', flexShrink: 0, overflow: 'hidden' }}
                        >
                            <div style={{ ...styles.sidebarLeft, width: leftWidth }} onClick={() => setActivePanel('hierarchy')}>
                                <VibeErrorBoundary name="Hierarchy"><HierarchyPanel /></VibeErrorBoundary>
                            </div>
                            <div onMouseDown={handleResize('L')} className="v-resizer v-resizer-vertical" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. Center Viewport Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minWidth: 0 }}>
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <VibeErrorBoundary name="Viewport"><ViewportPanel /></VibeErrorBoundary>
                    </div>

                    {/* 🟢 Bottom Tray (Assets & Console) - Sovereign Guarantee */}
                    <AnimatePresence>
                        {(showAssets || showConsole) && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: bottomHeight, opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                style={{ 
                                    position: 'relative',
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    zIndex: 1000, 
                                    borderTop: `1px solid ${VibeTheme.colors.glassBorder}`,
                                    background: VibeTheme.colors.bgPrimary,
                                    flexShrink: 0,
                                }}
                            >
                                <div 
                                    onMouseDown={handleResize('B')} 
                                    className="h-resizer" 
                                    style={{ height: '6px', cursor: 'row-resize', width: '100%', position: 'absolute', top: -3, zIndex: 1100 }}
                                />
                                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                    <AnimatePresence>
                                        {showAssets && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: showConsole ? assetsWidth : '100%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                style={{ flexShrink: 0, overflow: 'hidden' }}
                                            >
                                                <div style={{ width: showConsole ? assetsWidth : '100%', minWidth: '200px', height: '100%' }}>
                                                    <VibeErrorBoundary name="Assets"><AssetsPanel /></VibeErrorBoundary>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {showAssets && showConsole && (
                                        <div onMouseDown={handleResize('A')} className="v-resizer v-resizer-vertical" style={{ background: 'rgba(255,255,255,0.05)' }} />
                                    )}

                                    <AnimatePresence>
                                        {showConsole && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: showAssets ? 'auto' : '100%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                style={{ flex: 1, overflow: 'hidden' }}
                                            >
                                                <div style={{ width: '100%', minWidth: '200px', height: '100%' }}>
                                                    <VibeErrorBoundary name="Console"><ConsolePanel /></VibeErrorBoundary>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Right Sidebar Area (Inspector & AI Copilot) */}
                <div style={{ display: 'flex', zIndex: 2000 }}>
                    {/* The main right resizer (Separates Viewport from the whole Right block) */}
                    {(showInspector || showAICopilot) && (
                        <div onMouseDown={handleResize('R')} className="v-resizer v-resizer-vertical" />
                    )}

                    <AnimatePresence>
                        {showInspector && (
                            <motion.div 
                                key="inspector"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: inspectorWidth, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                style={{ display: 'flex', flexShrink: 0, overflow: 'hidden' }}
                            >
                                <div style={{ ...styles.sidebarRight, width: inspectorWidth, borderLeft: 'none' }} onClick={() => setActivePanel('inspector')}>
                                    <VibeErrorBoundary name="Inspector"><InspectorPanel /></VibeErrorBoundary>
                                </div>
                                {showAICopilot && (
                                    <div onMouseDown={handleResize('I')} className="v-resizer v-resizer-vertical" />
                                )}
                            </motion.div>
                        )}

                        {showAICopilot && (
                            <motion.div 
                                key="ai-copilot"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: rightWidth, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                style={{ display: 'flex', flexShrink: 0, overflow: 'hidden' }}
                            >
                                <div style={{ ...styles.sidebarRight, width: rightWidth, borderLeft: (showInspector ? `1px solid ${VibeTheme.colors.glassBorder}` : 'none') }} onClick={() => setActivePanel('ai')}>
                                    <VibeErrorBoundary name="AI Copilot"><AICopilotPanel /></VibeErrorBoundary>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .v-resizer { 
                    z-index: 3000; 
                    transition: all 0.2s; 
                    position: relative;
                }
                .v-resizer-vertical {
                    width: 8px;
                    cursor: col-resize;
                    margin: 0 -4px;
                    background: transparent;
                }
                .v-resizer-vertical::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: ${VibeTheme.colors.glassBorder};
                    transform: translateX(-50%);
                }
                .v-resizer-vertical:hover::after {
                    width: 3px;
                    background: ${VibeTheme.colors.accent};
                    box-shadow: 0 0 10px ${VibeTheme.colors.accent}66;
                }
                .h-resizer { 
                    height: 8px; 
                    cursor: row-resize; 
                    z-index: 3000; 
                    transition: all 0.2s; 
                    background: transparent;
                    position: relative;
                }
                .h-resizer::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: ${VibeTheme.colors.glassBorder};
                    transform: translateY(-50%);
                }
                .h-resizer:hover::after { 
                    height: 3px;
                    background: ${VibeTheme.colors.accent}; 
                    box-shadow: 0 0 10px ${VibeTheme.colors.accent}66;
                }
                
                /* 🏛️ Sovereign Elite Global Scrollbar */
                *::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                *::-webkit-scrollbar-track {
                    background: transparent;
                }
                *::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                *::-webkit-scrollbar-thumb:hover {
                    background: ${VibeTheme.colors.accent}66;
                }
            ` }} />
        </div>
    );
};
