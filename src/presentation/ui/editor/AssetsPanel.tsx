import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { VibeIcons } from '@ui/common/VibeIcons';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { assetsStyles as styles } from './AssetsPanel.styles';

// Sub-components
import { AssetItem } from './assets/AssetItem';
import { AssetsToolbar } from './assets/AssetsToolbar';
import { AssetsBreadcrumbs } from './assets/AssetsBreadcrumbs';
import { AssetsEmptyState } from './assets/AssetsEmptyState';
import { useAssetsPanelLogic } from './assets/useAssetsPanelLogic';

export const AssetsPanel: React.FC<{ dragHandleProps?: any }> = ({ dragHandleProps }) => {
    const { t } = useTranslation();
    const {
        assets,
        filteredAssets,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        isScanning,
        handleScan,
        currentFolderId,
        setCurrentFolderId,
        contextMenu,
        setContextMenu,
        renamingAssetId,
        setRenamingAssetId,
        createNewScript,
        createNewFolder,
        handleRename,
        handleDelete,
        handleMoveAsset,
        handleAssetClick,
        getBreadcrumbs,
        setActivePanel,
    } = useAssetsPanelLogic();

    const handleContextMenu = (e: React.MouseEvent, assetId: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, assetId: assetId || 'GLOBAL' });
    };

    const contextMenuItems: ContextMenuItem[] = contextMenu ? (
        contextMenu.assetId === 'GLOBAL' ? [
            { 
                label: 'New Folder', 
                icon: <VibeIcons name="Folder" size={12} />, 
                onClick: createNewFolder
            },
            { 
                label: 'New Script', 
                icon: <VibeIcons name="Code" size={12} />, 
                onClick: createNewScript
            },
            { divider: true, label: '' },
            { 
                label: 'Refresh Library', 
                icon: <VibeIcons name="RefreshCw" size={12} />, 
                onClick: handleScan 
            },
        ] : [
            { 
                label: 'Open / Select', 
                icon: <VibeIcons name="Maximize" size={12} />, 
                onClick: () => {
                    const asset = assets.find((a: any) => a.id === contextMenu.assetId);
                    if (asset?.type === 'folder') setCurrentFolderId(asset.id);
                    else if (asset?.type === 'script') {
                        // handleAssetClick is used for clicking, 
                        // but here we can just reuse the same logic
                        handleAssetClick(asset);
                    }
                }
            },
            { 
                label: 'Duplicate', 
                icon: <VibeIcons name="Copy" size={12} />, 
                onClick: () => console.log('Duplicate asset', contextMenu.assetId)
            },
            { 
                label: 'Rename', 
                icon: <VibeIcons name="Sparkles" size={12} />, 
                onClick: () => setRenamingAssetId(contextMenu.assetId!)
            },
            { divider: true, label: '' },
            { 
                label: 'Delete', 
                icon: <VibeIcons name="Trash" size={12} />, 
                danger: true, 
                onClick: () => handleDelete(contextMenu.assetId) 
            },
        ]
    ) : [];

    return (
        <div 
            style={styles.panel}
            onClick={() => setActivePanel('assets')}
        >
            <SovereignHeader title={t('panels.assets')} icon="Grid" dragHandleProps={dragHandleProps} />

            <AssetsToolbar 
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleScan={handleScan}
                isScanning={isScanning}
                t={t}
            />

            <div 
                style={{ ...styles.content, cursor: 'default' }}
                onContextMenu={(e) => handleContextMenu(e, null)}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData('assetId');
                    if (draggedId) {
                        handleMoveAsset(draggedId, currentFolderId);
                    }
                }}
            >
                <AssetsBreadcrumbs 
                    currentFolderId={currentFolderId}
                    setCurrentFolderId={setCurrentFolderId}
                    breadcrumbs={getBreadcrumbs()}
                />

                <AnimatePresence mode="wait">
                    {filteredAssets.length === 0 ? (
                        <AssetsEmptyState isScanning={isScanning} />
                    ) : (
                        <div style={styles.grid}>
                            {filteredAssets.map((asset: any) => (
                                <AssetItem 
                                    key={asset.id} 
                                    asset={asset} 
                                    onDelete={() => handleDelete(asset.id)}
                                    onClick={() => handleAssetClick(asset)}
                                    onContextMenu={(e) => handleContextMenu(e, asset.id)}
                                    isRenaming={renamingAssetId === asset.id}
                                    onRename={(newName) => handleRename(asset.id, newName)}
                                    onCancelRename={() => setRenamingAssetId(null)}
                                    onDrop={handleMoveAsset}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {contextMenu && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    items={contextMenuItems} 
                    onClose={() => setContextMenu(null)} 
                />
            )}
        </div>
    );
};
