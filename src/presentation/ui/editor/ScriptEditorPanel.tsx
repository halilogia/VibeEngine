

import React, { useState } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useEditorStore, useSceneStore } from '@infrastructure/store';
import { ProjectScanner } from '@infrastructure/services/ProjectScanner';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';
import { scriptStyles as styles } from './ScriptEditorPanel.styles';

import Editor, { loader, type BeforeMount } from '@monaco-editor/react';

loader.config({ 
    paths: { vs: 'https://unpkg.com/monaco-editor@0.43.0/min/vs' } 
});

interface TabProps {
    name: string;
    isActive: boolean;
    isDirty: boolean;
    onClick: () => void;
    onClose: () => void;
}

const ScriptTab: React.FC<TabProps> = ({ name, isActive, isDirty, onClick, onClose }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{ 
                ...styles.tab, 
                ...(isActive ? styles.tabActive : {}),
                ...(isHovered && !isActive ? styles.tabHover : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <VibeIcons name="Code" size={14} style={{ opacity: isActive ? 1 : 0.6 }} />
            <span>{name}</span>
            {isDirty && <div style={styles.dirtyDot} />}
            {(isHovered || isActive) && (
                <button
                    style={{ 
                        ...styles.closeBtn,
                        ...(isHovered ? styles.closeBtnHover : {})
                    }}
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    <VibeIcons name="X" size={10} strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
};

interface ScriptEditorPanelProps {
    dragHandleProps?: Record<string, unknown>;
}

export const ScriptEditorPanel: React.FC<ScriptEditorPanelProps> = ({ dragHandleProps }) => {
    const { 
        activePanelId, setActivePanel, engineConfig,
        isScriptFullScreen, setScriptFullScreen,
        openFiles, activeFileId, closeFile, setActiveFile, updateFileContent,
        showAICopilot    } = useEditorStore();
    const { selectedEntityId, entities } = useSceneStore();
    
    const activeScript = openFiles.find(s => s.id === activeFileId);
    const selectedEntity = selectedEntityId ? entities.get(selectedEntityId) : null;

    if (openFiles.length === 0) {
        return (
            <div 
                className={`editor-panel script-editor-panel ${activePanelId === 'scripts' ? 'active-panel' : ''}`}
                onClick={() => setActivePanel('scripts')}
                style={styles.panel}
            >
                <div style={{ ...styles.header, justifyContent: 'flex-end', borderBottom: 'none' }}>
                     {isScriptFullScreen && (
                        <VibeButton variant="ghost" size="sm" onClick={() => setScriptFullScreen(false)} style={{ border: 'none', background: 'transparent' }}>
                            <VibeIcons name="ChevronDown" size={16} /> EXIT FULLSCREEN
                        </VibeButton>
                    )}
                </div>
                <div style={styles.emptyState}>
                    <VibeIcons name="Code" size={48} style={{ opacity: 0.1, color: VibeTheme.colors.accent }} />
                    <h3 style={{ margin: 0, color: VibeTheme.colors.textMain }}>NO SCRIPTS OPEN</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: VibeTheme.colors.textSecondary }}>Open a script from the Assets panel to start coding.</p>
                </div>
            </div>
        );
    }

    const handleEditorWillMount: BeforeMount = (monaco) => {
        console.log('💎 MONACO HANDSHAKE: THEME DEFINITION');
        monaco.editor.defineTheme('vibe-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
                { token: 'string', foreground: '34d399' },
                { token: 'number', foreground: 'fbbf24' },
                { token: 'type', foreground: '60a5fa' },
            ],
            colors: {
                'editor.background': '#05050a',
                'editor.foreground': '#ffffff',
                'editor.lineHighlightBackground': '#11111a',
                'editorCursor.foreground': '#6366f1',
                'editor.selectionBackground': '#26264d',
                'editorBracketMatch.background': '#2d2d59',
                'editorGutter.background': '#05050a',
                'editorIndentGuide.background': '#1a1a2e',
                'editorLineNumber.foreground': '#4b5563',
                'editorLineNumber.activeForeground': '#6366f1',
            }
        });
    };

    const handleSave = async () => {
        if (!activeFileId || !activeScript) return;
        
        try {
            const result = await ProjectScanner.saveFile(activeScript.path, activeScript.content || '');
            if (result.success) {
                console.log('💾 File saved successfully:', activeScript.path);
            } else {
                console.error('❌ Save failed:', result.error);
            }
        } catch (e) {
            console.error('❌ Save error:', e);
        }
    };

    return (
        <div 
            className={`editor-panel script-editor-panel ${activePanelId === 'scripts' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('scripts')}
            style={styles.panel}
        >
            <div 
                style={{ 
                    ...styles.header, 
                    cursor: isScriptFullScreen ? 'row-resize' : 'default',
                    paddingRight: (showAICopilot && !isScriptFullScreen) ? '80px' : '12px' 
                }}
                {...(dragHandleProps as Record<string, unknown>)}
            >
                <div style={styles.tabs}>
                    {openFiles.map(script => (
                        <ScriptTab
                            key={script.id}
                            name={script.name}
                            isActive={activeFileId === script.id}
                            isDirty={script.isDirty}
                            onClick={() => setActiveFile(script.id)}
                            onClose={() => closeFile(script.id)}
                        />
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {selectedEntity && (
                        <div style={styles.badge}>RECEPTOR: {selectedEntity.name.toUpperCase()}</div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {isScriptFullScreen ? (
                            <VibeButton variant="ghost" size="sm" onClick={() => setScriptFullScreen(false, true)} style={{ color: VibeTheme.colors.accent }}>
                                <VibeIcons name="ChevronDown" size={16} />
                            </VibeButton>
                        ) : (
                            <VibeButton variant="ghost" size="sm" onClick={() => setScriptFullScreen(true)}>
                                <VibeIcons name="ChevronUp" size={16} />
                            </VibeButton>
                        )}

                        <VibeButton 
                            variant="primary" 
                            size="sm" 
                            style={{ height: '28px', padding: '0 12px' }}
                            onClick={handleSave}
                        >
                            <VibeIcons name="Save" size={14} /> SAVE
                        </VibeButton>
                    </div>
                </div>
            </div>

            <div style={{ ...styles.editorContainer, flex: 1, position: 'relative', background: VibeTheme.colors.bgPrimary }}>
                <Editor
                    key={activeFileId || 'empty'}
                    height="100%"
                    defaultLanguage="typescript"
                    defaultValue={activeScript?.content || ""}
                    value={activeScript?.content}
                    onChange={(val) => activeFileId && updateFileContent(activeFileId, val || '')}
                    beforeMount={handleEditorWillMount}
                    loading={
                        <div style={styles.emptyState}>
                            <VibeIcons 
                                name="Loader" 
                                size={42} 
                                style={{ 
                                    animation: 'vSpin 1.5s linear infinite', 
                                    color: VibeTheme.colors.accent,
                                    filter: 'drop-shadow(0 0 10px var(--vibe-accent))'
                                }} 
                            />
                            <span style={{ 
                                fontSize: '10px', 
                                fontWeight: 700,
                                letterSpacing: '0.4em', 
                                marginTop: '20px',
                                opacity: 0.8,
                                color: VibeTheme.colors.accent 
                            }}>
                                INITIALIZING QUANTUM EDITOR...
                            </span>
                        </div>
                    }
                    theme="vibe-dark"
                    options={{
                        fontSize: 14 * ((engineConfig.uiScale || 100) / 100),
                        minimap: { enabled: true },
                        padding: { top: 20, bottom: 20 },
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        contextmenu: true,
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        folding: true,
                        bracketPairColorization: { enabled: true },
                        quickSuggestions: true,
                        scrollbar: {
                            verticalScrollbarSize: 4,
                            horizontalScrollbarSize: 4,
                            verticalSliderSize: 4,
                            useShadows: false
                        }
                    }}
                />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes vSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .v-spin {
                    animation: vSpin 1.5s linear infinite;
                    color: ${VibeTheme.colors.accent};
                }
            ` }} />
        </div>
    );
};
