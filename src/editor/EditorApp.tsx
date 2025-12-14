/**
 * EditorApp - Main editor application component
 */

import React, { useEffect } from 'react';
import { MenuBar, Toolbar, EditorLayout } from './components';
import { useKeyboardShortcuts } from './hooks';
import { useSceneStore } from './stores';
import './styles/editor.css';

export const EditorApp: React.FC = () => {
    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    // Auto-load MobRunner scene on startup
    useEffect(() => {
        const loadDefaultScene = async () => {
            try {
                const response = await fetch('/scenes/mobrunner.scene.json');
                if (response.ok) {
                    const sceneData = await response.json();
                    useSceneStore.getState().loadScene(sceneData);
                    console.log('✅ Auto-loaded MobRunner scene');
                }
            } catch (error) {
                console.log('📋 Starting with empty scene');
            }
        };

        // Only load if scene is empty
        if (useSceneStore.getState().entities.size === 0) {
            loadDefaultScene();
        }
    }, []);

    return (
        <div className="editor-root">
            <MenuBar />
            <Toolbar />
            <EditorLayout />
        </div>
    );
};

export default EditorApp;
