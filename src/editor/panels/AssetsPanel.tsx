import React, { useState, useRef, useCallback } from 'react';
import { VibeIcons, type VibeIconName } from '../../presentation/components/VibeIcons';

import { useAssetManager, type AssetEntry } from '../assets';
import { useSceneStore, useEditorStore } from '../stores';
import { ContextMenu, type ContextMenuItem } from '../components/ContextMenu';
import './AssetsPanel.css';


interface SearchHighlightProps {
    text: string;
    search: string;
}

const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, search }) => {
    if (!search || !text.toLowerCase().includes(search.toLowerCase())) {
        return <span>{text}</span>;
    }

    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === search.toLowerCase() ? (
                    <mark key={i} className="search-highlight">{part}</mark>
                ) : (
                    part
                )
            )}
        </span>
    );
};

type AssetType = 'folder' | 'model' | 'texture' | 'audio' | 'script' | 'other';

const getIcon = (type: AssetType) => {
    switch (type) {
        case 'folder': return <VibeIcons name="Folder" size={20} />;
        case 'model': return <VibeIcons name="Box" size={20} />;
        case 'texture': return <VibeIcons name="Image" size={20} />;
        case 'audio': return <VibeIcons name="Music" size={20} />;
        case 'script': return <VibeIcons name="Code" size={20} />;
        default: return <VibeIcons name="File" size={20} />;
    }
};


const getAssetType = (filename: string): AssetType => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'glb':
        case 'gltf':
            return 'model';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'webp':
            return 'texture';
        case 'mp3':
        case 'wav':
        case 'ogg':
            return 'audio';
        case 'ts':
        case 'js':
            return 'script';
        default:
            return 'other';
    }
};

export const AssetsPanel: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
    const [activeTab, setActiveTab] = useState<'project' | 'library'>('project');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { assets, libraryAssets, loading, importModel, importTexture, removeAsset } = useAssetManager();
    const { addEntity, addComponent } = useSceneStore();
    const { 
        selectEntity, 
        activePanelId, setActivePanel 
    } = useEditorStore();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; asset: AssetEntry } | null>(null);

    // Convert Map to array based on active tab
    const assetList = Array.from(activeTab === 'project' ? assets.values() : libraryAssets.values());
 
    const filteredAssets = assetList.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || a.type === filterType;
        return matchesSearch && matchesType;
    });


    // Double-click to add asset to scene
    const addAssetToScene = useCallback((asset: AssetEntry) => {
        const baseName = asset.name.replace(/\.[^/.]+$/, '');
        const entityId = addEntity(baseName, null);

        // Add Render component based on asset type
        if (asset.type === 'model') {
            addComponent(entityId, {
                type: 'Render',
                data: {
                    meshType: 'cube',
                    color: '#6366f1',
                    modelPath: asset.url
                },
                enabled: true
            });
        }

        selectEntity(entityId);
        console.log(`✅ Added ${asset.name} to scene as entity #${entityId}`);
    }, [addEntity, addComponent, selectEntity]);

    const handleImport = useCallback(async (files: FileList) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const type = getAssetType(file.name);

            if (type === 'model') {
                await importModel(file);
            } else if (type === 'texture') {
                await importTexture(file);
            }
        }
    }, [importModel, importTexture]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files.length > 0) {
            handleImport(e.dataTransfer.files);
        }
    }, [handleImport]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleImport(e.target.files);
        }
        e.target.value = '';
    }, [handleImport]);

    const handleContextMenu = (e: React.MouseEvent, asset: AssetEntry) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, asset });
    };

    const contextMenuItems: ContextMenuItem[] = contextMenu ? [
        { 
            label: 'Add to Scene', 
            icon: <VibeIcons name="Plus" size={12} />, 
            onClick: () => addAssetToScene(contextMenu.asset) 
        },
        { 
            label: 'Copy URL', 
            icon: <VibeIcons name="Copy" size={12} />, 
            onClick: () => {
                navigator.clipboard.writeText(contextMenu.asset.url);
                console.log('📋 Asset URL copied to clipboard');
            } 
        },
        { divider: true, label: '' },
        { 
            label: 'Delete Asset', 
            icon: <VibeIcons name="Trash" size={12} />, 
            danger: true, 
            onClick: () => removeAsset(contextMenu.asset.id) 
        },

    ] : [];

    return (
        <div
            className={`editor-panel assets-panel glass-panel ${isDragging ? 'dragging' : ''} ${activePanelId === 'assets' ? 'active-panel' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => setActivePanel('assets')}
        >
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".glb,.gltf,.png,.jpg,.jpeg,.webp"
                style={{ display: 'none' }}
                onChange={handleFileInput}
            />

            <div className="editor-panel-header">
                <div className="assets-tabs">
                    <button 
                        className={`assets-tab ${activeTab === 'project' ? 'active' : ''}`}
                        onClick={() => setActiveTab('project')}
                    >
                        Project
                    </button>
                    <button 
                        className={`assets-tab ${activeTab === 'library' ? 'active' : ''}`}
                        onClick={() => setActiveTab('library')}
                    >
                        Library <span className="library-badge">Kenney</span>
                    </button>
                </div>
                <div className="panel-actions">

                    <button
                        className={`panel-action-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        <VibeIcons name="Grid" size={14} />
                    </button>
                    <button
                        className={`panel-action-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        <VibeIcons name="List" size={14} />
                    </button>

                </div>
            </div>

            <div className="assets-toolbar">
                <div className="assets-filter-chips">
                    <button 
                        className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
                        data-type="all"
                        onClick={() => setFilterType('all')}
                    >All</button>
                    <button 
                        className={`filter-chip ${filterType === 'model' ? 'active' : ''}`}
                        data-type="model"
                        onClick={() => setFilterType('model')}
                    >Models</button>
                    <button 
                        className={`filter-chip ${filterType === 'texture' ? 'active' : ''}`}
                        data-type="texture"
                        onClick={() => setFilterType('texture')}
                    >Textures</button>
                    <button 
                        className={`filter-chip ${filterType === 'script' ? 'active' : ''}`}
                        data-type="script"
                        onClick={() => setFilterType('script')}
                    >Scripts</button>
                    <button 
                        className={`filter-chip ${filterType === 'audio' ? 'active' : ''}`}
                        data-type="audio"
                        onClick={() => setFilterType('audio')}
                    >Audio</button>
                </div>
                <div className="assets-search-row">
                    <div className="assets-search">
                        <VibeIcons name="Search" size={14} />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className="panel-action-btn"
                        title="Import Files"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <VibeIcons name="Upload" size={14} />
                    </button>

                </div>
            </div>

            {/* Drop zone overlay */}
            {isDragging && (
                <div className="drop-zone-overlay">
                    <VibeIcons name="Upload" size={48} />
                    <span>Drop files to import</span>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="loading-indicator">
                    <VibeIcons name="Loader" size={20} className="spin" />
                    <span>Importing...</span>
                </div>
            )}


            <div className={`assets-content ${viewMode}`}>
                {filteredAssets.length === 0 ? (
                    <div className="assets-empty-state">
                        <div className="empty-state-icon">
                            <VibeIcons name="Upload" size={40} />
                            <VibeIcons name="Box" size={20} className="floating-icon" />
                        </div>
                        <h3>{activeTab === 'project' ? 'No project assets' : 'No library assets'}</h3>
                        <p>{activeTab === 'project' 
                            ? 'Drag & drop models, textures, or audio files here to start building your world.' 
                            : 'Wait for the library to initialize or check your connection.'}
                        </p>
                        {activeTab === 'project' && (
                            <button 
                                className="editor-btn primary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <VibeIcons name="Upload" size={14} /> Import Assets
                            </button>
                        )}
                    </div>

                ) : (
                    filteredAssets.map((asset) => (
                        <div
                            key={asset.id}
                            className="asset-item"
                            onDoubleClick={() => addAssetToScene(asset)}
                            onContextMenu={(e) => handleContextMenu(e, asset)}
                            title="Double-click to add to scene"
                        >
                            <div className={`asset-icon ${asset.type}`}>
                                {asset.thumbnail ? (
                                    <img src={asset.thumbnail} alt={asset.name} />
                                ) : (
                                    getIcon(asset.type as AssetType)
                                )}
                            </div>
                            <span className="asset-name">
                                <SearchHighlight text={asset.name} search={searchQuery} />
                            </span>
                            <button
                                className="asset-delete"
                                onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                                title="Delete"
                            >
                                <VibeIcons name="Trash" size={12} />
                            </button>
                        </div>

                    ))
                )}
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
