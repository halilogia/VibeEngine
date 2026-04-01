/**
 * AICopilotPanel (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useRef, useEffect } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { CommandInterpreter } from '../bridge';
import { OllamaService, type OllamaMessage } from '../bridge/OllamaService';
import { useEditorStore } from '../stores';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        OllamaService.isAvailable().then(setOllamaReady);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
        setInput('');
        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);

        // Mock response for now (Same as original logic)
        setTimeout(() => {
            const assistantMsg: Message = { 
                id: (Date.now()+1).toString(), 
                role: 'assistant', 
                content: "I've processed your request. Command executed.", 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, assistantMsg]);
            setIsThinking(false);
        }, 1000);
    };

    const headerActions = (
        <VibeButton variant="ghost" size="sm" onClick={() => setMessages([messages[0]])}>
            <VibeIcons name="Trash" size={14} />
        </VibeButton>
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
                        </div>
                    </div>
                ))}
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
