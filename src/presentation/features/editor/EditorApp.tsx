/**
 * EditorApp - Main editor application component (Elite Studio Edition)
 */

import React, { useState, useEffect } from 'react';
import { EditorLayout, SplashScreen } from '@ui/editor';
import { CommandPalette } from '@ui/editor/CommandPalette';
import { useKeyboardShortcuts } from '@editor/hooks';
import { ToastContainer } from '@ui/editor/ToastContainer';
import { useAssetManager } from '@editor/assets';
import { ProjectLauncher } from '@ui/editor/launcher/ProjectLauncher';
import { useProjectStore } from '@infrastructure/store/useProjectStore';
import { useEditorStore } from '@infrastructure/store';
import { AnimatePresence } from 'framer-motion';
import { VibeTheme } from '@themes/VibeStyles';

import { SettingsModal } from '../../ui/editor/settings/SettingsModal';

export const EditorApp: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const { launchedProject, showLauncher, setShowLauncher } = useProjectStore();
    const { 
        showAICopilotSettings, setShowAICopilotSettings, engineConfig 
    } = useEditorStore();

    // Dynamically apply Theme and UI Scaling to the HTML document
    useEffect(() => {
        document.body.setAttribute('data-theme', engineConfig.editorTheme || 'Sovereign Dark');
        document.documentElement.style.fontSize = `${(engineConfig.uiScale || 100) / 100 * 16}px`;
    }, [engineConfig.editorTheme, engineConfig.uiScale]);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();
    const { initializeKenneyLibrary } = useAssetManager();

    useEffect(() => {
        // Initialize the loading bridge immediately
        const bridge = {
            progress: 0, status: 'initializing' as 'initializing' | 'ready',
            modules: {} as Record<string, 'success' | 'error'>, details: 'Starting Editor...'
        };
        (window as Window & { VibeLoading?: typeof bridge }).VibeLoading = bridge;

        const steps: Array<{ name: string; label: string; delay: number }> = [
            { name: 'Theme', label: 'Loading Theme System...', delay: 200 },
            { name: 'Store', label: 'Initializing State Store...', delay: 350 },
            { name: 'Shortcuts', label: 'Registering Shortcuts...', delay: 250 },
            { name: 'Panels', label: 'Mounting Editor Panels...', delay: 400 },
            { name: 'Viewport', label: 'Preparing Viewport...', delay: 300 },
            { name: 'AI Bridge', label: 'Connecting AI Bridge...', delay: 200 },
        ];

        let elapsed = 0;
        steps.forEach((step, i) => {
            elapsed += step.delay;
            setTimeout(() => {
                bridge.modules[step.name] = 'success';
                bridge.details = step.label;
                bridge.progress = Math.round(((i + 1) / steps.length) * 100);
                if (i === steps.length - 1) {
                    bridge.status = 'ready'; bridge.progress = 100;
                    console.log('🚀 VibeEngine Editor: All systems go!');
                }
            }, elapsed);
        });

        // Initialize Kenney Pirate Kit Library
        initializeKenneyLibrary([
            'barrel.glb', 'boat-row-large.glb', 'boat-row-small.glb', 'bottle-large.glb', 
            'bottle.glb', 'cannon-ball.glb', 'cannon-mobile.glb', 'cannon.glb', 
            'castle-door.glb', 'castle-gate.glb', 'castle-wall.glb', 'castle-window.glb', 
            'chest.glb', 'crate-bottles.glb', 'crate.glb', 'flag-pirate.glb', 
            'grass-patch.glb', 'mast-ropes.glb', 'mast.glb', 'palm-bend.glb', 
            'palm-detailed-bend.glb', 'palm-detailed-straight.glb', 'palm-straight.glb', 
            'patch-grass-foliage.glb', 'patch-grass.glb', 'patch-sand-foliage.glb', 
            'patch-sand.glb', 'rocks-a.glb', 'rocks-b.glb', 'rocks-c.glb', 
            'rocks-sand-a.glb', 'rocks-sand-b.glb', 'rocks-sand-c.glb', 
            'ship-ghost.glb', 'ship-large.glb', 'ship-medium.glb', 'ship-pirate-large.glb', 
            'ship-pirate-medium.glb', 'ship-pirate-small.glb', 'ship-small.glb', 
            'ship-wreck.glb', 'tower-complete-large.glb', 'tower-complete-small.glb', 
            'tower-watch.glb'
        ]);
    }, []);


    return (
        <div style={{ width: '100vw', height: '100vh', background: VibeTheme.colors.bgPrimary, overflow: 'hidden', position: 'relative' }}>
            {showSplash && (
                <SplashScreen onComplete={() => setShowSplash(false)} />
            )}
            
            <div style={{
                opacity: showSplash ? 0 : 1,
                visibility: showSplash ? 'hidden' : 'visible',
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100vw', height: '100vh', overflow: 'hidden', background: VibeTheme.colors.bgPrimary,
            }}>
                <EditorLayout />
                <ToastContainer />
                <CommandPalette />
            </div>

            {/* MODULAR ELITE MODALS */}
            <AnimatePresence>
                {showAICopilotSettings && <SettingsModal onClose={() => setShowAICopilotSettings(false)} projectName={launchedProject?.name} />}
            </AnimatePresence>
            
            {showLauncher && !showSplash && (
                <div style={modalOverlayStyle}>
                    <div style={{ width: '90%', height: '85%', position: 'relative' }}>
                        <ProjectLauncher />
                        <button onClick={() => setShowLauncher(false)} style={launcherCloseButtonStyle}>×</button>
                    </div>
                </div>
            )}

            <style>{`
                /** Global overrides for the core modular architecture */
                @keyframes vibe-fade-in { from { opacity: 0; } to { opacity: 1; } }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-thumb { background: ${VibeTheme.colors.glassBorder}; border-radius: 10px; }
                ::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>
    );
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: 10000, background: VibeTheme.colors.glassBg, backdropFilter: 'blur(50px) saturate(200%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const launcherCloseButtonStyle: React.CSSProperties = {
    position: 'absolute', top: '2rem', right: '2rem', background: VibeTheme.colors.bgSubtle, border: `1px solid ${VibeTheme.colors.border}`, color: VibeTheme.colors.textMain,
    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
};

export default EditorApp;
