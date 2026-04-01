/**
 * AICopilotPanel (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useRef, useEffect } from 'react';
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
                if (models.length > 0) {
                    setSelectedModel(models[0]);
                }
            }
        };
        checkOllama();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
        setInput('');
        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);

        try {
            if (ollamaReady && selectedModel) {
                const ollamaMessages: OllamaMessage[] = messages.concat(userMsg).map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }));

                const assistantMsgId = (Date.now() + 1).toString();
                let streamedContent = '';

                // Create placeholder for streaming
                setMessages(prev => [...prev, {
                    id: assistantMsgId,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                    streaming: true
                }]);

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
                    const assistantMsg: Message = { 
                        id: (Date.now()+1).toString(), 
                        role: 'assistant', 
                        content: ollamaReady ? "Please select a model first." : "Ollama is not running. Please start Ollama to use AI Copilot.", 
                        timestamp: new Date() 
                    };
                    setMessages(prev => [...prev, assistantMsg]);
                }, 1000);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date()
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const headerActions = (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {ollamaReady !== null && (
                <div 
                    title={ollamaReady ? "Ollama Connected" : "Ollama Disconnected"}
                    style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: ollamaReady ? '#10b981' : '#ef4444',
                        boxShadow: ollamaReady ? '0 0 10px #10b981' : 'none'
                    }} 
                />
            )}
            
            {ollamaReady && availableModels.length > 0 && (
                <div style={{ position: 'relative' }}>
                    <VibeButton 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowModelSelector(!showModelSelector)}
                        style={{ fontSize: '10px', color: VibeTheme.colors.accent, fontWeight: 800 }}
                    >
                        {selectedModel || 'SELECT MODEL'}
                    </VibeButton>
                    
                    {showModelSelector && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            background: '#1a1a2e',
                            border: `1px solid ${VibeTheme.colors.glassBorder}`,
                            borderRadius: '8px',
                            zIndex: 100,
                            marginTop: '4px',
                            minWidth: '150px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}>
                            {availableModels.map(m => (
                                <div 
                                    key={m}
                                    onClick={() => { setSelectedModel(m); setShowModelSelector(false); }}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        color: selectedModel === m ? VibeTheme.colors.accent : '#fff',
                                        background: selectedModel === m ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                    }}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <VibeButton variant="ghost" size="sm" onClick={() => setMessages([messages[0]])}>
                <VibeIcons name="Trash" size={14} />
            </VibeButton>
        </div>
    );

    return (
        <div 
            className={`editor-panel ai-panel ${activePanelId === 'ai' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('ai')}
            style={styles.panel}
        >
            <style dangerouslySetInnerHTML={{ __html: aiAnimations }} />
            <SovereignHeader title="AI COPILOT" icon="Sparkles" dragHandleProps={dragHandleProps} actions={headerActions} />

            <div style={styles.chatArea}>
                {messages.map(msg => (
                    <div key={msg.id} style={{ ...styles.message, ...(msg.role === 'user' ? styles.messageUser : {}) }}>
                        <div style={{ ...styles.avatar, ...(msg.role === 'user' ? styles.avatarUser : {}) }}>
                            <VibeIcons name={msg.role === 'user' ? 'User' : 'Bot'} size={16} />
                        </div>
                        <div style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.bubbleUser : {}) }}>
                            {msg.content}
                            {msg.role === 'assistant' && msg.commands && msg.commands.length > 0 && (
                                <div style={{ 
                                    marginTop: '10px', 
                                    paddingTop: '8px', 
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    fontSize: '11px',
                                    color: VibeTheme.colors.accent,
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <VibeIcons name="CheckCircle" size={12} />
                                    {msg.commands.length} COMMANDS EXECUTED
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div style={styles.message}>
                        <div style={styles.avatar}>
                            <VibeIcons name="Bot" size={16} />
                        </div>
                        <div style={{ ...styles.bubble, opacity: 0.6 }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <span style={{ animation: 'pulse 1s infinite' }}>•</span>
                                <span style={{ animation: 'pulse 1s infinite 0.2s' }}>•</span>
                                <span style={{ animation: 'pulse 1s infinite 0.4s' }}>•</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
                <div style={styles.quickActions}>
                    {['Add Light', 'Create Cube', 'Physics Mesh'].map(act => (
                        <VibeButton key={act} variant="secondary" size="sm" onClick={() => { setInput(act); handleSend(); }} style={{ borderRadius: '20px', fontSize: '10px' }}>
                            {act}
                        </VibeButton>
                    ))}
                </div>
                <div style={styles.inputWrapper}>
                    <VibeInput 
                        placeholder="Ask AI Copilot..." 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        style={{ border: 'none', background: 'transparent' }}
                    />
                    <VibeButton variant="primary" size="sm" onClick={handleSend} disabled={!input.trim()}>
                        <VibeIcons name="Send" size={14} />
                    </VibeButton>
                </div>
            </div>
        </div>
    );
};
