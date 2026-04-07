export type EditorMode = "translate" | "rotate" | "scale";
export type ViewMode = "perspective" | "top" | "front" | "side";

export interface ShortcutBinding {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

export interface ShortcutConfig {
  id: string;
  label: string;
  category: string;
  binding: ShortcutBinding;
  action: () => void;
}

export interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
}

export interface PreviousTrayState {
  hierarchy: boolean;
  inspector: boolean;
  assets: boolean;
  console: boolean;
}

export interface EngineConfig {
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
}

export type ShadingMode = "lit" | "wireframe" | "solid";
export type LayoutPreset = "architect" | "programmer" | "animator";
export type SettingsTabType = "project" | "interface" | "input" | "graphics" | "neural" | "ai" | "about";
export type PanelType =
  | "hierarchy"
  | "inspector"
  | "assets"
  | "console"
  | "aiCopilot"
  | "scriptEditor";
export type PanelSizeType =
  | "left"
  | "right"
  | "bottom"
  | "inspector"
  | "assets"
  | "console";

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
  shadingMode: ShadingMode;
  showCommandPalette: boolean;
  showBloom: boolean;
  showEnvironment: boolean;
  showAICopilotSettings: boolean;
  showBuildModal: boolean;
  activeSettingsTab: "project" | "interface" | "input" | "graphics" | "neural" | "ai" | "about";
  isScriptFullScreen: boolean;
  showAboutModal: boolean;
  previousTrayState: PreviousTrayState | null;
  openFiles: OpenFile[];
  activeFileId: string | null;
  engineConfig: EngineConfig;
  shortcuts: Record<string, ShortcutBinding>;

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
  togglePanel: (panel: PanelType) => void;
  setPanelSize: (panel: PanelSizeType, size: number) => void;
  setActivePanel: (id: string | null) => void;
  setShadingMode: (mode: ShadingMode) => void;
  toggleCommandPalette: (show?: boolean) => void;
  toggleBloom: () => void;
  toggleEnvironment: () => void;
  setShowAICopilotSettings: (show: boolean, tab?: "project" | "interface" | "input" | "graphics" | "neural" | "ai" | "about") => void;
  setShowBuildModal: (show: boolean) => void;
  setShowAboutModal: (show: boolean) => void;
  setScriptFullScreen: (val: boolean, restore?: boolean) => void;
  setLayoutPreset: (preset: LayoutPreset) => void;
  openFile: (file: {
    id: string;
    name: string;
    path: string;
    content?: string;
  }) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  updateFileContent: (id: string, content: string) => void;
  updateEngineConfig: (updates: Partial<EngineConfig>) => void;
  updateShortcut: (id: string, binding: ShortcutBinding) => void;
  resetShortcuts: () => void;
}