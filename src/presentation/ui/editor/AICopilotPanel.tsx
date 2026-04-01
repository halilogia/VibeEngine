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
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
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
    const { activePanelId, setActivePanel } = useEditorStore();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [activeProvider, setActiveProvider] = useState<AIProvider>((localStorage.getItem('vibe_ai_provider') as AIProvider) || 'ollama');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [showModelSelector, setShowModelSelector] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKeys, setApiKeys] = useState<{ openrouter: string; github: string }>({
        openrouter: VibeVault.getSecret('openrouter') || '',
        github: VibeVault.getSecret('github') || ''
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const updateModels = async () => {
            const models = await NeuralService.getAvailableModels(activeProvider);
            setAvailableModels(models);
        };
        updateModels();
    }, [activeProvider]);

    const handleProviderChange = (provider: AIProvider) => {
        setActiveProvider(provider);
        localStorage.setItem('vibe_ai_provider', provider);
        setSelectedModel('');
        setShowModelSelector(false);
    };

    const handleModelChange = (modelName: string) => {
        setSelectedModel(modelName);
        localStorage.setItem('vibe_last_ai_model', modelName);
        setShowModelSelector(false);
    };

    const saveApiKeys = () => {
        VibeVault.saveSecret('openrouter', apiKeys.openrouter);
        VibeVault.saveSecret('github', apiKeys.github);
        setShowSettings(false);
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const providerKey = activeProvider === 'ollama' ? null : (activeProvider === 'github' ? apiKeys.github : apiKeys.openrouter);
        
        if (activeProvider !== 'ollama' && !providerKey) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Please enter your ${activeProvider.toUpperCase()} API key in settings! 🔑`,
                timestamp: new Date()
            }]);
            setShowSettings(true);
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
                                       activeProvider === 'github' ? 'gpt-4o' : 'anthropic/claude-3.5-sonnet'),
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
        backgroundColor: '#0a0a0f', color: '#fff', borderLeft: `1px solid ${VibeTheme.colors.glassBorder}`,
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
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }
                .ai-message-list::-webkit-scrollbar-thumb:hover {
                    background: ${VibeTheme.colors.accent}66;
                }
                .ai-settings-input {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    width: 100%;
                    outline: none;
                    margin-top: 8px;
                    font-size: 11px;
                }
            ` }} />
            
            <SovereignHeader 
                icon="Sparkles" title="NEURAL HUB" dragHandleProps={dragHandleProps}
                actions={
                    <VibeButton size="sm" variant="ghost" onClick={() => setShowSettings(!showSettings)}>
                        <VibeIcons name="Settings" size={14} color={showSettings ? VibeTheme.colors.accent : '#fff'} />
                    </VibeButton>
                }
            />

            {/* 🟢 Provider Tabs */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', gap: '4px' }}>
                {(['ollama', 'github', 'openrouter'] as AIProvider[]).map(p => (
                    <VibeButton
                        key={p} variant={activeProvider === p ? 'primary' : 'ghost'} size="sm"
                        style={{ flex: 1, fontSize: '10px', height: '28px' }}
                        onClick={() => handleProviderChange(p)}
                    >
                        {p.toUpperCase()}
                    </VibeButton>
                ))}
            </div>

            {/* 🟢 Settings Modal (Elite Vault) */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`, overflow: 'hidden' }}
                    >
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: 900, marginBottom: '6px', color: VibeTheme.colors.accent, letterSpacing: '1px' }}>GITHUB COPILOT AUTHENTICATION</div>
                                <p style={{ fontSize: '10px', opacity: 0.4, marginBottom: '8px' }}>Use a 'Personal Access Token' (PAT) from github.com/settings/tokens</p>
                                <input 
                                    className="ai-settings-input"
                                    type="password" value={apiKeys.github} onChange={(e) => setApiKeys({...apiKeys, github: e.target.value})} 
                                    placeholder="Paste GitHub PAT token here..."
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: '10px', fontWeight: 900, marginBottom: '6px', color: VibeTheme.colors.accent, letterSpacing: '1px' }}>OPENROUTER NEURAL LINK</div>
                                <p style={{ fontSize: '10px', opacity: 0.4, marginBottom: '8px' }}>Get your universal neural key from openrouter.ai/keys</p>
                                <input 
                                    className="ai-settings-input"
                                    type="password" value={apiKeys.openrouter} onChange={(e) => setApiKeys({...apiKeys, openrouter: e.target.value})} 
                                    placeholder="Paste OpenRouter API key here..."
                                />
                            </div>

                            <VibeButton variant="primary" size="sm" style={{ width: '100%', marginTop: '4px', fontWeight: 900 }} onClick={saveApiKeys}>
                                <VibeIcons name="Shield" size={14} style={{ marginRight: '8px' }} />
                                SEAL KEYS IN VAULT
                            </VibeButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <VibeButton size="sm" variant="ghost" onClick={() => setShowModelSelector(!showModelSelector)} style={{ fontSize: '10px' }}>
                    <VibeIcons name="Box" size={10} style={{ marginRight: '6px' }} /> {selectedModel || 'SELECT MODEL'}
                </VibeButton>
            </div>

            {showModelSelector && (
                <div style={{ padding: '16px', background: 'rgba(10, 10, 15, 0.95)', borderBottom: `1px solid ${VibeTheme.colors.glassBorder}` }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {availableModels.map(m => (
                            <VibeButton key={m} variant={selectedModel === m ? 'primary' : 'secondary'} size="sm" onClick={() => handleModelChange(m)} style={{ borderRadius: '8px', fontSize: '10px' }}>
                                {m.split('/').pop()?.toUpperCase() || m}
                            </VibeButton>
                        ))}
                    </div>
                </div>
            )}

            <div 
                ref={messagesEndRef} 
                className="ai-message-list"
                style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
                {messages.length === 0 && <div style={{ opacity: 0.2, textAlign: 'center', marginTop: '100px' }}><VibeIcons name="Bot" size={48} /><p>NEURAL LINK READY</p></div>}
                
                {messages.map((msg, idx) => {
                    const isLast = idx === messages.length - 1;
                    const showDots = msg.role === 'assistant' && !msg.content.trim() && (isThinking || msg.streaming);
                    return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            <div style={{ 
                                padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                                background: msg.role === 'user' ? VibeTheme.colors.accent : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${msg.role === 'user' ? 'transparent' : 'rgba(255,255,255,0.05)'}`,
                                fontSize: '13px', lineHeight: '1.6', position: 'relative',
                                boxShadow: msg.role === 'user' ? `0 10px 20px -10px ${VibeTheme.colors.accent}44` : 'none'
                            }}>
                                {showDots ? (
                                    <div style={{ display: 'flex', gap: '4px', height: '24px', alignItems: 'center' }}>
                                        {[0,1,2].map(i => <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: VibeTheme.colors.accent }} />)}
                                    </div>
                                ) : <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>}
                                {msg.commands && msg.commands.length > 0 && <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '9px', color: VibeTheme.colors.accent, fontWeight: 900 }}>{msg.commands.length} ELITE COMMANDS EXECUTED</div>}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ padding: '20px', borderTop: `1px solid ${VibeTheme.colors.glassBorder}`, background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '4px' }}>
                    <input 
                        value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Neural Copilot'a sor..."
                        style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 16px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                    <VibeButton variant="primary" size="sm" onClick={handleSend} disabled={isThinking || !input.trim()} style={{ borderRadius: '10px', minWidth: '40px' }}>
                        <VibeIcons name={isThinking ? "Pause" : "Send"} size={14} />
                    </VibeButton>
                </div>
            </div>
        </div>
    );
};
