import React, { useState } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useSceneStore, useEditorStore, type AssetData } from '@infrastructure/store';
import { useProjectStore } from '@infrastructure/store/useProjectStore';
import { ProjectScanner } from '@infrastructure/services/ProjectScanner';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeTheme } from '@themes/VibeStyles';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { assetsStyles as styles } from './AssetsPanel.styles';

const AssetItem: React.FC<{ 
    asset: AssetData; 
    onDelete: () => void; 
    onClick?: () => void; 
    onContextMenu: (e: React.MouseEvent) => void;
    isRenaming: boolean;
    onRename: (newName: string) => void;
    onCancelRename: () => void;
    onDrop: (draggedAssetId: string, targetFolderId: string | null) => void;
}> = ({ asset, onDelete, onClick, onContextMenu, isRenaming, onRename, onCancelRename, onDrop }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [tempName, setTempName] = useState(asset.name);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('assetId', asset.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (asset.type !== 'folder') return;
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleLocalDrop = (e: React.DragEvent) => {
        if (asset.type !== 'folder') return;
        e.preventDefault();
        setIsDragOver(false);
        const draggedId = e.dataTransfer.getData('assetId');
        if (draggedId && draggedId !== asset.id) {
            onDrop(draggedId, asset.id);
        }
    };
    const getIcon = () => {
        switch (asset.type) {
            case 'folder': return 'Folder';
            case 'model': return 'Box';
            case 'texture': return 'Layers';
            case 'audio': return 'Activity';
            case 'script': return 'Code';
            default: return 'File';
        }
    };

    const assetItemClass = `vibe-asset-item ${isDragOver ? 'is-drag-over' : ''}`;

    const hoverStyle = `
        .vibe-asset-item {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid ${VibeTheme.colors.border};
            background: ${VibeTheme.colors.bgSubtle};
        }
        .vibe-asset-item:hover {
            background: ${VibeTheme.colors.bgSecondary} !important;
            border-color: ${VibeTheme.colors.accent}bb !important;
            transform: translateY(-4px);
            box-shadow: 0 15px 30px -10px ${VibeTheme.colors.accent}44;
        }
        .vibe-asset-item.is-drag-over {
            border-color: ${VibeTheme.colors.accent} !important;
            background: rgba(99, 102, 241, 0.1) !important;
        }
    `;

    return (
        <div 
            className={assetItemClass}
            style={{
                ...styles.assetItem,
                cursor: 'grab'
            }}
            draggable={!isRenaming}
            onDragStart={handleDragStart}
            onDragEnd={handleDragLeave}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleLocalDrop}
            onContextMenu={onContextMenu}
            onClick={onClick}
        >
            <style dangerouslySetInnerHTML={{ __html: hoverStyle }} />
            <div style={styles.iconWrapper}>
                <VibeIcons 
                    name={getIcon()} 
                    size={20} 
                    style={{ 
                        opacity: 0.8, 
                        color: asset.type === 'folder' ? '#fbbf24' : 
                                asset.type === 'model' ? '#818cf8' : 
                                asset.type === 'texture' ? '#34d399' : 
                                asset.type === 'audio' ? '#f472b6' : '#60a5fa' 
                    }} 
                />
            </div>
            {isRenaming ? (
                <input 
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => onRename(tempName)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onRename(tempName);
                        if (e.key === 'Escape') onCancelRename();
                    }}
                    style={{
                        width: '100%',
                        background: '#fff',
                        color: '#000',
                        fontSize: '10px',
                        border: 'none',
                        borderRadius: '2px',
                        textAlign: 'center',
                        outline: 'none',
                        padding: '2px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span style={styles.assetName}>{asset.name}</span>
            )}
        </div>
    );
};

export const AssetsPanel: React.FC<{ dragHandleProps?: any }> = ({ dragHandleProps }) => {
    const { t } = useTranslation();
    const { assets, removeAsset, setAssets } = useSceneStore();
    const { launchedProject } = useProjectStore();
    const { 
        togglePanel, 
        activePanelId, setActivePanel,
        setScriptFullScreen,
        openFile,
    } = useEditorStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | AssetData['type']>('all');
    const [isScanning, setIsScanning] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; assetId: string } | null>(null);
    const [renamingAssetId, setRenamingAssetId] = useState<string | null>(null);

    const handleScan = async () => {
        if (!launchedProject) return;
        setIsScanning(true);
        try {
            const scanned = await ProjectScanner.scanProjectAssets(launchedProject.path);
            if (scanned && scanned.length >= 0) {
                setAssets(scanned);
                console.log(`Manual scan found ${scanned.length} assets.`);
            }
        } catch (e) {
            console.error('Manual scan failed:', e);
        } finally {
            setIsScanning(false);
        }
    };

    // 🟢 Hierarchy Filter: only show items in current folder + Sort Folders First
    const filteredAssets = assets
        .filter((asset: any) => {
            const assetParentId = (asset.parentId || null) as string | null;
            const inFolder = assetParentId === currentFolderId;
            const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'all' || asset.type === activeFilter;
            return inFolder && matchesSearch && matchesFilter;
        })
        .sort((a: any, b: any) => {
            // Folders always first
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            // Alphabetical for same type
            return a.name.localeCompare(b.name);
        });

    const handleContextMenu = (e: React.MouseEvent, assetId: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, assetId: assetId || 'GLOBAL' });
    };

    const createNewScript = async () => {
        if (!launchedProject) return;
        
        const parentFolder = currentFolderId ? assets.find((a: any) => a.id === currentFolderId) : null;
        let basePath = parentFolder ? parentFolder.path : (launchedProject.path + (launchedProject.hasDomain ? '/src' : ''));
        basePath = basePath.replace(/\\/g, '/');
        
        const scriptName = `NewScript.ts`;
        const scriptPath = `${basePath}/${scriptName}`;
        
        const content = `/**\n * ${scriptName} - VibeEngine Script\n */\n\nexport class NewScript {\n    start() {\n        // Code starts here\n    }\n}\n`;
        
        const result = await ProjectScanner.createFile(scriptPath, content);
        if (result.success) {
            await handleScan();
            // Find newly created script to trigger rename
            setTimeout(() => {
                const newAsset = (window as any).VibeAssets?.find((a: any) => a.path === scriptPath);
                if (newAsset) setRenamingAssetId(newAsset.id);
            }, 300);
        }
    };

    const createNewFolder = async () => {
        if (!launchedProject) return;
        
        const parentFolder = currentFolderId ? assets.find((a: any) => a.id === currentFolderId) : null;
        let basePath = parentFolder ? parentFolder.path : (launchedProject.path + (launchedProject.hasDomain ? '/src' : ''));
        basePath = basePath.replace(/\\/g, '/');
        
        const folderName = `New Folder`;
        const folderPath = `${basePath}/${folderName}`;
        
        const result = await ProjectScanner.createFolder(folderPath);
        if (result.success) {
            await handleScan();
            // Find newly created folder to trigger auto-rename
            setTimeout(() => {
                // handleScan calls setAssets which isn't immediate in state, 
                // but we can search for it in the next render cycle's assets.
                // We'll use a slightly longer delay to be safe or just trigger it via a side effect.
            }, 300);
        } else {
            console.error('Failed to create folder:', result.error);
        }
    };

    const handleRename = async (assetId: string, newName: string) => {
        setRenamingAssetId(null);
        const asset = assets.find((a: any) => a.id === assetId);
        if (!asset || asset.name === newName) return;

        const oldPath = asset.path;
        const newPath = oldPath.replace(asset.name, newName); // Simple replace for demo, usually handle extension/path split

        const result = await ProjectScanner.renameAsset(oldPath, newPath);
        if (result.success) {
            handleScan();
        } else {
            console.error('Rename failed:', result.error);
        }
    };

    const handleDelete = async (assetId: string) => {
        const asset = assets.find((a: any) => a.id === assetId);
        if (!asset) return;

        const result = await ProjectScanner.deleteAsset(asset.path);
        if (result.success) {
            handleScan();
        } else {
            console.error('Delete failed:', result.error);
        }
    };

    const handleMoveAsset = async (draggedId: string, targetId: string | null) => {
        const dragged = assets.find((a: any) => a.id === draggedId);
        const target = targetId ? assets.find((a: any) => a.id === targetId) : null;
        if (!dragged) return;

        const targetPath = target ? target.path : (launchedProject!.path + (launchedProject!.hasDomain ? '/src' : ''));
        const newPath = `${targetPath}/${dragged.name}`;

        if (dragged.path === newPath) return;

        console.log(`🚚 Moving ${dragged.name} to ${newPath}`);
        const result = await ProjectScanner.renameAsset(dragged.path, newPath);
        if (result.success) {
            handleScan();
        } else {
            console.error('Move failed:', result.error);
        }
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
                    else if (asset?.type === 'script') setScriptFullScreen(true);
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

    // 🟢 Breadcrumb logic
    const getBreadcrumbs = () => {
        const path = [];
        let currId = currentFolderId;
        while (currId) {
            const folder = assets.find((a: any) => a.id === currId);
            if (folder) {
                path.unshift(folder);
                currId = folder.parentId || null;
            } else break;
        }
        return path;
    };

    const categories: { id: 'all' | AssetData['type']; label: string; icon: string }[] = [
        { id: 'all', label: 'All', icon: 'Layers' },
        { id: 'folder', label: 'Folders', icon: 'Folder' },
        { id: 'model', label: 'Models', icon: 'Box' },
        { id: 'script', label: 'Scripts', icon: 'Code' },
    ];

    return (
        <div 
            style={styles.panel}
            onClick={() => setActivePanel('assets')}
        >
            <SovereignHeader title={t('panels.assets')} icon="Grid" dragHandleProps={dragHandleProps} />

            <div style={styles.toolbar}>
                <div style={styles.filterGroup}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveFilter(cat.id)}
                            style={{ 
                                background: activeFilter === cat.id ? VibeTheme.colors.accent : VibeTheme.colors.bgSubtle,
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                color: activeFilter === cat.id ? '#fff' : VibeTheme.colors.textSecondary,
                                fontSize: '10px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat.label.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div style={styles.searchRow}>
                    <input 
                        placeholder={t('launcher.search_placeholder') || 'Search...'} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: VibeTheme.colors.bgSecondary,
                            border: `1px solid ${VibeTheme.colors.border}`,
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: VibeTheme.colors.textMain,
                            fontSize: '11px',
                            outline: 'none',
                            width: '100%'
                        }}
                    />
                    <VibeButton 
                        variant="secondary" 
                        size="sm" 
                        style={{ minWidth: '32px', padding: 0 }}
                        onClick={handleScan}
                        disabled={isScanning}
                    >
                        {isScanning ? (
                            <VibeIcons name="Loader" size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <VibeIcons name="RefreshCw" size={14} />
                        )}
                    </VibeButton>
                </div>
            </div>

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
                        handleMoveAsset(draggedId, currentFolderId); // Drop to current view root
                    }
                }}
            >
                <div style={styles.breadcrumb}>
                    <span 
                        style={{ ...styles.breadcrumbItem, color: !currentFolderId ? VibeTheme.colors.textMain : 'inherit' }}
                        onClick={() => setCurrentFolderId(null)}
                    >
                        <VibeIcons name="Home" size={12} /> Root
                    </span>
                    {getBreadcrumbs().map((b: any) => (
                        <React.Fragment key={b.id}>
                            <VibeIcons name="ChevronRight" size={10} style={{ opacity: 0.3 }} />
                            <span 
                                style={{ ...styles.breadcrumbItem, color: b.id === currentFolderId ? VibeTheme.colors.textMain : 'inherit' }}
                                onClick={() => setCurrentFolderId(b.id)}
                            >
                                {b.name}
                            </span>
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {filteredAssets.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={styles.emptyState}
                        >
                            <VibeIcons name="Box" size={32} style={{ opacity: 0.3, color: VibeTheme.colors.textSecondary }} />
                            <p style={{ margin: 0, color: VibeTheme.colors.textSecondary, fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
                                {isScanning ? 'SCANNING...' : 'NO ASSETS FOUND'}
                            </p>
                        </motion.div>
                    ) : (
                        <div style={styles.grid}>
                            {filteredAssets.map((asset: any) => (
                                <AssetItem 
                                    key={asset.id} 
                                    asset={asset} 
                                    onDelete={() => handleDelete(asset.id)}
                                    onClick={async () => {
                                        if (asset.type === 'folder') setCurrentFolderId(asset.id);
                                        else if (asset.type === 'script') {
                                            const result = await ProjectScanner.readFile(asset.path);
                                            if (result.success) {
                                                openFile({ 
                                                    id: asset.id, 
                                                    name: asset.name, 
                                                    path: asset.path, 
                                                    content: result.content 
                                                });
                                                setScriptFullScreen(true);
                                            }
                                        }
                                    }}
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
