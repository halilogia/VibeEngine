/**
 * AICopilotPanel (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VibeIcons } from '@ui/common/VibeIcons';
import { CommandInterpreter } from '@editor/bridge';
import { OllamaService, type OllamaMessage } from '@editor/bridge';
import { useEditorStore } from '@infrastructure/store';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
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
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your VibeEngine AI Copilot. I can help you build scenes and write scripts. Type a command to begin!',
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const [ollamaReady, setOllamaReady] = useState<boolean | null>(null);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [showModelSelector, setShowModelSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const checkOllama = async () => {
            const available = await OllamaService.isAvailable();
            setOllamaReady(available);
            if (available) {
                const models = await OllamaService.listModels();
                setAvailableModels(models);
                
                // 🧠 RESTORE LAST SELECTED MODEL FROM MEMORY
                const savedModel = localStorage.getItem('vibe_last_ai_model');
                if (savedModel && models.includes(savedModel)) {
                    setSelectedModel(savedModel);
                } else if (models.length > 0) {
                    setSelectedModel(models[0]);
                }
            }
        };
        checkOllama();
    }, []);

    // 🧠 HAFIDZA: Model değişimini kaydet
    const handleModelChange = (modelName: string) => {
        setSelectedModel(modelName);
        localStorage.setItem('vibe_last_ai_model', modelName);
        console.debug(`[AI Memory] Brain switched to: ${modelName}`);
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
        const assistantMsgId = (Date.now() + 1).toString();
        
        setInput('');
        setMessages(prev => [...prev, userMsg, {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            streaming: true
        }]);
        setIsThinking(true);

        try {
            if (ollamaReady && selectedModel) {
                const ollamaMessages: OllamaMessage[] = messages.concat(userMsg).map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }));

                let streamedContent = '';

                const result = await OllamaService.chat({
                    model: selectedModel,
                    messages: ollamaMessages,
                    onToken: (token) => {
                        streamedContent += token;
                        setMessages(prev => prev.map(m => 
                            m.id === assistantMsgId ? { ...m, content: streamedContent } : m
                        ));
                    }
                });

                // Extract and execute commands
                const commands = OllamaService.extractCommands(result.content);
                if (commands.length > 0) {
                    CommandInterpreter.executeBatch(commands as any);
                }

                setMessages(prev => prev.map(m => 
                    m.id === assistantMsgId ? { ...m, streaming: false, commands } : m
                ));
            } else {
                // Fallback / Mock
                setTimeout(() => {
                    const content = ollamaReady ? "Please select a model first." : "Ollama is not running. Please start Ollama to use AI Copilot.";
                    setMessages(prev => prev.map(m => 
                        m.id === assistantMsgId ? { ...m, content, streaming: false } : m
                    ));
                }, 1000);
            }
        } catch (error) {
            const content = `Error: ${error instanceof Error ? error.message : String(error)}`;
            setMessages(prev => prev.map(m => 
                m.id === assistantMsgId ? { ...m, content, streaming: false } : m
            ));
        } finally {
            setIsThinking(false);
        }
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0a0a0f',
        color: '#fff',
        borderLeft: `1px solid ${VibeTheme.colors.glassBorder}`,
        overflow: 'hidden'
    };

    return (
        <div style={containerStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                ${aiAnimations}
                .status-bar, .assets-panel, .console-panel {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255,255,255,0.05) transparent;
                }
                .ai-message pre { background: #000; padding: 12px; border-radius: 8px; margin: 8px 0; overflow-x: auto; }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
            ` }} />
            
            <div style={{ 
                padding: '12px 16px', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VibeIcons name="Sparkles" size={16} color={VibeTheme.colors.accent} />
                    <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>NEURAL COPILOT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VibeButton size="xs" variant="ghost" onClick={() => setShowModelSelector(!showModelSelector)} style={{ fontSize: '10px', padding: '4px 8px' }}>
                        {selectedModel?.split(':')[0].toUpperCase() || 'SELECT ENGINE'}
                        <VibeIcons name="ChevronDown" size={10} style={{ marginLeft: '4px' }} />
                    </VibeButton>
                    <VibeButton size="xs" variant="ghost" onClick={() => setMessages([])}>
                        <VibeIcons name="Plus" size={14} />
                    </VibeButton>
                </div>
            </div>

            {showModelSelector && (
                <div style={{
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                    animation: 'msg-slide 0.2s ease-out'
                }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.3, marginBottom: '12px', letterSpacing: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>NEURAL ENGINES FOUND</span>
                        <span>{availableModels.length} LISTED</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {availableModels.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', width: '100%', opacity: 0.5, fontSize: '12px' }}>
                                Searching local Ollama...
                            </div>
                        ) : (
                            availableModels.map(m => (
                                <VibeButton 
                                    key={m} 
                                    variant={selectedModel === m ? 'primary' : 'secondary'} 
                                    size="sm" 
                                    onClick={() => { 
                                        handleModelChange(m); // 🧠 STORE IN MEMORY
                                        setShowModelSelector(false); 
                                    }}
                                    style={{ borderRadius: '8px', fontSize: '11px', padding: '10px 16px' }}
                                >
                                    {m.split(':')[0].toUpperCase()}
                                </VibeButton>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div 
                ref={messagesEndRef}
                style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}
            >
                {messages.length === 0 && (
                    <div style={{ opacity: 0.2, textAlign: 'center', marginTop: '100px' }}>
                        <VibeIcons name="Bot" size={48} />
                        <p style={{ marginTop: '16px', fontSize: '11px', fontWeight: 800 }}>VIBEENGINE NEURAL LINK READY</p>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isLast = idx === messages.length - 1;
                    const showDots = msg.role === 'assistant' && !msg.content.trim() && (isThinking || msg.streaming);

                    return (
                        <motion.div 
                            key={msg.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ 
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%'
                            }}
                        >
                            <div style={{ 
                                padding: '14px 18px', 
                                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                                background: msg.role === 'user' ? VibeTheme.colors.accent : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${msg.role === 'user' ? 'transparent' : 'rgba(255,255,255,0.05)'}`,
                                fontSize: '13px',
                                lineHeight: '1.6',
                                position: 'relative',
                                boxShadow: msg.role === 'user' ? `0 10px 20px -10px ${VibeTheme.colors.accent}44` : 'none'
                             }}>
                                {showDots ? (
                                    <div style={{ display: 'flex', gap: '4px', height: '24px', alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <motion.span
                                                key={i}
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                style={{ width: '5px', height: '5px', borderRadius: '50%', background: VibeTheme.colors.accent }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                )}

                                {msg.role === 'assistant' && msg.commands && msg.commands.length > 0 && (
                                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '9px', color: VibeTheme.colors.accent, fontWeight: 900, letterSpacing: '1px' }}>
                                        {msg.commands.length} ELITE COMMANDS EXECUTED
                                    </div>
                                )}

                                {isThinking && isLast && msg.role === 'assistant' && (
                                    <VibeButton 
                                        size="xs" 
                                        variant="ghost" 
                                        onClick={() => setIsThinking(false)}
                                        style={{ marginTop: '12px', color: '#ef4444', fontSize: '9px', fontWeight: 900 }}
                                    >
                                        <VibeIcons name="Stop" size={10} style={{ marginRight: '6px' }} /> STOP NEURAL LINK
                                    </VibeButton>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Input - Sovereign Minimalist Edition */}
            <div style={{ padding: '20px', borderTop: `1px solid ${VibeTheme.colors.glassBorder}`, background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '4px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Neural Copilot'a sor veya / komut kullan..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            padding: '10px 16px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    <VibeButton 
                        variant="primary" 
                        size="sm" 
                        onClick={handleSend} 
                        disabled={isThinking || !input.trim()}
                        style={{ borderRadius: '10px', minWidth: '40px' }}
                    >
                        {isThinking ? <VibeIcons name="Loader" size={14} className="animate-spin" /> : <VibeIcons name="Send" size={14} />}
                    </VibeButton>
                </div>
            </div>
        </div>
    );
};
