/**
 * Unified Minimalist MenuBar (Sovereign Elite Edition)
 * 🏛️⚛️💎🚀
 * 
 * This component now consolidates the MenuBar, Toolbar, and Play Controls
 * into a single minimalist header to maximize workspace and visual clarity.
 */

import React, { useState, useRef } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useEditorStore, useSceneStore, type EditorMode } from '@infrastructure/store';
import { useProjectStore } from '@infrastructure/store/useProjectStore';
import { useToastStore } from '@infrastructure/store/toastStore';
import { usePlayModeStore } from '@presentation/features/editor/core';
import { downloadScene, loadSceneFromFile, createDefaultScene, exportToHTML } from '@presentation/features/editor/serialization';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';
import { menuBarStyles as styles } from './MenuBar.styles';

interface MenuItem {
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    action?: () => void;
    divider?: boolean;
}

interface MenuSection {
    label: string;
    items: MenuItem[];
}

export const MenuBar: React.FC = () => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Stores
    const { 
        editorMode, setEditorMode, togglePanel, 
        showAICopilot, showScriptEditor, showHierarchy, showConsole, showAssets, showInspector 
    } = useEditorStore();
    const { sceneName, isDirty } = useSceneStore();
    const { setShowLauncher } = useProjectStore();
    const { addToast } = useToastStore();
    const { isPlaying, isPaused, play, pause, stop } = usePlayModeStore();

    const handleOpenLauncher = () => { setShowLauncher(true); setOpenMenu(null); };
    const handleOpen = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try { await loadSceneFromFile(file); addToast('Scene loaded', 'success'); } 
            catch (error) { addToast('Load failed', 'error'); }
        }
        e.target.value = ''; setOpenMenu(null);
    };

    const handleSave = () => {
        downloadScene(`${sceneName.replace(/\s+/g, '_')}.json`);
        useSceneStore.setState({ isDirty: false });
        addToast('Scene saved', 'success');
    };

    const menus: MenuSection[] = [
        {
            label: 'File',
            items: [
                { label: 'Manage Projects', icon: <VibeIcons name="Layers" size={14} />, shortcut: 'Ctrl+L', action: handleOpenLauncher },
                { divider: true, label: '' },
                { label: 'New Scene', icon: <VibeIcons name="Plus" size={14} />, action: () => { createDefaultScene(); addToast('New Scene', 'info'); } },
                { label: 'Open Scene...', icon: <VibeIcons name="Search" size={14} />, action: handleOpen },
                { label: 'Save Scene', icon: <VibeIcons name="Save" size={14} />, action: handleSave },
            ]
        },
        {
            label: 'Build',
            items: [
                { label: 'Export HTML', icon: <VibeIcons name="Save" size={14} />, action: () => exportToHTML(sceneName) },
            ]
        }
    ];

    const transformButtons: { mode: EditorMode; icon: string; label: string }[] = [
        { mode: 'translate', icon: 'Move', label: 'Move' },
        { mode: 'rotate', icon: 'Rotate', label: 'Rotate' },
        { mode: 'scale', icon: 'Scale', label: 'Scale' },
    ];

    return (
        <div className="unified-header" style={styles.container}>
            <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />

            {/* LEFT: Branding & Menu & Transform Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={styles.logoGroup} onClick={handleOpenLauncher}>
                    <img src="/assets/icon1.png" alt="V" style={{ height: '20px' }} />
                </div>

                {menus.map(menu => (
                    <div
                        key={menu.label}
                        style={{ ...styles.trigger, ...(openMenu === menu.label ? styles.triggerActive : {}) }}
                        onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                    >
                        {menu.label}
                        {openMenu === menu.label && (
                            <div style={styles.dropdown}>
                                {menu.items.map((item, idx) => (
                                    item.divider ? <div key={idx} style={styles.divider} /> : (
                                        <div key={item.label} 
                                            style={{ ...styles.menuItem, ...(hoveredItem === item.label ? styles.menuItemHover : {}) }}
                                            onMouseEnter={() => setHoveredItem(item.label)} onMouseLeave={() => setHoveredItem(null)}
                                            onClick={(e) => { e.stopPropagation(); item.action?.(); setOpenMenu(null); }}
                                        >
                                            <VibeIcons name={item.icon ? (item.icon as any).props.name : 'Plus'} size={14} />
                                            <span style={{ marginLeft: '8px' }}>{item.label}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div style={styles.dividerVertical} />

                <div style={styles.dividerVertical} />

                {/* 🟢 Transform Tools (Simplified Glowing Icons) */}
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {transformButtons.map((m: { mode: EditorMode; icon: string; label: string }) => (
                        <VibeButton
                            key={m.mode}
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditorMode(m.mode)}
                            style={{ 
                                width: '32px', height: '32px', padding: 0,
                                color: editorMode === m.mode ? VibeTheme.colors.accent : 'rgba(255,255,255,0.4)',
                                background: editorMode === m.mode ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                filter: editorMode === m.mode ? `drop-shadow(0 0 5px ${VibeTheme.colors.accent}aa)` : 'none'
                             }}
                            title={m.label}
                        >
                            <VibeIcons name={m.icon as any} size={14} />
                        </VibeButton>
                    ))}
                </div>
            </div>

            {/* CENTER: Playback Controls */}
            <div style={styles.playbackGroup}>
                {!isPlaying ? (
                    <VibeButton variant="primary" size="sm" onClick={play} style={{ borderRadius: '20px', background: '#10b981', height: '28px', padding: '0 12px' }}>
                        <VibeIcons name="Play" size={14} />
                    </VibeButton>
                ) : (
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '20px' }}>
                        <VibeButton variant={isPaused ? 'primary' : 'ghost'} size="sm" onClick={pause} style={{ height: '24px', borderRadius: '12px' }}>
                            <VibeIcons name="Pause" size={14} />
                        </VibeButton>
                        <VibeButton variant="danger" size="sm" onClick={stop} style={{ background: '#ef4444', height: '24px', borderRadius: '12px' }}>
                            <VibeIcons name="Square" size={14} />
                        </VibeButton>
                    </div>
                )}
            </div>

            {/* RIGHT: Layout & Utilities */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.dividerVertical} />

                {/* 🟢 Layout Toggle Suite (The only control box) */}
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginLeft: '12px' }}>
                    {/* Left: Hierarchy */}
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('hierarchy')} 
                        style={{ 
                            width: '32px', height: '32px', padding: 0, 
                            color: showHierarchy ? VibeTheme.colors.accent : 'rgba(255,255,255,0.4)',
                            filter: showHierarchy ? `drop-shadow(0 0 4px ${VibeTheme.colors.accent}88)` : 'none'
                        }}
                    >
                        <VibeIcons name="Sidebar" size={16} />
                    </VibeButton>
                    
                    {/* Bottom A: Assets */}
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('assets')} 
                        style={{ 
                            width: '32px', height: '32px', padding: 0, 
                            color: showAssets ? '#34d399' : 'rgba(255,255,255,0.4)',
                            filter: showAssets ? `drop-shadow(0 0 4px #34d39988)` : 'none',
                            transform: 'rotate(90deg)'
                        }}
                    >
                        <VibeIcons name="Grid" size={14} />
                    </VibeButton>

                    {/* Bottom B: Console */}
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('console')} 
                        style={{ 
                            width: '32px', height: '32px', padding: 0, 
                            color: showConsole ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                            filter: showConsole ? `drop-shadow(0 0 4px #60a5fa88)` : 'none',
                            transform: 'rotate(90deg)'
                        }}
                    >
                        <VibeIcons name="Terminal" size={14} />
                    </VibeButton>

                    {/* Right A: Inspector */}
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('inspector')} 
                        style={{ 
                            width: '32px', height: '32px', padding: 0, 
                            color: showInspector ? VibeTheme.colors.accent : 'rgba(255,255,255,0.4)',
                            filter: showInspector ? `drop-shadow(0 0 4px ${VibeTheme.colors.accent}88)` : 'none',
                            transform: 'scaleX(-1)'
                        }}
                    >
                        <VibeIcons name="Sidebar" size={16} />
                    </VibeButton>

                    {/* Right B: AI Copilot */}
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('aiCopilot')} 
                        style={{ 
                            width: '32px', height: '32px', padding: 0, 
                            color: showAICopilot ? VibeTheme.colors.accent : 'rgba(255,255,255,0.4)',
                            filter: showAICopilot ? `drop-shadow(0 0 4px ${VibeTheme.colors.accent}88)` : 'none'
                        }}
                    >
                        <VibeIcons name="Sparkles" size={14} />
                    </VibeButton>
                </div>

                <div style={styles.dividerVertical} />

                <VibeButton 
                    variant="primary" 
                    size="sm" 
                    onClick={handleSave} 
                    style={{ borderRadius: '8px', height: '32px', display: 'flex', gap: '8px', padding: '0 16px', fontWeight: 800 }}
                >
                    <VibeIcons name="Save" size={14} />
                    SAVE
                </VibeButton>
            </div>
        </div>
    );
};
