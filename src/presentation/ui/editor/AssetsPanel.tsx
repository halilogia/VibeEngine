import React, { useState } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useSceneStore, useEditorStore, type AssetData } from '@infrastructure/store';
import { useProjectStore } from '@infrastructure/store/useProjectStore';
import { ProjectScanner } from '@infrastructure/services/ProjectScanner';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeTheme } from '@themes/VibeStyles';
import { assetsStyles as styles } from './AssetsPanel.styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AssetItem: React.FC<{ asset: AssetData; onDelete: () => void; onClick?: () => void }> = ({ asset, onDelete, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
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

    return (
        <motion.div 
            whileHover="hover"
            initial="initial"
            variants={{
                initial: { y: 0, backgroundColor: 'transparent', boxShadow: 'none' },
                hover: { y: -4, backgroundColor: 'rgba(255, 255, 255, 0.08)', boxShadow: `0 10px 20px -5px ${VibeTheme.colors.accent}44` }
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={styles.assetItem}
            onClick={onClick}
        >
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
            <span style={styles.assetName}>{asset.name}</span>
            <motion.button 
                variants={{
                    initial: { opacity: 0, scale: 0.8 },
                    hover: { opacity: 1, scale: 1 }
                }}
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                style={{ 
                    position: 'absolute', top: '8px', right: '8px', 
                    background: 'rgba(239, 68, 68, 0.2)', border: 'none', 
                    color: '#f87171', borderRadius: '6px', padding: '4px', cursor: 'pointer' 
                }}
            >
                <VibeIcons name="Trash" size={10} />
            </motion.button>
        </motion.div>
    );
};

export const AssetsPanel: React.FC<{ dragHandleProps?: any }> = ({ dragHandleProps }) => {
    const { t } = useTranslation();
    const { assets, removeAsset, setAssets } = useSceneStore();
    const { launchedProject } = useProjectStore();
    const { 
        togglePanel, 
        activePanelId, setActivePanel 
    } = useEditorStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | AssetData['type']>('all');
    const [isScanning, setIsScanning] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    const handleScan = async () => {
        if (!launchedProject) return;
        setIsScanning(true);
        try {
            const scanned = await ProjectScanner.scanProjectAssets(launchedProject.path);
            setAssets(scanned);
            console.log(`Manual scan found ${scanned.length} assets.`);
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

    console.log(`[VibeAssets] Rendering ${filteredAssets.length} assets at folder: ${currentFolderId || 'Root'}`);

    // 🟢 Breadcrumb logic
    const getBreadcrumbs = () => {
        const path = [];
        let currId = currentFolderId;
        while (currId) {
            const folder = assets.find((a: any) => a.id === currId);
            if (folder) {
                path.unshift(folder);
                currId = folder.parentId;
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
                                background: activeFilter === cat.id ? 'var(--vibe-accent)' : 'rgba(255,255,255,0.03)',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                color: activeFilter === cat.id ? '#fff' : 'rgba(255,255,255,0.4)',
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
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: '#fff',
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
                            <VibeIcons name="Plus" size={14} />
                        )}
                    </VibeButton>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.breadcrumb}>
                    <span 
                        style={{ ...styles.breadcrumbItem, color: !currentFolderId ? '#fff' : 'inherit' }}
                        onClick={() => setCurrentFolderId(null)}
                    >
                        <VibeIcons name="Home" size={12} /> Root
                    </span>
                    {getBreadcrumbs().map((b: any) => (
                        <React.Fragment key={b.id}>
                            <VibeIcons name="ChevronRight" size={10} style={{ opacity: 0.3 }} />
                            <span 
                                style={{ ...styles.breadcrumbItem, color: b.id === currentFolderId ? '#fff' : 'inherit' }}
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
                            <VibeIcons name="Box" size={32} style={{ opacity: 0.1, color: 'var(--vibe-accent)' }} />
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
                                {isScanning ? 'SCANNING...' : 'NO ASSETS FOUND'}
                            </p>
                        </motion.div>
                    ) : (
                        <div style={styles.grid}>
                            {filteredAssets.map((asset: any) => (
                                <AssetItem 
                                    key={asset.id} 
                                    asset={asset} 
                                    onDelete={() => removeAsset(asset.id)}
                                    onClick={() => {
                                        if (asset.type === 'folder') setCurrentFolderId(asset.id);
                                        else if (asset.type === 'script') togglePanel('scriptEditor');
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
