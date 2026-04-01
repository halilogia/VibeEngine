/**
 * Editor Store - Global state management for the editor
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

    // Panels Persistence
    showHierarchy: boolean;
    showInspector: boolean;
    showAssets: boolean;
    showConsole: boolean;
    showAICopilot: boolean;
    showScriptEditor: boolean;

    // Panel Sizes
    leftWidth: number;
    rightWidth: number;        // Now only for AI Copilot
    inspectorWidth: number;
    bottomHeight: number;
    assetsWidth: number;       // Percentage or fixed? Let's use percentage or share.
    
    activePanelId: string | null;
    shadingMode: 'lit' | 'wireframe' | 'solid';
    showCommandPalette: boolean;
    showBloom: boolean;
    showEnvironment: boolean;
    showAICopilotSettings: boolean;
    activeSettingsTab: string;

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
    setPanelSize: (panel: 'left' | 'right' | 'bottom' | 'inspector' | 'assets', size: number) => void;
    setActivePanel: (id: string | null) => void;
    setShadingMode: (mode: 'lit' | 'wireframe' | 'solid') => void;
    toggleCommandPalette: (show?: boolean) => void;
    toggleBloom: () => void;
    toggleEnvironment: () => void;
    setShowAICopilotSettings: (show: boolean, tab?: string) => void;
    showAboutModal: boolean;
    setShowAboutModal: (show: boolean) => void;
    setLayoutPreset: (preset: 'architect' | 'programmer' | 'animator') => void;

    // Comprehensive Engine Config
    engineConfig: {
        editorTheme: string;
        uiScale: number;
        locale: string;
        cameraSensitivity: number;
        interactionMargin: number;
        invertY: boolean;
        smartSnap: boolean;
        antiAliasing: string;
        shadowResolution: string;
        textureFiltering: string;
        vSync: string;
        enableSSR: boolean;
        enableMotionBlur: boolean;
        neuralMaxTokens: number;
        neuralTemperature: number;
    };
    updateEngineConfig: (updates: Partial<EditorState['engineConfig']>) => void;
}

export const useEditorStore = create<EditorState>()(
    persist(
        (set) => ({
            // Initial state
            selectedEntityId: null,
            selectedEntityIds: [],
            editorMode: 'translate',
            viewMode: 'perspective',
            showGrid: true,
            showAxes: true,
            isPlaying: false,
            isPaused: false,
            
            // Visibility
            showHierarchy: true,
            showInspector: true,
            showAssets: false,
            showConsole: false,
            showAICopilot: true,
            showScriptEditor: false,

            // Default Sizes
            leftWidth: 260,
            rightWidth: 380,
            inspectorWidth: 320,
            bottomHeight: 300,
            assetsWidth: 500,

            activePanelId: 'viewport',
            shadingMode: 'lit',
            showCommandPalette: false,
            showBloom: true,
            showEnvironment: true,
            showAICopilotSettings: false,
            activeSettingsTab: 'project',

            engineConfig: {
                editorTheme: 'Sovereign Dark',
                uiScale: 100,
                locale: 'English (Global)',
                cameraSensitivity: 0.5,
                interactionMargin: 2,
                invertY: false,
                smartSnap: true,
                antiAliasing: '8x Samples',
                shadowResolution: '2048px (Elite)',
                textureFiltering: 'Anisotropic 16x',
                vSync: 'Synchronized',
                enableSSR: true,
                enableMotionBlur: true,
                neuralMaxTokens: 4096,
                neuralTemperature: 0.72
            },

            // Actions
            selectEntity: (id) => set({
                selectedEntityId: id,
                selectedEntityIds: id ? [id] : []
            }),

            updateEngineConfig: (updates) => set((state) => ({ 
                engineConfig: { ...state.engineConfig, ...updates }
            })),

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

            setPanelSize: (panel, size) => set((state) => {
                if (panel === 'left') return { leftWidth: size };
                if (panel === 'right') return { rightWidth: size };
                if (panel === 'inspector') return { inspectorWidth: size };
                if (panel === 'bottom') return { bottomHeight: size };
                if (panel === 'assets') return { assetsWidth: size };
                return state;
            }),

            setActivePanel: (id) => set({ activePanelId: id }),
            setShadingMode: (mode) => set({ shadingMode: mode }),
            toggleCommandPalette: (show?: boolean) => set((state) => ({ 
                showCommandPalette: show !== undefined ? show : !state.showCommandPalette 
            })),
            toggleBloom: () => set((state) => ({ showBloom: !state.showBloom })),
            toggleEnvironment: () => set((state) => ({ showEnvironment: !state.showEnvironment })),
            setShowAICopilotSettings: (show, tab) => set((state) => ({ 
                showAICopilotSettings: show, 
                activeSettingsTab: tab || state.activeSettingsTab 
            })),
            setShowAboutModal: (show) => set({ showAboutModal: show }),

            setLayoutPreset: (preset) => set((state) => {
                if (preset === 'architect') {
                    return { ...state, showHierarchy: true, showInspector: true, showAssets: true, showConsole: false, showScriptEditor: false, leftWidth: 260, rightWidth: 340, inspectorWidth: 320, bottomHeight: 280, assetsWidth: 500 };
                }
                if (preset === 'programmer') {
                    return { ...state, showHierarchy: true, showInspector: false, showAssets: false, showConsole: true, showScriptEditor: true, leftWidth: 220, rightWidth: 400, inspectorWidth: 320, bottomHeight: 320, assetsWidth: 500 };
                }
                if (preset === 'animator') {
                    return { ...state, showHierarchy: false, showInspector: true, showAssets: true, showConsole: false, showScriptEditor: false, leftWidth: 200, rightWidth: 300, inspectorWidth: 320, bottomHeight: 450, assetsWidth: 500 };
                }
                return state;
            })
        }),
        {
            name: 'vibe_editor_layout',
            partialize: (state) => ({ 
                showHierarchy: state.showHierarchy,
                showInspector: state.showInspector,
                showAssets: state.showAssets,
                showConsole: state.showConsole,
                showAICopilot: state.showAICopilot,
                showScriptEditor: state.showScriptEditor,
                leftWidth: state.leftWidth,
                rightWidth: state.rightWidth,
                inspectorWidth: state.inspectorWidth,
                bottomHeight: state.bottomHeight,
                assetsWidth: state.assetsWidth,
                activePanelId: state.activePanelId,
                editorMode: state.editorMode,
                viewMode: state.viewMode,
                showGrid: state.showGrid,
                showAxes: state.showAxes,
                shadingMode: state.shadingMode,
                showBloom: state.showBloom,
                showEnvironment: state.showEnvironment,
                showAICopilotSettings: state.showAICopilotSettings,
                engineConfig: state.engineConfig
            }),
        }
    )
);

