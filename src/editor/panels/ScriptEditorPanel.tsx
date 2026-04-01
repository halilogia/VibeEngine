/**
 * ScriptEditorPanel — In-browser TypeScript/JavaScript script editor.
 * Uses Monaco Editor (same engine as VS Code) with VibeEngine type hints.
 */

import React, { useState, useCallback, useRef } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { Save, Play, X, FilePlus, Code2 } from 'lucide-react';
import { useEditorStore, useSceneStore } from '../stores';
import './ScriptEditorPanel.css';

// #region Script Templates
const DEFAULT_SCRIPT = `/**
 * MyScript — VibeEngine Script Component
 * 
 * Lifecycle:
 *   onStart()  → called once when Play begins
 *   onUpdate(dt) → called every frame (dt = delta time in seconds)
 *   onDestroy() → called when entity is removed
 */

export function onStart() {
    console.log('Entity started:', this.entity.name);
}

export function onUpdate(dt: number) {
    // Called every frame. Use dt (delta time) for smooth movement.
    // Example: rotate entity
    // this.entity.rotation.y += 1.0 * dt;
}

export function onDestroy() {
    console.log('Entity destroyed');
}
`;

const SCRIPT_TEMPLATES: Record<string, string> = {
    'Blank': DEFAULT_SCRIPT,
    'Rotate': `export function onStart() {
    this.speed = 1.0; // radians/second
}

export function onUpdate(dt: number) {
    this.entity.rotation.y += this.speed * dt;
}

export function onDestroy() {}
`,
    'Follow Camera': `export function onStart() {
    this.target = null;
}

export function onUpdate(dt: number) {
    // Move toward origin slowly
    const pos = this.entity.position;
    pos.x += (0 - pos.x) * 2 * dt;
    pos.z += (0 - pos.z) * 2 * dt;
}

export function onDestroy() {}
`
};
// #endregion

interface ScriptTab {
    id: string;
    name: string;
    content: string;
    isDirty: boolean;
    entityId?: number;
}

export const ScriptEditorPanel: React.FC = () => {
    const [tabs, setTabs] = useState<ScriptTab[]>([
        { id: '1', name: 'NewScript.ts', content: DEFAULT_SCRIPT, isDirty: false }
    ]);
    const [activeTabId, setActiveTabId] = useState('1');
    const [showTemplates, setShowTemplates] = useState(false);
    const monacoRef = useRef<Monaco | null>(null);
    const { selectedEntityId } = useEditorStore();
    const { getEntity, updateComponent } = useSceneStore();

    const activeTab = tabs.find(t => t.id === activeTabId)!;

    // #region Monaco Setup
    const handleEditorMount = useCallback((_editor: unknown, monaco: Monaco) => {
        monacoRef.current = monaco;

        // Add VibeEngine type declarations
        monaco.languages.typescript.typescriptDefaults.addExtraLib(`
            declare const engine: {
                readonly entity: { name: string; position: {x:number;y:number;z:number}; rotation: {x:number;y:number;z:number}; scale: {x:number;y:number;z:number} };
                getComponent(type: string): Record<string, unknown> | null;
            };
        `, 'file:///vibe-engine.d.ts');

        monaco.editor.defineTheme('vibe-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '5c6773', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'a78bfa' },
                { token: 'string', foreground: '86efac' },
                { token: 'number', foreground: 'fbbf24' },
            ],
            colors: {
                'editor.background': '#0d0d1a',
                'editor.foreground': '#e2e8f0',
                'editorLineNumber.foreground': '#2d3748',
                'editorCursor.foreground': '#818cf8',
                'editor.selectionBackground': '#312e81',
                'editor.lineHighlightBackground': '#1a1a2e',
            }
        });

        monaco.editor.setTheme('vibe-dark');
    }, []);
    // #endregion

    // #region Tab Management
    const createTab = (templateName = 'Blank') => {
        const id = Date.now().toString();
        const tab: ScriptTab = {
            id,
            name: `Script${tabs.length + 1}.ts`,
            content: SCRIPT_TEMPLATES[templateName] ?? DEFAULT_SCRIPT,
            isDirty: false
        };
        setTabs(prev => [...prev, tab]);
        setActiveTabId(id);
        setShowTemplates(false);
    };

    const closeTab = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId);
        if (tab?.isDirty && !confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return;

        const remaining = tabs.filter(t => t.id !== tabId);
        setTabs(remaining);
        if (activeTabId === tabId) {
            setActiveTabId(remaining[remaining.length - 1]?.id ?? '');
        }
    };

    const updateTabContent = (content: string | undefined) => {
        if (content === undefined) return;
        setTabs(prev => prev.map(t =>
            t.id === activeTabId ? { ...t, content, isDirty: true } : t
        ));
    };
    // #endregion

    // #region Save
    const saveScript = () => {
        if (!activeTab) return;

        // If entity selected, attach script to its Script component
        if (selectedEntityId !== null) {
            const entity = getEntity(selectedEntityId);
            if (entity) {
                const hasScript = entity.components.find(c => c.type === 'Script');
                if (hasScript) {
                    updateComponent(selectedEntityId, 'Script', {
                        code: activeTab.content,
                        scriptName: activeTab.name
                    });
                } else {
                    useSceneStore.getState().addComponent(selectedEntityId, {
                        type: 'Script',
                        data: { code: activeTab.content, scriptName: activeTab.name },
                        enabled: true
                    });
                }
                console.log(`✅ [Script] "${activeTab.name}" saved to Entity #${selectedEntityId}`);
            }
        }

        setTabs(prev => prev.map(t =>
            t.id === activeTabId ? { ...t, isDirty: false } : t
        ));
    };
    // #endregion

    return (
        <div className="script-editor-panel editor-panel">
            {/* Header */}
            <div className="editor-panel-header script-editor-header">
                <div className="script-tabs">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`script-tab ${tab.id === activeTabId ? 'active' : ''}`}
                            onClick={() => setActiveTabId(tab.id)}
                        >
                            <Code2 size={12} />
                            <span>{tab.name}</span>
                            {tab.isDirty && <span className="dirty-dot" />}
                            <button
                                className="tab-close"
                                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                    <button className="new-tab-btn" onClick={() => setShowTemplates(!showTemplates)}>
                        <FilePlus size={14} />
                    </button>
                    {showTemplates && (
                        <div className="template-menu">
                            {Object.keys(SCRIPT_TEMPLATES).map(name => (
                                <div key={name} className="template-item" onClick={() => createTab(name)}>
                                    {name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="panel-actions">
                    {selectedEntityId && (
                        <span className="entity-target">→ Entity #{selectedEntityId}</span>
                    )}
                    <button
                        className="editor-btn primary script-save-btn"
                        onClick={saveScript}
                        title="Save Script (Ctrl+S)"
                    >
                        <Save size={14} />
                        <span>Save</span>
                    </button>
                </div>
            </div>

            {/* Monaco Editor */}
            {activeTab ? (
                <div className="monaco-container">
                    <Editor
                        height="100%"
                        language="typescript"
                        value={activeTab.content}
                        onChange={updateTabContent}
                        onMount={handleEditorMount}
                        options={{
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            fontLigatures: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 4,
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            renderLineHighlight: 'line',
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            smoothScrolling: true,
                        }}
                    />
                </div>
            ) : (
                <div className="script-empty-state">
                    <Play size={32} style={{ opacity: 0.2 }} />
                    <p>Open or create a script to begin</p>
                    <button className="editor-btn" onClick={() => createTab()}>
                        <FilePlus size={14} /> New Script
                    </button>
                </div>
            )}
        </div>
    );
};
