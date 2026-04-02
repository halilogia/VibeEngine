import React from 'react';
import { motion } from 'framer-motion';
import { VibeIcons } from '@ui/common/VibeIcons';
import { VibeTheme } from '@themes/VibeStyles';
import { Message } from './types';

interface MessageListProps {
    messages: Message[];
    isThinking: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ThinkingBlock: React.FC<{ thought: string }> = ({ thought }) => {
    const [collapsed, setCollapsed] = React.useState(true);
    return (
        <div style={{ 
            marginBottom: '10px', padding: '10px', 
            borderRadius: '10px',
            background: `${VibeTheme.colors.bgPrimary}66`,
            border: `1px solid ${VibeTheme.colors.glassBorder}`,
            color: VibeTheme.colors.textSecondary, fontStyle: 'italic',
            fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
            <div 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', opacity: 0.7 }}
                onClick={() => setCollapsed(!collapsed)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VibeIcons name="Brain" size={14} />
                    <span style={{ fontWeight: 800, letterSpacing: '0.05em' }}>REASONING</span>
                </div>
                <VibeIcons name="ChevronDown" size={12} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }} />
            </div>
            {!collapsed && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 0.8 }} 
                    style={{ whiteSpace: 'pre-wrap', overflow: 'hidden', borderTop: `1px solid ${VibeTheme.colors.glassBorder}`, marginTop: '6px', paddingTop: '6px' }}
                >
                    {thought}
                </motion.div>
            )}
        </div>
    );
};

export const MessageList: React.FC<MessageListProps> = ({ messages, isThinking, messagesEndRef }) => {
    return (
        <div 
            ref={messagesEndRef} 
            className="ai-message-list"
            style={{ 
                flex: 1, overflowY: 'auto', padding: '20px', 
                display: 'flex', flexDirection: 'column', gap: '16px',
                userSelect: 'text' 
            }}
        >
            {messages.length === 0 && (
                <div style={{ opacity: 0.2, textAlign: 'center', marginTop: '100px' }}>
                    <VibeIcons name="Bot" size={64} style={{ color: VibeTheme.colors.textSecondary }} />
                </div>
            )}
            
            {messages.map((msg, idx) => {
                const showDots = msg.role === 'assistant' && !msg.content.trim() && !msg.thought && (isThinking || msg.streaming);
                return (
                    <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', userSelect: 'text' }}
                    >
                        <div style={{ 
                            padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                            background: msg.role === 'user' ? VibeTheme.colors.accent : VibeTheme.colors.bgSubtle,
                            border: `1px solid ${msg.role === 'user' ? 'transparent' : VibeTheme.colors.glassBorder}`,
                            fontSize: '13px', lineHeight: '1.6', position: 'relative',
                            boxShadow: msg.role === 'user' ? `0 10px 20px -10px ${VibeTheme.colors.accent}44` : 'none',
                            cursor: 'text'
                        }}>
                            {/* AI Reasoning / Thought Block */}
                            {msg.thought && <ThinkingBlock thought={msg.thought} />}

                            {showDots ? (
                                <div style={{ display: 'flex', gap: '8px', height: '24px', alignItems: 'center', color: VibeTheme.colors.accent, fontSize: '11px', fontWeight: 700 }}>
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>THINKING...</motion.div>
                                    {[0,1,2].map(i => <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }} style={{ width: '4px', height: '4px', borderRadius: '50%', background: VibeTheme.colors.accent }} />)}
                                </div>
                            ) : <div style={{ whiteSpace: 'pre-wrap', color: msg.role === 'user' ? '#fff' : VibeTheme.colors.textMain }}>{msg.content}</div>}
                            
                            {msg.commands && msg.commands.length > 0 && (
                                <div style={{ 
                                    marginTop: '12px', paddingTop: '10px', 
                                    borderTop: `1px dotted ${VibeTheme.colors.glassBorder}`, 
                                    display: 'flex', flexWrap: 'wrap', gap: '6px' 
                                }}>
                                    {msg.commands.map((cmd: any, cIdx: number) => (
                                        <div key={cIdx} style={{ 
                                            background: `${VibeTheme.colors.accent}11`,
                                            padding: '4px 10px', borderRadius: '6px',
                                            border: `1px solid ${VibeTheme.colors.accent}44`,
                                            fontSize: '9px', fontWeight: 900,
                                            color: VibeTheme.colors.accent,
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            boxShadow: `0 0 10px ${VibeTheme.colors.accent}22`,
                                            letterSpacing: '0.05em'
                                        }}>
                                            <VibeIcons name="Zap" size={10} />
                                            {cmd.type.toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
