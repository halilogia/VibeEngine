import React from 'react';
import { motion } from 'framer-motion';
import { SettingsGroup, SettingsGrid, SettingsField, SettingsInput, SettingsToggle } from '../SettingsComponents';
import { VibeTheme } from '@themes/VibeStyles';
import { useEditorStore } from '@infrastructure/store';

export const InputSettingsTab: React.FC = () => {
    const { engineConfig, updateEngineConfig } = useEditorStore();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
        >
            <SettingsGroup title="Mouse & Viewport">
                <SettingsGrid>
                    <SettingsField label="Camera Sensitivity">
                        <SettingsInput 
                            type="number" step="0.01" 
                            value={engineConfig.cameraSensitivity}
                            onChange={(e) => updateEngineConfig({ cameraSensitivity: parseFloat(e.target.value) || 0 })}
                        />
                    </SettingsField>
                    <SettingsField label="Interaction Margin">
                        <SettingsInput 
                            type="number" 
                            value={engineConfig.interactionMargin}
                            onChange={(e) => updateEngineConfig({ interactionMargin: parseInt(e.target.value) || 0 })}
                        />
                    </SettingsField>
                </SettingsGrid>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '3rem' }}>
                    <SettingsToggle 
                        label="Invert Zoom Direction" 
                        checked={engineConfig.invertY} 
                        onChange={(v) => updateEngineConfig({ invertY: v })} 
                    />
                    <SettingsToggle 
                        label="Enable Smart Snapping" 
                        checked={engineConfig.smartSnap} 
                        onChange={(v) => updateEngineConfig({ smartSnap: v })} 
                    />
                </div>
            </SettingsGroup>

            <SettingsGroup title="Hotkey Mappings">
                {['G (Move)', 'R (Rotate)', 'S (Scale)'].map(k => (
                    <div key={k} style={{ 
                        display: 'flex', justifyContent: 'space-between', padding: '12px 0', 
                        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`, fontSize: '13px' 
                    }}>
                        <span style={{ color: VibeTheme.colors.textSecondary, fontWeight: 500 }}>{k.split(' ')[1]}</span>
                        <span style={{ color: VibeTheme.colors.accent, fontWeight: 700, background: VibeTheme.colors.bgSubtle, padding: '4px 12px', borderRadius: '4px' }}>
                            {k.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </SettingsGroup>
        </motion.div>
    );
};
