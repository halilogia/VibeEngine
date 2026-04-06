import React from 'react';
import { motion } from 'framer-motion';
import { SettingsGroup, SettingsGrid, SettingsField, SettingsInput } from '../SettingsComponents';
import { VibeTheme } from '@themes/VibeStyles';
import { VibeVault } from '@infrastructure/security/VibeVault';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useEditorStore } from '@infrastructure/store';

export const NeuralSettingsTab: React.FC = () => {
    const { engineConfig, updateEngineConfig } = useEditorStore();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
        >
            <SettingsGroup title="Neural Agent Authentication">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {(['openrouter', 'github'] as const).map((p: string) => (
                        <SettingsField key={p} label={`${p.toUpperCase()} ACCESS TOKEN`}>
                            <SettingsInput 
                                type="password" 
                                defaultValue={VibeVault.getSecret(p) || ''}
                                onBlur={(e) => VibeVault.saveSecret(p, e.target.value)}
                                placeholder="sk-••••••••••••••••••••••••"
                            />
                        </SettingsField>
                    ))}
                </div>
            </SettingsGroup>

            <SettingsGroup title="Inference Parameters">
                <SettingsGrid>
                    <SettingsField label="Max Tokens (Context)">
                        <SettingsInput 
                            type="number" 
                            value={engineConfig.neuralMaxTokens} 
                            onChange={(e) => updateEngineConfig({ neuralMaxTokens: parseInt(e.target.value) || 4096 })}
                        />
                    </SettingsField>
                    <SettingsField label="Temperature">
                        <SettingsInput 
                            type="number" step="0.01" 
                            value={engineConfig.neuralTemperature} 
                            onChange={(e) => updateEngineConfig({ neuralTemperature: parseFloat(e.target.value) || 0.72 })}
                        />
                    </SettingsField>
                </SettingsGrid>
            </SettingsGroup>

            <div style={{
                display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem 2rem', 
                background: `${VibeTheme.colors.accent}08`, borderRadius: '8px', border: `1px solid ${VibeTheme.colors.accent}22`,
                marginTop: '1rem'
            }}>
                <VibeIcons name="Shield" size={24} color={VibeTheme.colors.accent} />
                <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: VibeTheme.colors.textMain, letterSpacing: '0.5px', marginBottom: '4px' }}>Automated Enclave Locking</div>
                    <div style={{ fontSize: '12px', color: VibeTheme.colors.textSecondary, fontWeight: 500 }}>Sensitive keys are local-only and sealed safely on this machine.</div>
                </div>
            </div>
        </motion.div>
    );
};
