/**
 * EditorApp - Main editor application component
 */

import React, { useState, useEffect } from 'react';
import { MenuBar, Toolbar, EditorLayout, SplashScreen, StatusBar } from './components';
import { useKeyboardShortcuts } from './hooks';
import './styles/editor.css';
import './components/SplashScreen.css';
import './components/StatusBar.css';

export const EditorApp: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

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
            </div>
        </>
    );
};

export default EditorApp;
