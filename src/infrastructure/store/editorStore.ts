import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EditorState,
  OpenFile,
  PanelType,
  PanelSizeType,
  LayoutPreset,
} from "./editorStore.types";
import {
  DEFAULT_SHORTCUTS,
  PANEL_MAP,
  SIZE_MAP,
  PERSIST_KEYS,
  DEFAULT_ENGINE_CONFIG,
  LAYOUT_PRESETS,
} from "./editorStore.constants";

export type {
  EditorMode,
  ViewMode,
  ShortcutBinding,
  ShortcutConfig,
  OpenFile,
  EditorState,
  ShadingMode,
  LayoutPreset,
  PanelType,
  PanelSizeType,
} from "./editorStore.types";
export { DEFAULT_SHORTCUTS } from "./editorStore.constants";

const defaultState = {
  selectedEntityId: null as number | null,
  selectedEntityIds: [] as number[],
  editorMode: "translate" as const,
  viewMode: "perspective" as const,
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
  activePanelId: "viewport",
  shadingMode: "lit" as const,
  showCommandPalette: false,
  showBloom: true,
  showEnvironment: true,
  showAICopilotSettings: false,
  showBuildModal: false,
  activeSettingsTab: "project" as "project" | "interface" | "input" | "graphics" | "neural" | "ai",
  isScriptFullScreen: false,
  isViewportMaximized: false,
  showAboutModal: false,
  previousTrayState: null,
  openFiles: [] as OpenFile[],
  activeFileId: null as string | null,
  engineConfig: DEFAULT_ENGINE_CONFIG,
  shortcuts: { ...DEFAULT_SHORTCUTS },
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      ...defaultState,
      selectEntity: (id) =>
        set({ selectedEntityId: id, selectedEntityIds: id ? [id] : [] }),
      updateEngineConfig: (updates) =>
        set((s) => ({ engineConfig: { ...s.engineConfig, ...updates } })),
      addToSelection: (id) =>
        set((s) => ({
          selectedEntityIds: [...s.selectedEntityIds, id],
          selectedEntityId: id,
        })),
      clearSelection: () =>
        set({ selectedEntityId: null, selectedEntityIds: [] }),
      setEditorMode: (mode) => set({ editorMode: mode }),
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      toggleAxes: () => set((s) => ({ showAxes: !s.showAxes })),
      play: () => set({ isPlaying: true, isPaused: false }),
      pause: () => set((s) => ({ isPaused: !s.isPaused })),
      stop: () => set({ isPlaying: false, isPaused: false }),
      togglePanel: (panel: PanelType) =>
        set((s) => ({ [PANEL_MAP[panel]]: !s[PANEL_MAP[panel]] })),
      setPanelSize: (panel: PanelSizeType, size: number) =>
        set(() => ({ [SIZE_MAP[panel]]: size })),
      setActivePanel: (id) => set({ activePanelId: id }),
      setShadingMode: (mode) => set({ shadingMode: mode }),
      toggleCommandPalette: (show?: boolean) =>
        set((s) => ({
          showCommandPalette: show ?? !s.showCommandPalette,
        })),
      toggleBloom: () => set((s) => ({ showBloom: !s.showBloom })),
      toggleEnvironment: () =>
        set((s) => ({ showEnvironment: !s.showEnvironment })),
      setShowAICopilotSettings: (show, tab) =>
        set((s) => ({
          showAICopilotSettings: show,
          activeSettingsTab: tab === "about" ? "project" : (tab ?? s.activeSettingsTab),
        })),
      setShowBuildModal: (show) => set({ showBuildModal: show }),
      setShowAboutModal: (show) => set({ showAboutModal: show }),
      setScriptFullScreen: (val, restore) =>
        set((s) => {
          if (val && !s.isScriptFullScreen)
            return {
              isScriptFullScreen: true,
              showScriptEditor: true,
              previousTrayState: {
                assets: s.showAssets,
                console: s.showConsole,
                hierarchy: s.showHierarchy,
                inspector: s.showInspector,
              },
              showAssets: false,
              showConsole: false,
              showHierarchy: false,
              showInspector: false,
            };
          if (!val && restore && s.previousTrayState)
            return {
              isScriptFullScreen: false,
              showAssets: s.previousTrayState.assets,
              showConsole: s.previousTrayState.console,
              showHierarchy: s.previousTrayState.hierarchy,
              showInspector: s.previousTrayState.inspector,
              previousTrayState: null,
            };
          return { isScriptFullScreen: val, previousTrayState: null };
        }),
      toggleViewportMaximize: () =>
        set((s) => {
          if (!s.isViewportMaximized) {
            return {
              isViewportMaximized: true,
              previousTrayState: {
                assets: s.showAssets,
                console: s.showConsole,
                hierarchy: s.showHierarchy,
                inspector: s.showInspector,
              },
              showAssets: false,
              showConsole: false,
              showHierarchy: false,
              showInspector: false,
            };
          } else {
            return {
              isViewportMaximized: false,
              showAssets: s.previousTrayState?.assets ?? false,
              showConsole: s.previousTrayState?.console ?? false,
              showHierarchy: s.previousTrayState?.hierarchy ?? true,
              showInspector: s.previousTrayState?.inspector ?? true,
              previousTrayState: null,
            };
          }
        }),
      openFile: (file) =>
        set((s) => {
          const existing = s.openFiles.find((f) => f.path === file.path);
          if (existing)
            return { activeFileId: existing.id, showScriptEditor: true };
          const newFile: OpenFile = {
            id: file.id,
            name: file.name,
            path: file.path,
            content: file.content || "",
            isDirty: false,
          };
          return {
            openFiles: [...s.openFiles, newFile],
            activeFileId: newFile.id,
            showScriptEditor: true,
          };
        }),
      closeFile: (id) =>
        set((s) => {
          const newFiles = s.openFiles.filter((f) => f.id !== id);
          const nextActive =
            s.activeFileId === id
              ? newFiles.length > 0
                ? newFiles[newFiles.length - 1].id
                : null
              : s.activeFileId;
          return {
            openFiles: newFiles,
            activeFileId: nextActive,
            showScriptEditor: newFiles.length > 0,
          };
        }),
      setActiveFile: (id) => set({ activeFileId: id }),
      updateFileContent: (id, content) =>
        set((s) => ({
          openFiles: s.openFiles.map((f) =>
            f.id === id ? { ...f, content, isDirty: true } : f,
          ),
        })),
      updateShortcut: (id, binding) =>
        set((s) => ({ shortcuts: { ...s.shortcuts, [id]: binding } })),
      resetShortcuts: () => set({ shortcuts: { ...DEFAULT_SHORTCUTS } }),
      setLayoutPreset: (preset: LayoutPreset) =>
        set((s) => {
          const layout = LAYOUT_PRESETS[preset];
          return layout ? { ...s, ...layout } : s;
        }),
    }),
    {
      name: "vibe_editor_layout",
      partialize: (state) =>
        Object.fromEntries(
          PERSIST_KEYS.map((k) => [k, state[k as keyof typeof state]]),
        ),
    },
  ),
);
