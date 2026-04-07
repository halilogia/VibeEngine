import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VibeIcons, VibeIconName } from '@ui/common/VibeIcons';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';

import { ProjectSettingsTab } from './tabs/ProjectSettingsTab';
import { InterfaceSettingsTab } from './tabs/InterfaceSettingsTab';
import { InputSettingsTab } from './tabs/InputSettingsTab';
import { GraphicsSettingsTab } from './tabs/GraphicsSettingsTab';
import { NeuralSettingsTab } from './tabs/NeuralSettingsTab';
import { useToastStore } from '@infrastructure/store/toastStore';
import { useEditorStore } from '@infrastructure/store';
import { useTranslation } from 'react-i18next';

export type SettingsTabId = 'project' | 'interface' | 'input' | 'graphics' | 'neural';

interface SettingsModalProps {
    onClose: () => void;
    projectName?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, projectName = 'New Project' }) => {
    const { t } = useTranslation();
    const { activeSettingsTab, setShowAICopilotSettings } = useEditorStore();
    const activeTab = (activeSettingsTab as string) === 'about' ? 'project' : (activeSettingsTab as SettingsTabId);
    const { addToast } = useToastStore();

    const TABS: { id: SettingsTabId; label: string; icon: VibeIconName }[] = [
        { id: 'project', label: t('settings.game_info'), icon: 'Layers' },
        { id: 'interface', label: t('settings.interface'), icon: 'Activity' },
        { id: 'input', label: t('settings.input'), icon: 'Cursor' },
        { id: 'graphics', label: t('settings.rendering'), icon: 'Eye' },
        { id: 'neural', label: t('settings.neural'), icon: 'Cpu' },
    ];

    const handleApply = () => {
        addToast('Studio configuration synchronized correctly.', 'success');
        onClose();
    };

    const handleTabChange = (tabId: SettingsTabId) => {
        setShowAICopilotSettings(true, tabId as unknown as SettingsTabId);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle}>
            <motion.div initial={{ scale: 0.98, opacity: 0, y: 5 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 5 }} transition={{ duration: 0.15 }} style={fullscreenWrapperStyle}>
                
                <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                    
                    {}
                    <div style={settingsSidebarStyle}>
                        <div style={{ padding: '2rem 1.5rem 1rem' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 700, color: VibeTheme.colors.textSecondary, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {t('settings.title')}
                            </h3>
                        </div>
                        
                        {TABS.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                style={{
                                    ...sidebarItemStyle,
                                    background: activeTab === tab.id ? VibeTheme.colors.bgSubtle : 'transparent',
                                    borderLeft: activeTab === tab.id ? `3px solid ${VibeTheme.colors.accent}` : '3px solid transparent',
                                    color: activeTab === tab.id ? VibeTheme.colors.textMain : VibeTheme.colors.textSecondary,
                                }}
                            >
                                <VibeIcons name={tab.icon} size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {}
                    <div style={settingsContentAreaStyle}>
                        <VibeButton variant="ghost" size="sm" onClick={onClose} style={closeButtonStyle}>
                            <VibeIcons name="X" size={18} />
                        </VibeButton>

                        <div style={{ flex: 1, paddingRight: '1rem', overflowY: 'auto' }}>
                            <div style={settingsHeaderStyle}>
                                <h2 style={{ fontSize: '24px', fontWeight: 600, color: VibeTheme.colors.textMain, letterSpacing: '-0.5px', margin: 0 }}>
                                    {TABS.find(t => t.id === activeTab)?.label || activeTab}
                                </h2>
                                <p style={{ color: VibeTheme.colors.textSecondary, marginTop: '4px', fontSize: '13px', fontWeight: 400 }}>
                                    {activeTab === 'project' ? t('settings.config_desc_game') : t('settings.config_desc', { tab: TABS.find(t => t.id === activeTab)?.label.toLowerCase() })}
                                </p>
                            </div>

                            <div style={settingsScrollAreaStyle}>
                                <AnimatePresence mode="wait">
                                    {activeTab === 'project' && <ProjectSettingsTab key="project" projectName={projectName} />}
                                    {activeTab === 'interface' && <InterfaceSettingsTab key="interface" />}
                                    {activeTab === 'input' && <InputSettingsTab key="input" />}
                                    {activeTab === 'graphics' && <GraphicsSettingsTab key="graphics" />}
                                    {activeTab === 'neural' && <NeuralSettingsTab key="neural" />}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div style={settingsFooterStyle}>
                            <div style={{ flex: 1, color: VibeTheme.colors.textSecondary, fontSize: '12px', fontWeight: 500 }}>
                                {t('settings.autosave')}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <VibeButton variant="ghost" size="sm" onClick={onClose} style={{ color: VibeTheme.colors.textSecondary, fontWeight: 500, fontSize: '13px', padding: '0 16px', height: '32px' }}>
                                    {t('settings.cancel')}
                                </VibeButton>
                                <VibeButton variant="primary" size="sm" onClick={handleApply} style={eliteApplyButtonStyle}>
                                    <VibeIcons name="Check" size={14} />
                                    <span style={{ marginLeft: '6px' }}>{t('settings.apply')}</span>
                                </VibeButton>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: 10000, background: VibeTheme.colors.glassBg, backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const fullscreenWrapperStyle: React.CSSProperties = {
    width: '900px', height: '640px', background: VibeTheme.colors.bgPrimary,
    border: `1px solid ${VibeTheme.colors.border}`, borderRadius: '8px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)', overflow: 'hidden',
    position: 'relative', display: 'flex', flexDirection: 'column'
};

const closeButtonStyle: React.CSSProperties = {
    position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 100, color: VibeTheme.colors.textSecondary,
    background: 'transparent', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px'
};

const settingsSidebarStyle: React.CSSProperties = {
    width: '240px', background: VibeTheme.colors.bgSecondary, borderRight: `1px solid ${VibeTheme.colors.border}`, display: 'flex', flexDirection: 'column'
};

const sidebarItemStyle: React.CSSProperties = {
    padding: '12px 24px', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '13.5px', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s', outline: 'none'
};

const settingsContentAreaStyle: React.CSSProperties = { flex: 1, padding: '2.5rem 3rem 1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', background: VibeTheme.colors.bgPrimary };
const settingsHeaderStyle: React.CSSProperties = { marginBottom: '2rem' };
const settingsScrollAreaStyle: React.CSSProperties = { flex: 1 };

const settingsFooterStyle: React.CSSProperties = { 
    marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${VibeTheme.colors.border}`, 
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
};

const eliteApplyButtonStyle: React.CSSProperties = {
    background: VibeTheme.colors.accent,
    color: '#fff', padding: '0 20px', height: '32px', borderRadius: '4px', 
    fontWeight: 600, fontSize: '13px', border: 'none',
    display: 'flex', alignItems: 'center', cursor: 'pointer',
    transition: 'opacity 0.2s',
    boxShadow: `0 2px 8px ${VibeTheme.colors.accent}40`
};
