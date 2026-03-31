/**
 * EditorApp - Main editor application component
 */

import React, { useState, useEffect } from 'react';
import { MenuBar, Toolbar, EditorLayout, SplashScreen } from './components';
import { useKeyboardShortcuts } from './hooks';
import './styles/editor.css';
import './components/SplashScreen.css';

export const EditorApp: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    return (
        <>
            {showSplash && (
                <SplashScreen onComplete={() => setShowSplash(false)} />
            )}
            <div className={`editor-root ${showSplash ? 'hidden' : ''}`}>
                <MenuBar />
                <Toolbar />
                <EditorLayout />
            </div>
        </>
    );
};

export default EditorApp;
