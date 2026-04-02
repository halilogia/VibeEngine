import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';
import { type AssetData } from '@infrastructure/store';
import { assetsStyles as styles } from '../AssetsPanel.styles';

interface AssetsToolbarProps {
    activeFilter: 'all' | AssetData['type'];
    setActiveFilter: (filter: 'all' | AssetData['type']) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleScan: () => void;
    isScanning: boolean;
    t: (key: string) => string;
}

export const AssetsToolbar: React.FC<AssetsToolbarProps> = ({
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    handleScan,
    isScanning,
    t
}) => {
    const categories: { id: 'all' | AssetData['type']; label: string; icon: string }[] = [
        { id: 'all', label: 'All', icon: 'Layers' },
        { id: 'folder', label: 'Folders', icon: 'Folder' },
        { id: 'model', label: 'Models', icon: 'Box' },
        { id: 'script', label: 'Scripts', icon: 'Code' },
    ];

    return (
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
    );
};
