/**
 * MenuBar Component v2 - With Save/Load functionality
 */

import React, { useState, useRef } from 'react';
import {
    Save, FolderOpen, FilePlus, Settings, Download,
    Undo, Redo, Copy, Clipboard, Trash2,
    Grid3X3, Axis3D, Package
} from 'lucide-react';
import { useEditorStore, useSceneStore } from '../stores';
import { downloadScene, loadSceneFromFile, createDefaultScene, exportToHTML } from '../serialization';
import './MenuBar.css';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showGrid, showAxes, toggleGrid, toggleAxes } = useEditorStore();
    const { sceneName, isDirty } = useSceneStore();

    const handleNewScene = () => {
        if (isDirty) {
            if (!confirm('Unsaved changes will be lost. Continue?')) return;
        }
        createDefaultScene();
    };

    const handleOpen = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await loadSceneFromFile(file);
            } catch (error) {
                alert('Failed to load scene: ' + error);
            }
        }
        e.target.value = '';
    };

    const handleSave = () => {
        downloadScene(`${sceneName.replace(/\s+/g, '_')}.json`);
        useSceneStore.setState({ isDirty: false });
    };

    const loadSampleScene = async (scenePath: string) => {
        try {
            const response = await fetch(scenePath);
            const sceneData = await response.json();
            useSceneStore.getState().loadScene(sceneData);
        } catch (error) {
            console.error('Failed to load sample scene:', error);
            alert('Failed to load sample scene');
        }
    };

    const menus: MenuSection[] = [
        {
            label: 'File',
            items: [
                { label: 'New Scene', icon: <FilePlus size={14} />, shortcut: 'Ctrl+N', action: handleNewScene },
                { label: 'Open...', icon: <FolderOpen size={14} />, shortcut: 'Ctrl+O', action: handleOpen },
                { divider: true, label: '' },
                { label: '📂 Open MobRunner Project', action: () => loadSampleScene('/projects/MobRunner/Scenes/main.scene.json') },
                { divider: true, label: '' },
                { label: 'Save', icon: <Download size={14} />, shortcut: 'Ctrl+S', action: handleSave },
                { divider: true, label: '' },
                { label: 'Settings', icon: <Settings size={14} /> },
            ]
        },
        {
            label: 'Edit',
            items: [
                { label: 'Undo', icon: <Undo size={14} />, shortcut: 'Ctrl+Z' },
                { label: 'Redo', icon: <Redo size={14} />, shortcut: 'Ctrl+Y' },
                { divider: true, label: '' },
                { label: 'Copy', icon: <Copy size={14} />, shortcut: 'Ctrl+C' },
                { label: 'Paste', icon: <Clipboard size={14} />, shortcut: 'Ctrl+V' },
                { label: 'Delete', icon: <Trash2 size={14} />, shortcut: 'Del' },
            ]
        },
        {
            label: 'View',
            items: [
                { label: showGrid ? 'Hide Grid' : 'Show Grid', icon: <Grid3X3 size={14} />, action: toggleGrid },
                { label: showAxes ? 'Hide Axes' : 'Show Axes', icon: <Axis3D size={14} />, action: toggleAxes },
            ]
        },
        {
            label: 'Build',
            items: [
                { label: 'Export as HTML', icon: <Package size={14} />, action: () => exportToHTML(sceneName) },
            ]
        },
    ];

    const handleMenuClick = (label: string) => {
        setOpenMenu(openMenu === label ? null : label);
    };

    const handleItemClick = (item: MenuItem) => {
        if (item.action) {
            item.action();
        }
        setOpenMenu(null);
    };

    return (
        <div className="menu-bar">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <div className="menu-bar-left">
                <div className="menu-logo">🌊 VibeEngine</div>

                {menus.map(menu => (
                    <div
                        key={menu.label}
                        className="menu-trigger"
                        onClick={() => handleMenuClick(menu.label)}
                    >
                        {menu.label}

                        {openMenu === menu.label && (
                            <div className="menu-dropdown">
                                {menu.items.map((item, idx) => (
                                    item.divider ? (
                                        <div key={idx} className="menu-divider" />
                                    ) : (
                                        <div
                                            key={item.label}
                                            className="menu-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleItemClick(item);
                                            }}
                                        >
                                            <span className="menu-item-icon">{item.icon}</span>
                                            <span className="menu-item-label">{item.label}</span>
                                            {item.shortcut && (
                                                <span className="menu-item-shortcut">{item.shortcut}</span>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="menu-bar-center">
                <span className="scene-name">
                    {sceneName}
                    {isDirty && <span className="dirty-indicator">*</span>}
                </span>
            </div>

            <div className="menu-bar-right">
                {/* Quick save button */}
                <button className="menu-bar-btn" onClick={handleSave} title="Save Scene">
                    <Save size={16} />
                </button>
            </div>
        </div>
    );
};
