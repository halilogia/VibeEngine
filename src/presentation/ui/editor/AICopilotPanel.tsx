/**
 * AICopilotPanel (Sovereign Elite Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VibeIcons } from '@ui/common/VibeIcons';
import { CommandInterpreter } from '../../features/editor/bridge/AICopilot';
import { NeuralService, type AIProvider } from '../../features/editor/bridge/NeuralService';
import { VibeVault } from '@infrastructure/security/VibeVault';
import { useEditorStore } from '@infrastructure/store';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';
import { aiStyles as styles, aiAnimations } from './AICopilotPanel.styles';

// #region Types
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    commands?: any[];
    streaming?: boolean;
}

interface AICopilotPanelProps {
    dragHandleProps?: any;
}
// #endregion

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({ dragHandleProps }) => {
    const { 
        showAICopilotSettings, setShowAICopilotSettings,
        activePanelId, setActivePanel 
    } = useEditorStore();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [activeProvider, setActiveProvider] = useState<AIProvider>((localStorage.getItem('vibe_ai_provider') as AIProvider) || 'ollama');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [apiKeys, setApiKeys] = useState<{ openrouter: string; github: string }>({
        openrouter: VibeVault.getSecret('openrouter') || '',
        github: VibeVault.getSecret('github') || ''
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [allModels, setAllModels] = useState<{provider: string, model: string}[]>([]);
    const [showModelMenu, setShowModelMenu] = useState(false);
    const [modelSearch, setModelSearch] = useState('');

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
    }, [showModelMenu]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const ollama = await NeuralService.getAvailableModels('ollama').catch(() => []);
                const gh = await NeuralService.getAvailableModels('github').catch(() => []);
                const or = await NeuralService.getAvailableModels('openrouter').catch(() => []);
                
                setAllModels([
                    ...ollama.map(m => ({ provider: 'ollama', model: m })),
                    ...gh.map(m => ({ provider: 'github', model: m })),
                    ...or.map(m => ({ provider: 'openrouter', model: m }))
                ]);
            } catch (error) {
                console.error("Failed fetching models", error);
            }
        };
        fetchAll();
    }, []);

    const handleModelChange = (val: string) => {
        const [p, m] = val.split(':');
        setActiveProvider(p as AIProvider);
        setSelectedModel(m);
        localStorage.setItem('vibe_ai_provider', p);
        localStorage.setItem('vibe_last_ai_model', m);
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const dynamicGithubKey = VibeVault.getSecret('github') || '';
        const dynamicOpenrouterKey = VibeVault.getSecret('openrouter') || '';
        
        const providerKey = activeProvider === 'ollama' ? null : (activeProvider === 'github' ? dynamicGithubKey : dynamicOpenrouterKey);
        
        if (activeProvider !== 'ollama' && !providerKey) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Please enter your ${activeProvider.toUpperCase()} API key in the App Settings > Neural Intelligence menu! 🔑`,
                timestamp: new Date()
            }]);
            setShowAICopilotSettings(true);
            return;
        }

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
        const assistantMsgId = (Date.now() + 1).toString();
        
        setInput('');
        setMessages(prev => [...prev, userMsg, { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date(), streaming: true }]);
        setIsThinking(true);

        try {
            const history = messages.concat(userMsg).map(m => ({ role: m.role as any, content: m.content }));
            let streamedContent = '';

            const result = await NeuralService.chat({
                provider: activeProvider,
                model: selectedModel || (activeProvider === 'ollama' ? 'llama3:8b' : 
                                       activeProvider === 'github' ? 'gpt-4o' : 'openai/gpt-oss-20b'),
                messages: history,
                apiKey: providerKey || '',
                onToken: (token: string) => {
                    streamedContent += token;
                    setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: streamedContent } : m));
                }
            });

            const commands = NeuralService.extractCommands(result.content);
            if (commands.length > 0) CommandInterpreter.executeBatch(commands as any);

            setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, streaming: false, commands } : m));
        } catch (error) {
            const content = `Neural Link Error: ${error instanceof Error ? error.message : String(error)}`;
            setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content, streaming: false } : m));
        } finally {
            setIsThinking(false);
        }
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: VibeTheme.colors.bgPrimary, color: VibeTheme.colors.textMain, borderLeft: `1px solid ${VibeTheme.colors.glassBorder}`,
        overflow: 'hidden'
    };

    return (
        <div style={containerStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                ${aiAnimations}
                .ai-message-list::-webkit-scrollbar {
                    width: 4px;
                }
                .ai-message-list::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ai-message-list::-webkit-scrollbar-thumb {
                    background: ${VibeTheme.colors.glassBorder};
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }
                .ai-message-list::-webkit-scrollbar-thumb:hover {
                    background: ${VibeTheme.colors.accent}66;
                }
                .ai-settings-input {
                    background: ${VibeTheme.colors.bgSecondary};
                    border: 1px solid ${VibeTheme.colors.glassBorder};
                    color: ${VibeTheme.colors.textMain};
                    padding: 8px 12px;
                    border-radius: 8px;
                    width: 100%;
                    outline: none;
                    margin-top: 8px;
                    font-size: 11px;
                }
            ` }} />
            




            <div 
                ref={messagesEndRef} 
                className="ai-message-list"
                style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
                {messages.length === 0 && (
                    <div style={{ opacity: 0.2, textAlign: 'center', marginTop: '100px' }}>
                        <VibeIcons name="Bot" size={64} style={{ color: VibeTheme.colors.textSecondary }} />
                    </div>
                )}
                
                {messages.map((msg, idx) => {
                    const isLast = idx === messages.length - 1;
                    const showDots = msg.role === 'assistant' && !msg.content.trim() && (isThinking || msg.streaming);
                    return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            <div style={{ 
                                padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                                background: msg.role === 'user' ? VibeTheme.colors.accent : VibeTheme.colors.bgSubtle,
                                border: `1px solid ${msg.role === 'user' ? 'transparent' : VibeTheme.colors.glassBorder}`,
                                fontSize: '13px', lineHeight: '1.6', position: 'relative',
                                boxShadow: msg.role === 'user' ? `0 10px 20px -10px ${VibeTheme.colors.accent}44` : 'none'
                            }}>
                                {showDots ? (
                                    <div style={{ display: 'flex', gap: '4px', height: '24px', alignItems: 'center' }}>
                                        {[0,1,2].map(i => <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: VibeTheme.colors.accent }} />)}
                                    </div>
                                ) : <div style={{ whiteSpace: 'pre-wrap', color: msg.role === 'user' ? '#fff' : VibeTheme.colors.textMain }}>{msg.content}</div>}
                                {msg.commands && msg.commands.length > 0 && <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: `1px solid ${VibeTheme.colors.glassBorder}`, fontSize: '9px', color: VibeTheme.colors.accent, fontWeight: 900 }}>{msg.commands.length} ELITE COMMANDS EXECUTED</div>}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ padding: '20px', borderTop: `1px solid ${VibeTheme.colors.glassBorder}`, background: VibeTheme.colors.bgSecondary, position: 'relative' }}>
                
                <div ref={menuRef}>
                    {/* 🟢 Elite Custom Model Selector Popover */}
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
                                {allModels.filter(m => m.model.toLowerCase().includes(modelSearch.toLowerCase())).length === 0 && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: VibeTheme.colors.textSecondary, fontSize: '12px' }}>No models found matching "{modelSearch}"</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toggle Button */}
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

                {/* 🌌 Elite Segmented Input Area */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ 
                        flex: 1, 
                        background: VibeTheme.colors.bgSubtle, 
                        border: `1px solid ${VibeTheme.colors.glassBorder}`, 
                        borderRadius: '16px', 
                        padding: '2px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                    }}>
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                            placeholder="Ask Neural Copilot..."
                            style={{ 
                                width: '100%', 
                                background: 'transparent', 
                                border: 'none', 
                                padding: '12px 16px', 
                                color: VibeTheme.colors.textMain, 
                                fontSize: '13px', 
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            onFocus={() => setShowModelMenu(false)}
                        />
                    </div>
                    
                    <VibeButton 
                        variant="primary" 
                        size="sm" 
                        onClick={handleSend} 
                        disabled={isThinking || !input.trim()} 
                        style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: `0 4px 12px -4px ${VibeTheme.colors.accent}44`,
                            padding: 0
                        }}
                    >
                        <VibeIcons name={isThinking ? "Pause" : "Send"} size={16} />
                    </VibeButton>
                </div>
            </div>
        </div>
    );
};
