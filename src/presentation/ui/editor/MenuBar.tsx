import React, { useState, useRef } from 'react';
import { VibeIcons, VibeIconName } from '@ui/common/VibeIcons';
import { useEditorStore, useSceneStore } from '@infrastructure/store';
import { useProjectStore } from '@infrastructure/store/useProjectStore';
import { useToastStore } from '@infrastructure/store/toastStore';
import { usePlayModeStore } from '@presentation/features/editor/core';
import { downloadScene, loadSceneFromFile, createDefaultScene, exportToCapacitor, importUniversalScene } from '@presentation/features/editor/serialization';
import { ProjectScanner } from '@infrastructure/services/ProjectScanner';
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

    const { 
        togglePanel, 
        showHierarchy, showConsole, showAssets, showInspector, showScriptEditor, showAICopilot    } = useEditorStore();
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
            catch { addToast('Load failed', 'error'); }
        }
        e.target.value = ''; setOpenMenu(null);
    };

    const handleSave = () => {
        downloadScene(`${sceneName.replace(/\s+/g, '_')}.json`);
        useSceneStore.setState({ isDirty: false });
        addToast('Scene saved', 'success');
    };

    const handleCaptureSnapshot = async () => {
        const url = prompt('Yakalayacağınız projenin URL\'sini girin (örn: http://localhost:5174):', 'http://localhost:5174');
        if (!url) return;

        addToast('📸 Sanal Sahne Yakalanıyor... (5-10 sn sürebilir)', 'info');
        
        try {
            const result = await ProjectScanner.captureScene(url);
            if (result.success && result.data) {
                const sceneData = result.data as { entities: import('@infrastructure/store').EntityData[]; rootEntityIds: number[] };
                useSceneStore.getState().loadScene({
                    sceneName: 'Captured Scene',
                    version: '1.0.0',
                    nextEntityId: sceneData.entities.length > 0 ? Math.max(...sceneData.entities.map(e => e.id)) + 1 : 1,
                    entities: sceneData.entities,
                    rootEntityIds: sceneData.rootEntityIds
                });
                addToast('✅ Sahne başarıyla yakalandı!', 'success');
            } else {
                addToast(`❌ Yakalama başarısız: ${result.error}`, 'error');
            }
        } catch {
            addToast('❌ Beklenmedik hata', 'error');
        }
    };

    const handleImportUniversalScene = () => {
        const jsonInput = prompt('Scene JSON verisini yapıştırın (VibeEngine, MobRunner, Universal Three.js, GLTF):');
        if (!jsonInput) return;

        try {
            const result = importUniversalScene(jsonInput);
            addToast(`✅ ${result.format} formatından ${result.entityCount} entity import edildi!`, 'success');
        } catch {
            addToast('❌ Import başarısız: Geçersiz JSON formatı', 'error');
        }
    };

    const menus: MenuSection[] = [
        {
            label: 'VibeEngine',
            items: [
                { label: t('menu.app_settings'), icon: <VibeIcons name="Settings" size={14} />, shortcut: 'Ctrl+,', action: () => { useEditorStore.getState().setShowAICopilotSettings(true, 'project'); } },
                { label: 'Sanal Sahne Yakala (Snapshot)', icon: <VibeIcons name="Sparkles" size={14} />, action: handleCaptureSnapshot },
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
                { label: 'Import Scene (Universal)', icon: <VibeIcons name="Download" size={14} />, action: handleImportUniversalScene },
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

            {/* LEFT: Menus */}
            <div style={styles.leftSection}>
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
                                            <VibeIcons name={item.icon && React.isValidElement(item.icon) ? ((item.icon.props as { name?: VibeIconName }).name ?? 'Plus') : 'Plus'} size={14} />
                                            <span style={{ marginLeft: '8px' }}>{item.label}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* CENTER: Play Controls */}
            <div style={styles.centerSection}>
                <div style={styles.playbackGroup}>
                    <VibeButton
                        variant={isPlaying && !isPaused ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => isPlaying ? stop() : play()}
                        style={{
                            width: '32px', height: '32px', padding: 0, borderRadius: '50%',
                            background: isPlaying && !isPaused ? '#22c55e' : 'rgba(255,255,255,0.06)',
                        }}
                    >
                        <VibeIcons name={isPlaying ? 'Square' : 'Play'} size={14} />
                    </VibeButton>

                    <VibeButton
                        variant="ghost"
                        size="sm"
                        onClick={() => isPaused ? play() : pause()}
                        disabled={!isPlaying}
                        style={{
                            width: '32px', height: '32px', padding: 0, borderRadius: '50%',
                            background: isPaused ? '#f59e0b22' : 'rgba(255,255,255,0.04)',
                        }}
                    >
                        <VibeIcons name="Pause" size={14} />
                    </VibeButton>

                    <VibeButton
                        variant="ghost"
                        size="sm"
                        disabled={!isPlaying}
                        style={{ width: '24px', height: '24px', padding: 0 }}
                    >
                        <VibeIcons name="ChevronRight" size={12} />
                    </VibeButton>
                </div>
            </div>

            {/* RIGHT: Toggles & Save */}
            <div style={styles.rightSection}>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '10px', border: `1px solid ${VibeTheme.colors.glassBorder}` }}>
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('hierarchy')} 
                        style={{ width: '28px', height: '28px', padding: 0, color: showHierarchy ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary }}
                    >
                        <VibeIcons name="Sidebar" size={14} />
                    </VibeButton>
                    
                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('assets')} 
                        style={{ width: '28px', height: '28px', padding: 0, color: showAssets ? '#34d399' : VibeTheme.colors.textSecondary, transform: 'rotate(90deg)' }}
                    >
                        <VibeIcons name="Grid" size={12} />
                    </VibeButton>

                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('console')} 
                        style={{ width: '28px', height: '28px', padding: 0, color: showConsole ? '#60a5fa' : VibeTheme.colors.textSecondary, transform: 'rotate(90deg)' }}
                    >
                        <VibeIcons name="Terminal" size={12} />
                    </VibeButton>

                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('scriptEditor')} 
                        style={{ width: '28px', height: '28px', padding: 0, color: showScriptEditor ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary, transform: 'rotate(90deg)' }}
                    >
                        <VibeIcons name="Code" size={12} />
                    </VibeButton>

                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('inspector')} 
                        style={{ width: '28px', height: '28px', padding: 0, color: showInspector ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary, transform: 'scaleX(-1)' }}
                    >
                        <VibeIcons name="Sidebar" size={14} />
                    </VibeButton>

                    <VibeButton 
                        variant="ghost" size="sm" onClick={() => togglePanel('aiCopilot')} 
                        style={{ width: '28px', height: '28px', padding: 0, color: showAICopilot ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary }}
                    >
                        <VibeIcons name="Sparkles" size={12} />
                    </VibeButton>
                </div>

                <div style={styles.dividerVertical} />

                <VibeButton 
                    variant="primary" 
                    size="sm" 
                    onClick={handleSave} 
                    style={{ borderRadius: '8px', height: '32px', display: 'flex', gap: '8px', padding: '0 16px', fontWeight: 800, background: VibeTheme.colors.accent }}
                >
                    <VibeIcons name="Save" size={14} />
                    SAVE
                </VibeButton>
            </div>
        </div>
    );
};
