/**
 * MenuBar Component (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useRef, useEffect } from 'react';
import { VibeIcons } from '../../presentation/components/VibeIcons';
import { useEditorStore, useSceneStore } from '../stores';
import { downloadScene, loadSceneFromFile, createDefaultScene, exportToHTML } from '../serialization';
import { LocalSceneStorage } from '../storage/LocalSceneStorage';
import { VibeButton } from '../../presentation/atomic/atoms/VibeButton';
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
    const { showGrid, showAxes, toggleGrid, toggleAxes } = useEditorStore();
    const { sceneName, isDirty } = useSceneStore();

    const handleNewScene = () => {
        if (isDirty && !confirm('Unsaved changes will be lost. Continue?')) return;
        createDefaultScene();
    };

    const handleOpen = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try { await loadSceneFromFile(file); } 
            catch (error) { alert('Failed to load scene: ' + error); }
        }
        e.target.value = '';
    };

    const handleSave = () => {
        downloadScene(`${sceneName.replace(/\s+/g, '_')}.json`);
        useSceneStore.setState({ isDirty: false });
    };

    const menus: MenuSection[] = [
        {
            label: 'File',
            items: [
                { label: 'New Scene', icon: <VibeIcons name="Plus" size={14} />, shortcut: 'Ctrl+N', action: handleNewScene },
                { label: 'Open File...', icon: <VibeIcons name="Search" size={14} />, shortcut: 'Ctrl+O', action: handleOpen },
                { divider: true, label: '' },
                { label: 'Save as File', icon: <VibeIcons name="Save" size={14} />, shortcut: 'Ctrl+S', action: handleSave },
                { divider: true, label: '' },
                { label: 'Settings', icon: <VibeIcons name="Settings" size={14} /> },
            ]
        },
        {
            label: 'Edit',
            items: [
                { label: 'Undo', icon: <VibeIcons name="Undo" size={14} />, shortcut: 'Ctrl+Z' },
                { label: 'Redo', icon: <VibeIcons name="Redo" size={14} />, shortcut: 'Ctrl+Y' },
                { divider: true, label: '' },
                { label: 'Copy', icon: <VibeIcons name="Copy" size={14} />, shortcut: 'Ctrl+C' },
                { label: 'Paste', icon: <VibeIcons name="Plus" size={14} />, shortcut: 'Ctrl+V' },
            ]
        },
        {
            label: 'View',
            items: [
                { label: showGrid ? 'Hide Grid' : 'Show Grid', icon: <VibeIcons name="Grid" size={14} />, action: toggleGrid },
                { label: showAxes ? 'Hide Axes' : 'Show Axes', icon: <VibeIcons name="Search" size={14} />, action: toggleAxes },
                { divider: true, label: '' },
                { label: 'Reset Layout', icon: <VibeIcons name="Rotate" size={14} />, action: () => (window as any).resetVibeLayout?.() },
            ]
        },
        {
            label: 'Build',
            items: [
                { label: 'Export as HTML', icon: <VibeIcons name="Save" size={14} />, action: () => exportToHTML(sceneName) },
            ]
        },
    ];

    const handleItemClick = (item: MenuItem) => {
        if (item.action) item.action();
        setOpenMenu(null);
    };

    return (
        <div className="menu-bar" style={styles.container}>
            <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.logoGroup}>
                    <img src="/assets/icon1.png" alt="Vibe" style={{ height: '24px', filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }} />
                    <span style={styles.logoText}>VibeEngine</span>
                </div>

                {menus.map(menu => (
                    <div
                        key={menu.label}
                        style={{ 
                            ...styles.trigger, 
                            ...(openMenu === menu.label ? styles.triggerActive : {}) 
                        }}
                        onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                    >
                        {menu.label}

                        {openMenu === menu.label && (
                            <div style={styles.dropdown}>
                                {menu.items.map((item, idx) => (
                                    item.divider ? (
                                        <div key={idx} style={styles.divider} />
                                    ) : (
                                        <div
                                            key={item.label}
                                            style={{ 
                                                ...styles.menuItem, 
                                                ...(hoveredItem === item.label ? styles.menuItemHover : {}) 
                                            }}
                                            onMouseEnter={() => setHoveredItem(item.label)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                                        >
                                            <span style={{ display: 'flex', opacity: 0.8 }}>{item.icon}</span>
                                            <span>{item.label}</span>
                                            {item.shortcut && <span style={styles.shortcut}>{item.shortcut}</span>}
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={styles.sceneBadge}>
                    <VibeIcons name="Layers" size={14} style={{ color: VibeTheme.colors.accent }} />
                    {sceneName}
                    {isDirty && <span style={{ color: '#fba919' }}>*</span>}
                </div>
                
                <VibeButton variant="primary" size="sm" onClick={handleSave} style={{ borderRadius: '20px' }}>
                    <VibeIcons name="Save" size={14} /> SAVE
                </VibeButton>
            </div>
        </div>
    );
};
