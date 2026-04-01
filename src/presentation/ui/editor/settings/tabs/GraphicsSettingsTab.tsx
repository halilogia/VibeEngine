import React from 'react';
import { motion } from 'framer-motion';
import { SettingsGroup, SettingsGrid, SettingsField, SettingsSelect, SettingsToggle } from '../SettingsComponents';
import { useEditorStore } from '@infrastructure/store';

export const GraphicsSettingsTab: React.FC = () => {
    const { showBloom, toggleBloom, showEnvironment, toggleEnvironment, engineConfig, updateEngineConfig } = useEditorStore();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
        >
            <SettingsGroup title="Rendering Quality">
                <SettingsGrid>
                    <SettingsField label="Anti-Aliasing (MSAA)">
                        <SettingsSelect 
                            options={['4x Samples', '8x Samples', 'FXAA Only', 'Disabled']} 
                            value={engineConfig.antiAliasing}
                            onChange={(e) => updateEngineConfig({ antiAliasing: e.target.value })}
                        />
                    </SettingsField>
                    <SettingsField label="Shadow Resolution">
                        <SettingsSelect 
                            options={['2048px (Elite)', '1024px', '512px']} 
                            value={engineConfig.shadowResolution}
                            onChange={(e) => updateEngineConfig({ shadowResolution: e.target.value })}
                        />
                    </SettingsField>
                    <SettingsField label="Texture Filtering">
                        <SettingsSelect 
                            options={['Anisotropic 16x', 'Bilinear']} 
                            value={engineConfig.textureFiltering}
                            onChange={(e) => updateEngineConfig({ textureFiltering: e.target.value })}
                        />
                    </SettingsField>
                    <SettingsField label="Refresh Rate (V-Sync)">
                        <SettingsSelect 
                            options={['Synchronized', 'Uncapped (60+)']} 
                            value={engineConfig.vSync}
                            onChange={(e) => updateEngineConfig({ vSync: e.target.value })}
                        />
                    </SettingsField>
                </SettingsGrid>
            </SettingsGroup>

            <SettingsGroup title="Post-Processing">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <SettingsToggle label="Enable Volumetric Bloom" checked={showBloom} onChange={toggleBloom} />
                    <SettingsToggle label="Render Environment Sky" checked={showEnvironment} onChange={toggleEnvironment} />
                    <SettingsToggle 
                        label="Screen Space Reflections" 
                        checked={engineConfig.enableSSR} 
                        onChange={(v) => updateEngineConfig({ enableSSR: v })} 
                    />
                    <SettingsToggle 
                        label="Motion Blur (Low)" 
                        checked={engineConfig.enableMotionBlur} 
                        onChange={(v) => updateEngineConfig({ enableMotionBlur: v })} 
                    />
                </div>
            </SettingsGroup>
        </motion.div>
    );
};
