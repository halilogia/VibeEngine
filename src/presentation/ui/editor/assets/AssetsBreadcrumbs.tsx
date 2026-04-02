import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { VibeTheme } from '@themes/VibeStyles';
import { assetsStyles as styles } from '../AssetsPanel.styles';

interface AssetsBreadcrumbsProps {
    currentFolderId: string | null;
    setCurrentFolderId: (id: string | null) => void;
    breadcrumbs: any[];
}

export const AssetsBreadcrumbs: React.FC<AssetsBreadcrumbsProps> = ({
    currentFolderId,
    setCurrentFolderId,
    breadcrumbs
}) => {
    return (
        <div style={styles.breadcrumb}>
            <span 
                style={{ ...styles.breadcrumbItem, color: !currentFolderId ? VibeTheme.colors.textMain : 'inherit' }}
                onClick={() => setCurrentFolderId(null)}
            >
                <VibeIcons name="Home" size={12} /> Root
            </span>
            {breadcrumbs.map((b: any) => (
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
    );
};
