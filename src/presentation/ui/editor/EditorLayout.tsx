

import React, { useCallback } from 'react';
import { 
    HierarchyPanel, 
    ViewportPanel, 
    InspectorPanel, 
    AssetsPanel, 
    ConsolePanel, 
    AICopilotPanel, 
    ScriptEditorPanel,
    MenuBar, 
    TitleBar} from './index';
import { useEditorStore } from '@infrastructure/store';
import { VibeTheme } from '@themes/VibeStyles';
import { layoutStyles as styles } from './EditorLayout.styles';
import { VibeErrorBoundary } from '@ui/common/VibeErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';

export const EditorLayout: React.FC = () => {
    const { 
        showHierarchy, showInspector, showConsole, showAssets, showAICopilot, showScriptEditor, setActivePanel,
        leftWidth, rightWidth, bottomHeight, inspectorWidth, assetsWidth, consoleWidth, setPanelSize,
        isScriptFullScreen, setScriptFullScreen
    } = useEditorStore();

    const handleResize = useCallback((dir: 'L' | 'R' | 'B' | 'I' | 'A' | 'C') => (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startY = e.clientY;

        const sL = leftWidth;
        const sR = rightWidth;
        const sI = inspectorWidth;
        const sA = assetsWidth;
        const sC = consoleWidth;
        const sH = isScriptFullScreen ? (window.innerHeight - 80) : bottomHeight;

        const onMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (dir === 'L') setPanelSize('left', Math.max(180, Math.min(500, sL + deltaX)));
            if (dir === 'R') setPanelSize('right', Math.max(280, Math.min(800, sR - deltaX)));
            if (dir === 'B') {
                if (isScriptFullScreen) {
                    setScriptFullScreen(false);
                }
                setPanelSize('bottom', Math.max(120, Math.min(window.innerHeight - 80, sH - deltaY)));
            }
            if (dir === 'A') setPanelSize('assets', Math.max(200, Math.min(1200, sA + deltaX)));
            if (dir === 'C') setPanelSize('console', Math.max(200, Math.min(1200, sC + deltaX)));
            
            if (dir === 'I') {
                const potentialI = sI + deltaX;
                const potentialR = sR - deltaX;
                
                if (potentialI >= 220 && potentialR >= 220) {
                    setPanelSize('inspector', potentialI);
                    setPanelSize('right', potentialR);
                }
            }
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [leftWidth, rightWidth, inspectorWidth, assetsWidth, consoleWidth, isScriptFullScreen, bottomHeight, setPanelSize, setScriptFullScreen]);

    return (
        <div style={styles.appContainer}>
            <TitleBar />
            <div style={styles.topBar}><MenuBar /></div>

            <div style={{ 
                ...styles.mainContent, 
                display: 'flex',
                flexDirection: 'row',
                position: 'relative'
            }}>
                {}
                <AnimatePresence>
                    {showHierarchy && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: leftWidth, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 42, mass: 0.8 }}
                            style={{ display: 'flex', flexShrink: 0, overflow: 'hidden' }}
                        >
                            <div style={{ ...styles.sidebarLeft, width: leftWidth }} onClick={() => setActivePanel('hierarchy')}>
                                <VibeErrorBoundary name="Hierarchy"><HierarchyPanel /></VibeErrorBoundary>
                            </div>
                            <div onMouseDown={handleResize('L')} className="v-resizer v-resizer-vertical" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    minWidth: 0,
                    height: '100%'
                }}>
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <VibeErrorBoundary name="Viewport"><ViewportPanel /></VibeErrorBoundary>
                    </div>

                    {}
                    <AnimatePresence>
                        {(showAssets || showConsole || showScriptEditor) && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ 
                                    height: isScriptFullScreen ? 'calc(100vh - 80px)' : bottomHeight, 
                                    opacity: 1 
                                }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 42, mass: 0.8 }}
                                style={{ 
                                    position: isScriptFullScreen ? 'fixed' : 'relative',
                                    top: isScriptFullScreen ? 80 : 0,
                                    left: isScriptFullScreen ? 0 : 0,
                                    right: isScriptFullScreen ? (showAICopilot ? rightWidth : 0) : 0,
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    zIndex: isScriptFullScreen ? 9999 : 5, 
                                    borderTop: `1px solid ${VibeTheme.colors.glassBorder}`,
                                    background: VibeTheme.colors.bgPrimary,
                                    flexShrink: 1,
                                    width: '100%',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <div 
                                    onMouseDown={handleResize('B')} 
                                    className="h-resizer" 
                                    style={{ height: '6px', cursor: 'row-resize', width: '100%', position: 'absolute', top: -3, zIndex: 1100 }}
                                />
                                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                    <AnimatePresence>
                                        {showAssets && !isScriptFullScreen && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: (showConsole || showScriptEditor) ? assetsWidth : '100%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 320, damping: 42, mass: 0.8 }}
                                                style={{ flexShrink: (showConsole || showScriptEditor) ? 0 : 1, minWidth: 0, overflow: 'hidden' }}
                                            >
                                                <div style={{ width: '100%', height: '100%' }}>
                                                    <VibeErrorBoundary name="Assets"><AssetsPanel /></VibeErrorBoundary>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {showAssets && (showConsole || showScriptEditor) && !isScriptFullScreen && (
                                        <div onMouseDown={handleResize('A')} className="v-resizer v-resizer-vertical" style={{ background: 'rgba(255,255,255,0.05)' }} />
                                    )}

                                    <AnimatePresence>
                                        {showConsole && !isScriptFullScreen && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: showScriptEditor ? consoleWidth : '100%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 320, damping: 42, mass: 0.8 }}
                                                style={{ flex: showScriptEditor ? '0 0 auto' : 1, minWidth: 0, overflow: 'hidden' }}
                                            >
                                                <div style={{ width: '100%', height: '100%' }}>
                                                    <VibeErrorBoundary name="Console"><ConsolePanel /></VibeErrorBoundary>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {showConsole && showScriptEditor && !isScriptFullScreen && (
                                        <div onMouseDown={handleResize('C')} className="v-resizer v-resizer-vertical" style={{ background: 'rgba(255,255,255,0.05)' }} />
                                    )}

                                    <AnimatePresence>
                                        {showScriptEditor && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: '100%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 320, damping: 42, mass: 0.8 }}
                                                style={{ flex: 1, flexGrow: 1, minWidth: 0, overflow: 'hidden' }}
                                            >
                                                <div style={{ width: '100%', height: '100%' }}>
                                                    <VibeErrorBoundary name="Script Editor">
                                                        <ScriptEditorPanel dragHandleProps={{ onMouseDown: handleResize('B') }} />
                                                    </VibeErrorBoundary>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {}
                <div style={{ 
                    display: 'flex', 
                    position: 'relative',
                    zIndex: 10, 
                    flexShrink: 0, 
                    background: VibeTheme.colors.bgPrimary, 
                    borderLeft: `1px solid ${VibeTheme.colors.glassBorder}`,
                    overflow: 'hidden'
                }}>
                    {}
                    {(showInspector || showAICopilot) && (
                        <div onMouseDown={handleResize('R')} className="v-resizer v-resizer-vertical" style={{ position: 'absolute', left: 0, zIndex: 100 }} />
                    )}

                    <AnimatePresence>
                        {showInspector && (
                            <motion.div 
                                key="inspector"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: inspectorWidth, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 42, mass: 0.8 }}
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
                                transition={{ type: 'spring', stiffness: 320, damping: 42, mass: 0.8 }}
                                style={{ display: 'flex', flexShrink: 0, overflow: 'hidden', position: 'relative', zIndex: 1 }}
                            >
                                <div style={{ 
                                    ...styles.sidebarRight, 
                                    width: rightWidth, 
                                    minWidth: rightWidth, 
                                    borderLeft: (showInspector ? `1px solid ${VibeTheme.colors.glassBorder}` : 'none'),
                                    zIndex: 1 
                                }} onClick={() => setActivePanel('ai')}>
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
                    background: transparent !important;
                }
                .v-resizer-vertical {
                    width: 8px;
                    cursor: col-resize;
                    margin: 0 -4px;
                }
                .v-resizer-vertical::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: transparent;
                    transition: all 0.2s;
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
                    background: transparent !important;
                    position: relative;
                }
                .h-resizer::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: transparent;
                    transition: all 0.2s;
                    transform: translateY(-50%);
                }
                .h-resizer:hover::after { 
                    height: 3px;
                    background: ${VibeTheme.colors.accent}; 
                    box-shadow: 0 0 10px ${VibeTheme.colors.accent}66;
                }
                
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
