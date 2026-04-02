import React, { useState } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { type AssetData } from '@infrastructure/store';
import { VibeTheme } from '@themes/VibeStyles';
import { assetsStyles as styles } from '../AssetsPanel.styles';

export const AssetItem: React.FC<{ 
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
