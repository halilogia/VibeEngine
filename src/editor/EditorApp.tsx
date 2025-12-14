/**
 * EditorApp - Main editor application component
 */

import React from 'react';
import { MenuBar, Toolbar, EditorLayout } from './components';
import { useKeyboardShortcuts } from './hooks';
import './styles/editor.css';

export const EditorApp: React.FC = () => {
    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    return (
        <div className="editor-root">
            <MenuBar />
            <Toolbar />
            <EditorLayout />
        </div>
    );
};

export default EditorApp;
