/**
 * Editor Store - Global state management for the editor
 */

import { create } from 'zustand';

export type EditorMode = 'translate' | 'rotate' | 'scale';
export type ViewMode = 'perspective' | 'top' | 'front' | 'side';

interface EditorState {
    // Selection
    selectedEntityId: number | null;
    selectedEntityIds: number[];

    // Transform mode
    editorMode: EditorMode;

    // View
    viewMode: ViewMode;
    showGrid: boolean;
    showAxes: boolean;

    // Play state
    isPlaying: boolean;
    isPaused: boolean;

    // Panels
    showHierarchy: boolean;
    showInspector: boolean;
    showAssets: boolean;
    showConsole: boolean;
    showAICopilot: boolean;
    showScriptEditor: boolean;
    activePanelId: string | null;
    shadingMode: 'lit' | 'wireframe' | 'solid';
    showCommandPalette: boolean;
    showBloom: boolean;
    showEnvironment: boolean;


    // Actions
    selectEntity: (id: number | null) => void;
    addToSelection: (id: number) => void;
    clearSelection: () => void;
    setEditorMode: (mode: EditorMode) => void;
    setViewMode: (mode: ViewMode) => void;
    toggleGrid: () => void;
    toggleAxes: () => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
    togglePanel: (panel: 'hierarchy' | 'inspector' | 'assets' | 'console' | 'aiCopilot' | 'scriptEditor') => void;
    setActivePanel: (id: string | null) => void;
    setShadingMode: (mode: 'lit' | 'wireframe' | 'solid') => void;
    toggleCommandPalette: (show?: boolean) => void;
    toggleBloom: () => void;
    toggleEnvironment: () => void;
}


export const useEditorStore = create<EditorState>((set) => ({
    // Initial state
    selectedEntityId: null,
    selectedEntityIds: [],
    editorMode: 'translate',
    viewMode: 'perspective',
    showGrid: true,
    showAxes: true,
    isPlaying: false,
    isPaused: false,
    showHierarchy: true,
    showInspector: true,
    showAssets: true,
    showConsole: true,
    showAICopilot: true,
    showScriptEditor: false,
    activePanelId: 'viewport',
    shadingMode: 'lit',
    showCommandPalette: false,
    showBloom: true,
    showEnvironment: true,


    // Actions
    selectEntity: (id) => set({
        selectedEntityId: id,
        selectedEntityIds: id ? [id] : []
    }),

    addToSelection: (id) => set((state) => ({
        selectedEntityIds: [...state.selectedEntityIds, id],
        selectedEntityId: id
    })),

    clearSelection: () => set({
        selectedEntityId: null,
        selectedEntityIds: []
    }),

    setEditorMode: (mode) => set({ editorMode: mode }),

    setViewMode: (mode) => set({ viewMode: mode }),

    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

    toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),

    play: () => set({ isPlaying: true, isPaused: false }),

    pause: () => set((state) => ({ isPaused: !state.isPaused })),

    stop: () => set({ isPlaying: false, isPaused: false }),

    togglePanel: (panel) => set((state) => {
        switch (panel) {
            case 'hierarchy': return { showHierarchy: !state.showHierarchy };
            case 'inspector': return { showInspector: !state.showInspector };
            case 'assets': return { showAssets: !state.showAssets };
            case 'console': return { showConsole: !state.showConsole };
            case 'aiCopilot': return { showAICopilot: !state.showAICopilot };
            case 'scriptEditor': return { showScriptEditor: !state.showScriptEditor };
        }
    }),
 
    setActivePanel: (id) => set({ activePanelId: id }),
 
    setShadingMode: (mode) => set({ shadingMode: mode }),

    toggleCommandPalette: (show?: boolean) => set((state) => ({ 
        showCommandPalette: show !== undefined ? show : !state.showCommandPalette 
    })),
 
    toggleBloom: () => set((state) => ({ showBloom: !state.showBloom })),
    toggleEnvironment: () => set((state) => ({ showEnvironment: !state.showEnvironment })),
}));

