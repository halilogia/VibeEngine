

import React from 'react';
import { createRoot } from 'react-dom/client';
import { EditorApp } from './EditorApp';
import '@lib/i18n';

import { syncAICopilot, syncSceneContext } from '@editor/bridge';
import { initConsoleBridge } from '@infrastructure/bridge/ConsoleBridge';
import '@themes/SovereignTheme.css';

initConsoleBridge();
syncAICopilot();
syncSceneContext();

const container = document.getElementById('editor-root');

if (container) {
    const root = createRoot(container);
    root.render(<EditorApp />);
}
