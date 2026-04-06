import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VibeIcons } from '@ui/common/VibeIcons';
import { VibeTheme } from '@themes/VibeStyles';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { type AIProvider } from '../../../features/editor/bridge/NeuralService';
import { ModelOption } from './types';

interface ModelSelectorProps {
    showModelMenu: boolean;
    setShowModelMenu: (show: boolean) => void;
    modelSearch: string;
    setModelSearch: (val: string) => void;
    allModels: ModelOption[];
    activeProvider: AIProvider;
    selectedModel: string;
    handleModelChange: (val: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
    showModelMenu,
    setShowModelMenu,
    modelSearch,
    setModelSearch,
    allModels,
    activeProvider,
    selectedModel,
    handleModelChange
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowModelMenu(false);
            }
        };

        if (showModelMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setShowModelMenu, showModelMenu]);

    return (
        <div ref={menuRef}>
            <AnimatePresence>
                {showModelMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        style={{ 
                            position: 'absolute', bottom: 'calc(100% - 20px)', left: '20px', right: '20px', 
                            background: VibeTheme.colors.bgPrimary, 
                            border: `1px solid ${VibeTheme.colors.glassBorder}`, 
                            borderRadius: '12px', padding: '0',
                            boxShadow: `0 -10px 40px rgba(0,0,0,0.3), 0 0 0 1px ${VibeTheme.colors.bgPrimary}`,
                            zIndex: 100,
                            maxHeight: '380px', display: 'flex', flexDirection: 'column',
                            backdropFilter: 'blur(20px)'
                        }}
                        className="ai-message-list"
                    >
                        <div style={{ padding: '12px', borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`, background: VibeTheme.colors.bgSecondary, borderRadius: '12px 12px 0 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: VibeTheme.colors.bgPrimary, borderRadius: '8px', padding: '8px 12px', border: `1px solid ${VibeTheme.colors.glassBorder}` }}>
                                <VibeIcons name="Search" size={14} color={VibeTheme.colors.textSecondary} style={{ marginRight: '8px' }} />
                                <input 
                                    autoFocus
                                    value={modelSearch} onChange={(e) => setModelSearch(e.target.value)}
                                    placeholder="Search models..."
                                    style={{ background: 'transparent', border: 'none', color: VibeTheme.colors.textMain, outline: 'none', fontSize: '13px', width: '100%', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {['ollama', 'github', 'openrouter'].map(provider => {
                                const models = allModels.filter(m => m.provider === provider && m.model.toLowerCase().includes(modelSearch.toLowerCase()));
                                if (models.length === 0) return null;
                                return (
                                    <div key={provider} style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: VibeTheme.colors.textSecondary, padding: '4px 8px', letterSpacing: '0.5px' }}>
                                            {provider === 'ollama' ? 'Local Enclave (Ollama)' : provider === 'github' ? 'GitHub Models' : 'OpenRouter (Free)'}
                                        </div>
                                        {models.map(m => {
                                            const isSelected = activeProvider === m.provider && selectedModel === m.model;
                                            
                                            let costLabel = "Free";
                                            let hasWarning = false;
                                            if (provider === 'github') {
                                                if (m.model.includes('Flash')) costLabel = "0.33x";
                                                else if (m.model.includes('3.1 Pro')) costLabel = "1x";
                                                else if (m.model === 'GPT-4.1' || m.model === 'GPT-4o') costLabel = "0x";
                                                else if (m.model === 'GPT-5 mini') costLabel = "Medium · 0x";
                                                else if (m.model.includes('5.1-Codex')) {
                                                    costLabel = m.model.includes('Mini') ? "Medium · 0.33x" : "Medium · 1x";
                                                    hasWarning = true;
                                                }
                                                else if (m.model.includes('5.2') || m.model.includes('5.3')) costLabel = "Medium · 1x";
                                                else if (m.model.includes('5.4')) costLabel = "Medium · 0.33x";
                                                else if (m.model.includes('Grok')) costLabel = "0.25x";
                                                else costLabel = "Fast";
                                            }

                                            return (
                                                <div 
                                                    key={`${m.provider}:${m.model}`}
                                                    onClick={() => { handleModelChange(`${m.provider}:${m.model}`); setShowModelMenu(false); setModelSearch(''); }}
                                                    style={{ 
                                                        padding: '8px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                                                        background: isSelected ? `${VibeTheme.colors.accent}22` : 'transparent',
                                                        color: isSelected ? VibeTheme.colors.accent : VibeTheme.colors.textMain,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                                                        transition: 'all 0.1s ease', fontWeight: isSelected ? 600 : 400
                                                    }}
                                                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = VibeTheme.colors.bgSubtle; }}
                                                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSelected ? 1 : 0.4 }}>
                                                            <VibeIcons name={provider === 'ollama' ? 'Cpu' : provider === 'github' ? 'Box' : 'Layers'} size={14} color={isSelected ? VibeTheme.colors.accent : 'currentColor'} />
                                                        </div>
                                                        {hasWarning && <VibeIcons name="AlertCircle" size={12} color={VibeTheme.colors.textSecondary} />}
                                                        {m.model}
                                                    </div>
                                                    {provider !== 'ollama' && <span style={{ fontSize: '10px', opacity: 0.5 }}>{costLabel}</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', marginBottom: '16px' }}>
                <VibeButton 
                    variant="ghost" size="sm" 
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    style={{ 
                        fontSize: '11px', color: VibeTheme.colors.textSecondary, borderRadius: '8px', 
                        border: `1px solid ${showModelMenu ? VibeTheme.colors.accent : VibeTheme.colors.glassBorder}`, 
                        background: showModelMenu ? `${VibeTheme.colors.accent}11` : VibeTheme.colors.bgPrimary,
                        boxShadow: showModelMenu ? `0 0 15px ${VibeTheme.colors.accent}33` : 'none',
                        padding: '6px 14px', height: 'auto', fontWeight: 600
                    }}
                >
                    <VibeIcons name="Cpu" size={14} style={{ marginRight: '8px', color: VibeTheme.colors.accent }} />
                    {selectedModel || 'Select model'}
                    <VibeIcons name={showModelMenu ? "ChevronDown" : "ChevronUp"} size={14} style={{ marginLeft: '8px', opacity: 0.5 }} />
                </VibeButton>
            </div>
        </div>
    );
};
