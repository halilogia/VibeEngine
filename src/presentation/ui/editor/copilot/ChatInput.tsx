import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { VibeTheme } from '@themes/VibeStyles';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';

interface ChatInputProps {
    input: string;
    setInput: (val: string) => void;
    handleSend: () => void;
    isThinking: boolean;
    onFocus: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSend, isThinking, onFocus }) => {
    return (
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
                    onFocus={onFocus}
                />
            </div>
            
            <VibeButton 
                variant="primary" 
                size="sm" 
                onClick={handleSend} 
                disabled={!isThinking && !input.trim()} 
                style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '12px', 
                    background: isThinking ? '#ef4444' : VibeTheme.colors.accent,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px -4px ${isThinking ? '#ef4444' : VibeTheme.colors.accent}44`,
                    padding: 0
                }}
            >
                <VibeIcons name={isThinking ? "Square" : "Send"} size={16} color="#fff" />
            </VibeButton>
        </div>
    );
};
