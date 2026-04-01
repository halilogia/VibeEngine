import React from 'react';
import { motion } from 'framer-motion';
import { SettingsGroup, SettingsGrid, SettingsField, SettingsSelect } from '../SettingsComponents';
import { VibeTheme } from '@themes/VibeStyles';
import { useEditorStore } from '@infrastructure/store';

export const InterfaceSettingsTab: React.FC = () => {
    const { setLayoutPreset, engineConfig, updateEngineConfig } = useEditorStore();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
        >
            <SettingsGroup title="Studio Appearance">
                <SettingsGrid>
                    <SettingsField label="Editor Theme">
                        <SettingsSelect 
                            options={['Sovereign Dark', 'Deep Space', 'Light (Amateur)']} 
                            value={engineConfig.editorTheme}
                            onChange={(e) => updateEngineConfig({ editorTheme: e.target.value })}
                        />
                    </SettingsField>
                    <SettingsField label="UI Scaling Factor">
                        <input 
                            type="range" min="80" max="150" 
                            value={engineConfig.uiScale} 
                            onChange={(e) => updateEngineConfig({ uiScale: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: VibeTheme.colors.accent, marginTop: '8px', cursor: 'pointer' }} 
                        />
                    </SettingsField>
                    <SettingsField label="Language / Locale">
                        <SettingsSelect 
                            options={['English (Global)', 'Turkish (Native)']} 
                            value={engineConfig.locale}
                            onChange={(e) => updateEngineConfig({ locale: e.target.value })}
                        />
                    </SettingsField>
                </SettingsGrid>
            </SettingsGroup>

            <SettingsGroup title="Layout Presets">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {(['architect', 'programmer', 'animator'] as const).map(l => (
                        <button key={l} style={{ 
                            padding: '1.2rem', 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid rgba(255,255,255,0.08)', 
                            borderRadius: '8px', 
                            color: 'rgba(255,255,255,0.7)', 
                            fontWeight: 700, 
                            fontSize: '11px',
                            letterSpacing: '1.5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.borderColor = VibeTheme.colors.accent;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                        onClick={() => setLayoutPreset(l)}
                        >
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>
            </SettingsGroup>
        </motion.div>
    );
};
