import React from 'react';
import { motion } from 'framer-motion';
import { VibeIcons } from '@ui/common/VibeIcons';
import { VibeTheme } from '@themes/VibeStyles';
import { assetsStyles as styles } from '../AssetsPanel.styles';

interface AssetsEmptyStateProps {
    isScanning: boolean;
}

export const AssetsEmptyState: React.FC<AssetsEmptyStateProps> = ({ isScanning }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={styles.emptyState}
        >
            <VibeIcons name="Box" size={32} style={{ opacity: 0.3, color: VibeTheme.colors.textSecondary }} />
            <p style={{ margin: 0, color: VibeTheme.colors.textSecondary, fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
                {isScanning ? 'SCANNING...' : 'NO ASSETS FOUND'}
            </p>
        </motion.div>
    );
};
