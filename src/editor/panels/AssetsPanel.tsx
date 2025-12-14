/**
 * AssetsPanel v2 - Asset browser with drag-drop import
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    Folder, File, Image, Box, Music, Code,
    Grid, List, Upload, FolderPlus, Search, Trash2, Loader
} from 'lucide-react';
import { useAssetManager, type AssetEntry } from '../assets';
import './AssetsPanel.css';

type AssetType = 'folder' | 'model' | 'texture' | 'audio' | 'script' | 'other';

const getIcon = (type: AssetType) => {
    switch (type) {
        case 'folder': return <Folder size={20} />;
        case 'model': return <Box size={20} />;
        case 'texture': return <Image size={20} />;
        case 'audio': return <Music size={20} />;
        case 'script': return <Code size={20} />;
        default: return <File size={20} />;
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
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { assets, loading, importModel, importTexture, removeAsset } = useAssetManager();

    // Convert Map to array
    const assetList = Array.from(assets.values());

    const filteredAssets = assetList.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <div
            className={`editor-panel assets-panel ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
                <span>Assets</span>
                <div className="panel-actions">
                    <button
                        className={`panel-action-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        <Grid size={14} />
                    </button>
                    <button
                        className={`panel-action-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        <List size={14} />
                    </button>
                </div>
            </div>

            <div className="assets-toolbar">
                <div className="assets-search">
                    <Search size={14} />
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
                    <Upload size={14} />
                </button>
            </div>

            {/* Drop zone overlay */}
            {isDragging && (
                <div className="drop-zone-overlay">
                    <Upload size={48} />
                    <span>Drop files to import</span>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="loading-indicator">
                    <Loader size={20} className="spin" />
                    <span>Importing...</span>
                </div>
            )}

            <div className={`assets-content ${viewMode}`}>
                {filteredAssets.length === 0 ? (
                    <div className="empty-assets">
                        <Upload size={32} />
                        <span>Drag & drop files here</span>
                        <span className="hint">or click Import button</span>
                    </div>
                ) : (
                    filteredAssets.map((asset) => (
                        <div key={asset.id} className="asset-item">
                            <div className={`asset-icon ${asset.type}`}>
                                {asset.thumbnail ? (
                                    <img src={asset.thumbnail} alt={asset.name} />
                                ) : (
                                    getIcon(asset.type as AssetType)
                                )}
                            </div>
                            <span className="asset-name">{asset.name}</span>
                            <button
                                className="asset-delete"
                                onClick={() => removeAsset(asset.id)}
                                title="Delete"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
