/**
 * EditorApp - Main editor application component
 */

import React, { useState, useEffect } from 'react';
import { MenuBar, Toolbar, EditorLayout, SplashScreen, StatusBar } from './components';
import { CommandPalette } from './components/CommandPalette';
import { useKeyboardShortcuts } from './hooks';
import { ToastContainer } from './components/ToastContainer';
import './styles/editor.css';
import './components/CommandPalette.css';
import './components/SplashScreen.css';
import './components/StatusBar.css';
import { useAssetManager } from './assets/AssetManager';


export const EditorApp: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();
    const { initializeKenneyLibrary } = useAssetManager();


    useEffect(() => {
        // Initialize the loading bridge immediately
        const bridge = {
            progress: 0,
            status: 'initializing' as 'initializing' | 'ready',
            modules: {} as Record<string, 'success' | 'error'>,
            details: 'Starting Editor...'
        };
        (window as any).VibeLoading = bridge;

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
                console.log(`✅ [Editor] ${step.name}: Ready`);

                if (i === steps.length - 1) {
                    bridge.status = 'ready';
                    bridge.progress = 100;
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
        <>
            {showSplash && (
                <SplashScreen onComplete={() => setShowSplash(false)} />
            )}
            <div className={`editor-root ${showSplash ? 'hidden' : ''}`}>
                <MenuBar />
                <Toolbar />
                <EditorLayout />
                <StatusBar />
                <ToastContainer />
                <CommandPalette />
            </div>
        </>
    );
};

export default EditorApp;
