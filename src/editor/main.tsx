/**
 * Editor Entry Point
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { EditorApp } from './EditorApp';

const container = document.getElementById('editor-root');

if (container) {
    const root = createRoot(container);
    root.render(<EditorApp />);
}
