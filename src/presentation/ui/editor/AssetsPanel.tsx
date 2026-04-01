/**
 * AssetsPanel - Resource manager (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useSceneStore, useEditorStore, type AssetData } from '@infrastructure/store';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeTheme } from '@themes/VibeStyles';
import { assetsStyles as styles } from './AssetsPanel.styles';

// #region Components
interface AssetItemProps {
    asset: AssetData;
    onDelete: () => void;
    onClick?: () => void;
}

const AssetItem: React.FC<AssetItemProps> = ({ asset, onDelete, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getIcon = () => {
        switch (asset.type) {
            case 'model': return 'Box';
            case 'texture': return 'Layers';
            case 'audio': return 'Activity';
            case 'script': return 'Code';
            default: return 'Search';
        }
    };

    return (
        <div 
            style={{ ...styles.assetItem, ...(isHovered ? styles.assetItemHover : {}) }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div style={styles.iconWrapper}>
                <VibeIcons 
                    name={getIcon()} 
                    size={24} 
                    style={{ 
                        opacity: 0.8, 
                        color: asset.type === 'model' ? '#818cf8' : 
                               asset.type === 'texture' ? '#34d399' : 
                               asset.type === 'audio' ? '#f472b6' : '#60a5fa' 
                    }} 
                />
            </div>
            <span style={styles.assetName}>{asset.name}</span>
            {isHovered && (
                <VibeButton 
                    variant="danger" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', padding: 0, borderRadius: '50%' }}
                >
                    <VibeIcons name="Trash" size={10} />
                </VibeButton>
            )}
        </div>
    );
};
// #endregion

interface AssetsPanelProps {
    dragHandleProps?: any;
}

export const AssetsPanel: React.FC<AssetsPanelProps> = ({ dragHandleProps }) => {
    const { assets, removeAsset } = useSceneStore();
    const { 
        editorMode, setEditorMode, togglePanel, 
        showAICopilot, showScriptEditor, showHierarchy, showConsole, showAssets, showInspector 
    } = useEditorStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | AssetData['type']>('all');

    const filteredAssets = assets.filter((asset: AssetData) => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || asset.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const categories: { id: 'all' | AssetData['type']; label: string; icon: string }[] = [
        { id: 'all', label: 'All', icon: 'Layers' },
        { id: 'model', label: 'Models', icon: 'Box' },
        { id: 'texture', label: 'Textures', icon: 'Layers' },
        { id: 'script', label: 'Scripts', icon: 'Code' },
        { id: 'audio', label: 'Audio', icon: 'Activity' },
    ];

    return (
        <div 
            className={`editor-panel assets-panel ${activePanelId === 'assets' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('assets')}
            style={styles.panel}
        >
            <SovereignHeader title="ASSETS" icon="Grid" dragHandleProps={dragHandleProps} />

            <div style={styles.toolbar}>
                <div style={styles.filterGroup}>
                    {categories.map((cat) => (
                        <VibeButton
                            key={cat.id}
                            variant={activeFilter === cat.id ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setActiveFilter(cat.id)}
                            style={{ borderRadius: '20px', fontSize: '10px', height: '26px' }}
                        >
                             {cat.label}
                        </VibeButton>
                    ))}
                </div>

                <div style={styles.searchRow}>
                    <VibeInput 
                        placeholder="Search assets..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <VibeButton variant="secondary" size="md">
                        <VibeIcons name="Plus" size={14} /> IMPORT
                    </VibeButton>
                </div>
            </div>

            <div style={styles.content}>
                {filteredAssets.length === 0 ? (
                    <div style={styles.emptyState}>
                        <VibeIcons name="Box" size={48} style={{ opacity: 0.1, color: VibeTheme.colors.accent }} />
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>NO ASSETS FOUND</h3>
                        <p style={{ margin: 0, color: VibeTheme.colors.textSecondary, fontSize: '12px', maxWidth: '240px', lineHeight: 1.5 }}>
                            Import resources or create new ones to build your scene library.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {filteredAssets.map((asset: AssetData) => (
                            <AssetItem 
                                key={asset.id} 
                                asset={asset} 
                                onDelete={() => removeAsset(asset.id)}
                                onClick={() => {
                                    // 🟢 Open Script Editor on TS/TSX asset click
                                    if (asset.type === 'script' || asset.name.endsWith('.ts') || asset.name.endsWith('.tsx')) {
                                        togglePanel('scriptEditor');
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
