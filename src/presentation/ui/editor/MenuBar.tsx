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
import { downloadScene, loadSceneFromFile, createDefaultScene, exportToCapacitor } from '@presentation/features/editor/serialization';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';
import { useTranslation } from 'react-i18next';
import { menuBarStyles as styles } from './MenuBar.styles';

interface MenuItem {
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    action?: () => void;
    divider?: boolean;
    variant?: 'primary';
}

interface MenuSection {
    label: string;
    items: MenuItem[];
}

export const MenuBar: React.FC = () => {
    const { t } = useTranslation();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Stores
    const { 
        togglePanel, 
        showAICopilot, showHierarchy, showConsole, showAssets, showInspector, showScriptEditor,
        showAICopilotSettings, setShowAICopilotSettings
    } = useEditorStore();
    const { sceneName } = useSceneStore();
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
            label: 'VibeEngine',
            items: [
                { label: t('menu.app_settings'), icon: <VibeIcons name="Settings" size={14} />, shortcut: 'Ctrl+,', action: () => { useEditorStore.getState().setShowAICopilotSettings(true, 'project'); } },
                { divider: true, label: '' },
                { label: t('menu.quit'), icon: <VibeIcons name="Pause" size={14} />, action: () => { addToast('Closing Engine Studio...', 'warning'); setTimeout(() => window.close(), 1000); } },
            ]
        },
        {
            label: t('menu.file'),
            items: [
                { label: t('menu.manage_projects'), icon: <VibeIcons name="Layers" size={14} />, shortcut: 'Ctrl+L', action: handleOpenLauncher },
                { divider: true, label: '' },
                { label: t('menu.new_scene'), icon: <VibeIcons name="Plus" size={14} />, action: () => { createDefaultScene(); addToast('New Scene', 'info'); } },
                { label: t('menu.open_scene'), icon: <VibeIcons name="Search" size={14} />, action: handleOpen },
                { label: t('menu.save_scene'), icon: <VibeIcons name="Save" size={14} />, action: handleSave },
                { divider: true, label: '' },
            ]
        },
        {
            label: t('menu.build'),
            items: [
                { label: 'Export for Capacitor', icon: <VibeIcons name="Layers" size={14} />, action: () => exportToCapacitor(sceneName) },
            ]
        }
    ];

    return (
        <div className="unified-header" style={styles.container}>
            <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />

            {/* LEFT: Menu & Transform Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            </div>

            <div style={styles.playbackGroup} />

            {/* RIGHT: Layout & Utilities */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.dividerVertical} />

                {/* 🟢 Layout Toggle Suite (The only control box) */}
                <div style={{ display: 'flex', gap: '6px', background: VibeTheme.colors.glassBg, padding: '2px', borderRadius: '10px', border: `1px solid ${VibeTheme.colors.glassBorder}`, marginLeft: '12px' }}>
                    {/* Left: Hierarchy */}
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('hierarchy')} 
                        style={{ 
                            width: '32px', height: '32px', padding: 0, 
                            color: showHierarchy ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary,
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
                            color: showAssets ? '#34d399' : VibeTheme.colors.textSecondary,
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
                            color: showConsole ? '#60a5fa' : VibeTheme.colors.textSecondary,
                            filter: showConsole ? `drop-shadow(0 0 4px #60a5fa88)` : 'none',
                            transform: 'rotate(90deg)'
                        }}
                    >
                        <VibeIcons name="Terminal" size={14} />
                    </VibeButton>

                    {/* Bottom C: Scripts */}
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('scriptEditor')} 
                        style={{ 
                            width: '32px', height: '32px', padding: 0, 
                            color: showScriptEditor ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary,
                            filter: showScriptEditor ? `drop-shadow(0 0 4px ${VibeTheme.colors.accent}88)` : 'none',
                            transform: 'rotate(90deg)'
                        }}
                    >
                        <VibeIcons name="Code" size={14} />
                    </VibeButton>

                    {/* Right A: Inspector */}
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('inspector')} 
                        style={{ 
                            width: '32px', height: '32px', padding: 0, 
                            color: showInspector ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary,
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
                            color: showAICopilot ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary,
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
