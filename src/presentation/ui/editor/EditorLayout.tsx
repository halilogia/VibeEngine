import React from 'react';
import { 
    HierarchyPanel, 
    ViewportPanel, 
    InspectorPanel, 
    AssetsPanel, 
    ConsolePanel, 
    AICopilotPanel, 
    ScriptEditorPanel,
    MenuBar, 
    TitleBar 
} from './index';
import { useEditorStore } from '@infrastructure/store';
import { VibeTheme } from '@themes/VibeStyles';
import { layoutStyles as styles, globalEditorStyles } from './EditorLayout.styles';
import { VibeErrorBoundary } from '@ui/common/VibeErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 👑 VIBE ENGINE MASTER LAYOUT
 * This is the heart of the Editor UI. It handles complex panel docking,
 * high-fidelity spring animations, and real-time layout synchronization.
 */
export const EditorLayout: React.FC = () => {
    const { 
        showHierarchy, showInspector, showConsole, showAssets, showAICopilot, showScriptEditor, setActivePanel,
        leftWidth, rightWidth, bottomHeight, inspectorWidth, assetsWidth, consoleWidth, setPanelSize,
        isScriptFullScreen, isViewportMaximized
    } = useEditorStore();

    const [isResizing, setIsResizing] = React.useState<string | null>(null);

    // High-Precision Refs for smooth dragging
    const currentSizes = React.useRef({
        L: leftWidth, R: rightWidth, B: bottomHeight, I: inspectorWidth, A: assetsWidth, C: consoleWidth
    });

    React.useEffect(() => {
        currentSizes.current = {
            L: leftWidth, R: rightWidth, B: bottomHeight, I: inspectorWidth, A: assetsWidth, C: consoleWidth
        };
    }, [leftWidth, rightWidth, bottomHeight, inspectorWidth, assetsWidth, consoleWidth]);

    const handleResize = (dir: 'L' | 'R' | 'B' | 'I' | 'A' | 'C') => (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startY = e.clientY;
        const initial = { ...currentSizes.current };

        document.body.style.cursor = dir === 'B' ? 'row-resize' : 'col-resize';
        document.body.style.userSelect = 'none';
        setIsResizing(dir);

        const onMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (dir === 'L') {
                const val = Math.max(200, Math.min(600, initial.L + deltaX));
                document.documentElement.style.setProperty('--v-left-width', `${val}px`);
                currentSizes.current.L = val;
                setPanelSize('left', val);
            }
            if (dir === 'R') {
                const val = Math.max(300, Math.min(800, initial.R - deltaX));
                document.documentElement.style.setProperty('--v-right-width', `${val}px`);
                currentSizes.current.R = val;
                setPanelSize('right', val);
            }
            if (dir === 'B') {
                const val = Math.max(150, Math.min(window.innerHeight - 150, initial.B - deltaY));
                document.documentElement.style.setProperty('--v-bottom-height', `${val}px`);
                currentSizes.current.B = val;
                setPanelSize('bottom', val);
            }
            if (dir === 'A') {
                const val = Math.max(200, Math.min(1000, initial.A + deltaX));
                document.documentElement.style.setProperty('--v-assets-width', `${val}px`);
                currentSizes.current.A = val;
                setPanelSize('assets', val);
            }
            if (dir === 'C') {
                const val = Math.max(200, Math.min(1000, initial.C + deltaX));
                document.documentElement.style.setProperty('--v-console-width', `${val}px`);
                currentSizes.current.C = val;
                setPanelSize('console', val);
            }
            if (dir === 'I') {
                const potI = Math.max(260, initial.I + deltaX);
                const potR = Math.max(300, initial.R - deltaX);
                document.documentElement.style.setProperty('--v-inspector-width', `${potI}px`);
                document.documentElement.style.setProperty('--v-right-width', `${potR}px`);
                currentSizes.current.I = potI;
                currentSizes.current.R = potR;
                setPanelSize('inspector', potI);
                setPanelSize('right', potR);
            }
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            setIsResizing(null);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    // Elite Precision Transition Config
    const eliteSpring = { type: 'spring', stiffness: 420, damping: 42, mass: 0.6 };
    const sidePanelTransition = { ...eliteSpring, opacity: { duration: 0.2 } };

    return (
        <div style={styles.appContainer}>
            <TitleBar />
            <div style={styles.topBar}><MenuBar /></div>

            <div style={{ ...styles.mainContent, display: 'flex', flexDirection: 'row', position: 'relative' }}>
                {/* 🌳 HIERARCHY PANEL - Elite Slide */}
                <AnimatePresence>
                    {showHierarchy && !isViewportMaximized && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ 
                                width: isResizing === 'L' ? undefined : leftWidth,
                                opacity: 1 
                            }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={sidePanelTransition}
                            style={{ 
                                display: 'flex', flexShrink: 0, overflow: 'hidden',
                                width: isResizing === 'L' ? 'var(--v-left-width)' : undefined,
                                borderRight: `1px solid ${VibeTheme.colors.glassBorder}`,
                                background: VibeTheme.colors.bgPrimary
                            }}
                        >
                            <div style={{ ...styles.sidebarLeft, width: '100%', borderRight: 'none' }} onClick={() => setActivePanel('hierarchy')}>
                                <VibeErrorBoundary name="Hierarchy"><HierarchyPanel /></VibeErrorBoundary>
                            </div>
                            <div onMouseDown={handleResize('L')} className="v-resizer v-resizer-vertical" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 🪐 CENTRAL VIEWPORT AREA */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minWidth: 100 }}>
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#050505' }}>
                        <VibeErrorBoundary name="Viewport">
                            <ViewportPanel />
                        </VibeErrorBoundary>
                    </div>

                    {/* 🛠️ BOTTOM TRAY (Assets, Console, Script Editor) */}
                    <AnimatePresence>
                        {(showAssets || showConsole || showScriptEditor) && !isViewportMaximized && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ 
                                    height: isScriptFullScreen ? 'calc(100vh - 80px)' : (isResizing === 'B' ? undefined : bottomHeight),
                                    opacity: 1
                                }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={eliteSpring}
                                style={{ 
                                    position: isScriptFullScreen ? 'fixed' : 'relative',
                                    top: isScriptFullScreen ? 80 : 0,
                                    zIndex: isScriptFullScreen ? 9999 : 5, 
                                    borderTop: `1px solid ${VibeTheme.colors.glassBorder}`,
                                    background: VibeTheme.colors.bgPrimary,
                                    width: '100%',
                                    height: isResizing === 'B' ? 'var(--v-bottom-height)' : undefined
                                }}
                            >
                                <div onMouseDown={handleResize('B')} className="h-resizer" style={{ height: '6px', cursor: 'row-resize', width: '100%', position: 'absolute', top: -3, zIndex: 1100 }} />
                                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%' }}>
                                    <AnimatePresence mode="popLayout">
                                        {showAssets && !isScriptFullScreen && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: (showConsole || showScriptEditor) ? assetsWidth : '100%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={eliteSpring}
                                                style={{ flexShrink: (showConsole || showScriptEditor) ? 0 : 1, width: (showConsole || showScriptEditor) ? 'var(--v-assets-width)' : '100%', overflow: 'hidden' }}
                                            >
                                                <VibeErrorBoundary name="Assets"><AssetsPanel /></VibeErrorBoundary>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {showAssets && (showConsole || showScriptEditor) && !isScriptFullScreen && <div onMouseDown={handleResize('A')} className="v-resizer v-resizer-vertical" />}
                                    
                                    <AnimatePresence mode="popLayout">
                                        {showConsole && !isScriptFullScreen && (
                                            <motion.div 
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: showScriptEditor ? consoleWidth : '100%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={eliteSpring}
                                                style={{ flexShrink: showScriptEditor ? 0 : 1, width: showScriptEditor ? 'var(--v-console-width)' : '100%', overflow: 'hidden' }}
                                            >
                                                <VibeErrorBoundary name="Console"><ConsolePanel /></VibeErrorBoundary>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {showConsole && showScriptEditor && !isScriptFullScreen && <div onMouseDown={handleResize('C')} className="v-resizer v-resizer-vertical" />}
                                    
                                    <AnimatePresence mode="popLayout">
                                        {showScriptEditor && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, minWidth: 0 }}>
                                                <VibeErrorBoundary name="Script Editor">
                                                    <ScriptEditorPanel dragHandleProps={{ onMouseDown: handleResize('B') }} />
                                                </VibeErrorBoundary>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🔍 INSPECTOR & AI SIDEBARS */}
                <div style={{ display: 'flex', position: 'relative', zIndex: 10, background: VibeTheme.colors.bgPrimary, borderLeft: `1px solid ${VibeTheme.colors.glassBorder}` }}>
                    {(showInspector || showAICopilot) && <div onMouseDown={handleResize('R')} className="v-resizer v-resizer-vertical" style={{ position: 'absolute', left: 0, zIndex: 100 }} />}
                    
                    <AnimatePresence>
                        {showInspector && !isViewportMaximized && (
                            <motion.div 
                                key="inspector"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ 
                                    width: isResizing === 'R' || isResizing === 'I' ? undefined : inspectorWidth, 
                                    opacity: 1 
                                }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={sidePanelTransition}
                                style={{ 
                                    display: 'flex', flexShrink: 0, overflow: 'hidden',
                                    width: isResizing === 'R' || isResizing === 'I' ? 'var(--v-inspector-width)' : undefined
                                }}
                            >
                                <div style={{ ...styles.sidebarRight, width: '100%', borderLeft: 'none' }} onClick={() => setActivePanel('inspector')}>
                                    <VibeErrorBoundary name="Inspector"><InspectorPanel /></VibeErrorBoundary>
                                </div>
                                {showAICopilot && <div onMouseDown={handleResize('I')} className="v-resizer v-resizer-vertical" />}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showAICopilot && !isViewportMaximized && (
                            <motion.div 
                                key="ai-copilot"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ 
                                    width: isResizing === 'R' ? undefined : rightWidth, 
                                    opacity: 1 
                                }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={sidePanelTransition}
                                style={{ 
                                    display: 'flex', flexShrink: 0, overflow: 'hidden', 
                                    width: isResizing === 'R' ? 'var(--v-right-width)' : undefined
                                }}
                            >
                                <div style={{ ...styles.sidebarRight, width: '100%', borderLeft: (showInspector ? `1px solid ${VibeTheme.colors.glassBorder}` : 'none') }} onClick={() => setActivePanel('ai')}>
                                    <VibeErrorBoundary name="AI Copilot"><AICopilotPanel /></VibeErrorBoundary>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: globalEditorStyles(VibeTheme) }} />
        </div>
    );
};
