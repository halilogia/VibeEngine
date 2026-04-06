

import React from 'react';
import { createRoot } from 'react-dom/client';
import { EditorApp } from './EditorApp';
import '@lib/i18n';

import { syncAICopilot, syncSceneContext } from '@editor/bridge';
import '@themes/SovereignTheme.css';

syncAICopilot();
syncSceneContext();

const container = document.getElementById('editor-root');

if (container) {
    const root = createRoot(container);
    root.render(<EditorApp />);
}
