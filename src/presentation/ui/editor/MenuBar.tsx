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
        showAICopilot, showScriptEditor 
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

    const transformModes: { mode: EditorMode; icon: string; label: string }[] = [
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

                {/* Transform Tools integrated into MenuBar */}
                <div style={{ display: 'flex', gap: '2px' }}>
                    {transformModes.map((m) => (
                        <VibeButton
                            key={m.mode}
                            variant={editorMode === m.mode ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setEditorMode(m.mode)}
                            style={{ padding: '4px 8px', borderRadius: '4px' }}
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

            {/* RIGHT: Scene Info & Utilities */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <VibeButton variant={showAICopilot ? 'primary' : 'ghost'} size="sm" onClick={() => togglePanel('aiCopilot')}>
                        <VibeIcons name="Bot" size={14} />
                    </VibeButton>
                    <VibeButton variant={showScriptEditor ? 'primary' : 'ghost'} size="sm" onClick={() => togglePanel('scriptEditor')}>
                        <VibeIcons name="Code" size={14} />
                    </VibeButton>
                </div>

                <div style={styles.sceneBadge}>
                    <span style={{ opacity: 0.5 }}>Scene:</span> {sceneName}
                </div>
                
                <VibeButton variant="primary" size="sm" onClick={handleSave} style={{ borderRadius: '6px', height: '28px' }}>
                    SAVE
                </VibeButton>
            </div>
        </div>
    );
};
