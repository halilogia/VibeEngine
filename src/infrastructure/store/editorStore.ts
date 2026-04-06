

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EditorMode = 'translate' | 'rotate' | 'scale';
export type ViewMode = 'perspective' | 'top' | 'front' | 'side';

export interface OpenFile {
    id: string;
    name: string;
    path: string;
    content: string;
    isDirty: boolean;
}

export interface EditorState {
    
    selectedEntityId: number | null;
    selectedEntityIds: number[];

    editorMode: EditorMode;

    viewMode: ViewMode;
    showGrid: boolean;
    showAxes: boolean;

    isPlaying: boolean;
    isPaused: boolean;

    showHierarchy: boolean;
    showInspector: boolean;
    showAssets: boolean;
    showConsole: boolean;
    showAICopilot: boolean;
    showScriptEditor: boolean;

    leftWidth: number;
    rightWidth: number;        
    inspectorWidth: number;
    bottomHeight: number;
    assetsWidth: number;
    consoleWidth: number;
    
    activePanelId: string | null;
    shadingMode: 'lit' | 'wireframe' | 'solid';
    showCommandPalette: boolean;
    showBloom: boolean;
    showEnvironment: boolean;
    showAICopilotSettings: boolean;
    activeSettingsTab: string;
    isScriptFullScreen: boolean;
    showAboutModal: boolean;
    previousTrayState: { 
        hierarchy: boolean; 
        inspector: boolean; 
        assets: boolean; 
        console: boolean; 
    } | null;

    openFiles: OpenFile[];
    activeFileId: string | null;

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
    setPanelSize: (panel: 'left' | 'right' | 'bottom' | 'inspector' | 'assets' | 'console', size: number) => void;
    setActivePanel: (id: string | null) => void;
    setShadingMode: (mode: 'lit' | 'wireframe' | 'solid') => void;
    toggleCommandPalette: (show?: boolean) => void;
    toggleBloom: () => void;
    toggleEnvironment: () => void;
    setShowAICopilotSettings: (show: boolean, tab?: string) => void;
    setShowAboutModal: (show: boolean) => void;
    setScriptFullScreen: (val: boolean, restore?: boolean) => void;
    setLayoutPreset: (preset: 'architect' | 'programmer' | 'animator') => void;

    openFile: (file: { id: string; name: string; path: string; content?: string }) => void;
    closeFile: (id: string) => void;
    setActiveFile: (id: string | null) => void;
    updateFileContent: (id: string, content: string) => void;

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
            showAssets: false,
            showConsole: false,
            showAICopilot: true,
            showScriptEditor: false,

            leftWidth: 260,
            rightWidth: 380,
            inspectorWidth: 320,
            bottomHeight: 300,
            assetsWidth: 500,
            consoleWidth: 380,

            activePanelId: 'viewport',
            shadingMode: 'lit',
            showCommandPalette: false,
            showBloom: true,
            showEnvironment: true,
            showAICopilotSettings: false,
            activeSettingsTab: 'project',
            isScriptFullScreen: false,
            showAboutModal: false,
            previousTrayState: null,

            openFiles: [],
            activeFileId: null,

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
                if (panel === 'console') return { consoleWidth: size };
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
            setScriptFullScreen: (val, restore) => set((state) => {
                
                if (val && !state.isScriptFullScreen) {
                    console.log('🏛️ Entering Sovereign Full Screen');
                    return { 
                        isScriptFullScreen: true, 
                        showScriptEditor: true,
                        previousTrayState: { 
                            assets: state.showAssets, 
                            console: state.showConsole,
                            hierarchy: state.showHierarchy,
                            inspector: state.showInspector 
                        },
                        showAssets: false,
                        showConsole: false,
                        showHierarchy: false,
                        showInspector: false
                    };
                }

                if (!val && restore && state.previousTrayState) {
                    console.log('🏛️ Exiting Full Screen: Restoring Layout');
                    return { 
                        isScriptFullScreen: false,
                        showAssets: state.previousTrayState.assets,
                        showConsole: state.previousTrayState.console,
                        showHierarchy: state.previousTrayState.hierarchy,
                        showInspector: state.previousTrayState.inspector,
                        previousTrayState: null
                    };
                }

                console.log('🏛️ Simple Exit Full Screen (No Restore)');
                return { isScriptFullScreen: val, previousTrayState: null };
            }),

            openFile: (file) => set((state) => {
                const existing = state.openFiles.find(f => f.path === file.path);
                if (existing) return { activeFileId: existing.id, showScriptEditor: true };
                
                const newFile: OpenFile = {
                    id: file.id,
                    name: file.name,
                    path: file.path,
                    content: file.content || '',
                    isDirty: false
                };
                return { 
                    openFiles: [...state.openFiles, newFile],
                    activeFileId: newFile.id,
                    showScriptEditor: true
                };
            }),

            closeFile: (id) => set((state) => {
                const newFiles = state.openFiles.filter(f => f.id !== id);
                let nextActive = state.activeFileId;
                if (state.activeFileId === id) {
                    nextActive = newFiles.length > 0 ? newFiles[newFiles.length - 1].id : null;
                }
                return { 
                    openFiles: newFiles, 
                    activeFileId: nextActive,
                    showScriptEditor: newFiles.length > 0
                };
            }),

            setActiveFile: (id) => set({ activeFileId: id }),
            updateFileContent: (id, content) => set((state) => ({
                openFiles: state.openFiles.map(f => f.id === id ? { ...f, content, isDirty: true } : f)
            })),

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
                consoleWidth: state.consoleWidth,
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

