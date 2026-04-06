import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SettingsGroup, SettingsGrid, SettingsField, SettingsInput } from '../SettingsComponents';

export const ProjectSettingsTab: React.FC<{ projectName: string }> = ({ projectName }) => {
    const { t } = useTranslation();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
        >
            <SettingsGroup title={t('settings.game_metadata')}>
                <SettingsGrid>
                    <SettingsField label={t('settings.active_game_title')}>
                        <SettingsInput defaultValue={projectName} disabled />
                    </SettingsField>
                    <SettingsField label={t('settings.studio_org')}>
                        <SettingsInput defaultValue="Halilogia Softworks" disabled />
                    </SettingsField>
                    <SettingsField label={t('settings.bundle_id')}>
                        <SettingsInput defaultValue="com.halilogia.vstudi.project" disabled />
                    </SettingsField>
                    <SettingsField label={t('settings.target_version')}>
                        <SettingsInput defaultValue="1.0.0-rc1" disabled />
                    </SettingsField>
                </SettingsGrid>
            </SettingsGroup>

            <SettingsGroup title={t('settings.system_architecture')}>
                <SettingsGrid>
                    <SettingsField label={t('settings.core_engine')}>
                        <SettingsInput defaultValue="VibeCore 4.2" disabled />
                    </SettingsField>
                    <SettingsField label={t('settings.neural_link')}>
                        <SettingsInput defaultValue="Ollama-1.5-RT" disabled />
                    </SettingsField>
                    <SettingsField label={t('settings.render_backend')}>
                        <SettingsInput defaultValue="Three.js / WebGL 2" disabled />
                    </SettingsField>
                    <SettingsField label={t('settings.editor_version')}>
                        <SettingsInput defaultValue="Sovereign Elite 1.0.0" disabled />
                    </SettingsField>
                </SettingsGrid>
            </SettingsGroup>
        </motion.div>
    );
};
