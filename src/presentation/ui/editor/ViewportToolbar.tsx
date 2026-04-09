

import React from 'react';
import { VibeIcons, VibeIconName } from '@ui/common/VibeIcons';
import { useEditorStore, EditorMode } from '@infrastructure/store';
import { VibeTheme, createVibeStyles } from '@themes/VibeStyles';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';

const styles = createVibeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px',
        background: 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'auto',
    },
    group: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    divider: {
        width: '1px',
        height: '20px',
        background: 'rgba(255, 255, 255, 0.08)',
        margin: '0 4px',
    }
});

import { motion, AnimatePresence } from 'framer-motion';

import { usePlayModeStore } from '@presentation/features/editor/core';

export const ViewportToolbar: React.FC = () => {
    const { 
        editorMode, setEditorMode,
        shadingMode, setShadingMode, 
        showGrid, toggleGrid, 
        showAxes, toggleAxes,
        showBloom, toggleBloom,
        showEnvironment, toggleEnvironment,
        isViewportMaximized, toggleViewportMaximize
    } = useEditorStore();
    const { isPlaying, isPaused, play, pause, stop } = usePlayModeStore();

    const [showShadingMenu, setShowShadingMenu] = React.useState(false);

    const shadingOptions: { id: typeof shadingMode; icon: VibeIconName; label: string }[] = [
        { id: 'lit', icon: 'Box' as VibeIconName, label: 'Lit' },
        { id: 'wireframe', icon: 'Grid' as VibeIconName, label: 'Wireframe' },
        { id: 'solid', icon: 'Layers' as VibeIconName, label: 'Solid' }
    ];

    const currentShading = shadingOptions.find(o => o.id === shadingMode) || shadingOptions[0];

    return (
        <div style={styles.container}>
            {}
            <div style={{ ...styles.group, minWidth: '75px', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                    {!isPlaying ? (
                        <motion.div
                            key="play-btn"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            <VibeButton 
                                variant="primary" size="sm" onClick={play}
                                style={{ 
                                    width: '32px', height: '32px', padding: 0, borderRadius: '8px',
                                    background: '#10b981', 
                                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                                }}
                                title="Play Scene (F5)"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                >
                                    <VibeIcons name="Play" size={14} color="#fff" />
                                </motion.div>
                            </VibeButton>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="playing-btns"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            style={{ display: 'flex', gap: '4px' }}
                        >
                            <VibeButton 
                                variant="ghost" size="sm" onClick={pause}
                                style={{ 
                                    width: '32px', height: '32px', padding: 0, borderRadius: '8px',
                                    background: isPaused ? `${VibeTheme.colors.accent}22` : 'transparent',
                                    color: isPaused ? VibeTheme.colors.accent : 'rgba(255,255,255,0.5)'
                                }}
                                title="Pause simulation"
                            >
                                <VibeIcons name={isPaused ? "Play" : "Pause"} size={14} />
                            </VibeButton>
                            <VibeButton 
                                variant="ghost" size="sm" onClick={stop}
                                style={{ 
                                    width: '32px', height: '32px', padding: 0, borderRadius: '8px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444'
                                }}
                                title="Stop simulation (Esc)"
                            >
                                <VibeIcons name="Square" size={12} />
                            </VibeButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={styles.divider} />

            {}
            <div style={styles.group}>
                {[
                    { mode: 'translate' as EditorMode, icon: 'Move' as VibeIconName, label: 'Move tools' },
                    { mode: 'rotate' as EditorMode, icon: 'Rotate' as VibeIconName, label: 'Rotate tools' },
                    { mode: 'scale' as EditorMode, icon: 'Scale' as VibeIconName, label: 'Scale tools' }
                ].map((m) => (
                    <VibeButton
                        key={m.mode}
                        variant={editorMode === m.mode ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setEditorMode(m.mode)}
                        style={{ 
                            width: '32px', height: '32px', padding: 0,
                            borderRadius: '8px',
                            background: editorMode === m.mode ? `${VibeTheme.colors.accent}22` : 'transparent',
                            filter: editorMode === m.mode ? `drop-shadow(0 0 8px ${VibeTheme.colors.accent}66)` : 'none'
                        }}
                        title={m.label}
                    >
                        <VibeIcons name={m.icon} size={14} color={editorMode === m.mode ? VibeTheme.colors.accent : 'rgba(255,255,255,0.5)'} />
                    </VibeButton>
                ))}
            </div>

            <div style={styles.divider} />
            {}
            <div style={{ position: 'relative' }}>
                <VibeButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowShadingMenu(!showShadingMenu)}
                    title={`Shading: ${currentShading.label}`}
                >
                    <VibeIcons name={currentShading.icon} size={14} color={VibeTheme.colors.accent} />
                    <VibeIcons name="ChevronDown" size={10} style={{ marginLeft: 4, opacity: 0.5 }} />
                </VibeButton>

                <AnimatePresence>
                    {showShadingMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 5, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{
                                position: 'absolute', top: '100%', left: 0,
                                background: 'rgba(15, 15, 20, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${VibeTheme.colors.glassBorder}`,
                                borderRadius: '8px', padding: '4px', zIndex: 1000,
                                minWidth: '120px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                            }}
                        >
                            {shadingOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        setShadingMode(opt.id);
                                        setShowShadingMenu(false);
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '6px 10px', borderRadius: '6px',
                                        cursor: 'pointer', fontSize: '11px',
                                        background: shadingMode === opt.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        color: shadingMode === opt.id ? VibeTheme.colors.accent : 'rgba(255,255,255,0.6)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <VibeIcons name={opt.icon} size={12} />
                                    {opt.label}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={styles.divider} />

            <div style={styles.group}>
                <VibeButton 
                    variant={showGrid ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={toggleGrid} 
                    title="Toggle Grid"
                >
                    <VibeIcons name="Grid" size={14} color={showGrid ? '#fff' : 'rgba(255,255,255,0.5)'} />
                </VibeButton>
                <VibeButton 
                    variant={showAxes ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={toggleAxes} 
                    title="Toggle Axes"
                >
                    <VibeIcons name="Axis" size={14} color={showAxes ? '#fff' : 'rgba(255,255,255,0.5)'} />
                </VibeButton>
            </div>

            <div style={styles.divider} />

            <div style={styles.group}>
                <VibeButton 
                    variant={showBloom ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={toggleBloom} 
                    title="Post-Processing: Bloom"
                >
                    <motion.div animate={showBloom ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: showBloom ? Infinity : 0, duration: 2 }}>
                        <VibeIcons name="Sparkles" size={14} color={showBloom ? '#fff' : 'rgba(255,255,255,0.5)'} />
                    </motion.div>
                </VibeButton>
                <VibeButton 
                    variant={showEnvironment ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={toggleEnvironment} 
                    title="Environment Lighting"
                >
                    <VibeIcons name="Sun" size={14} color={showEnvironment ? '#fff' : 'rgba(255,255,255,0.5)'} />
                </VibeButton>
            </div>

            <div style={styles.divider} />

            <div style={styles.group}>
                <VibeButton 
                    variant={isViewportMaximized ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={toggleViewportMaximize} 
                    title={isViewportMaximized ? "Exit Maximize (Ctrl+Space)" : "Maximize Viewport (Ctrl+Space)"}
                    style={{
                        background: isViewportMaximized ? `${VibeTheme.colors.accent}44` : 'transparent',
                    }}
                >
                    <VibeIcons name={isViewportMaximized ? "Minimize" : "Maximize"} size={14} color={isViewportMaximized ? VibeTheme.colors.accent : 'rgba(255,255,255,0.5)'} />
                </VibeButton>
            </div>
        </div>
    );
};
