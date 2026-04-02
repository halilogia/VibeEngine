/**
 * AICopilotPanel (Sovereign Elite Edition)
 * 🏛️⚛️💎🚀
 * Refactored for Modular Excellence
 * 
 * - [x] Create `src/infrastructure/services/NeuralContextService.ts` for scene serialization.
 * - [x] Modify `useAICopilot` (UI/Logic) to fetch and inject context on every message.
 * - [x] Add "Scene Synced" UI indicator in `AICopilotPanel.tsx`.
 * - [x] Phase 1 Complete: AI now has "Eyes" and can see the scene state.
 * 
 * ## Next Steps:
 * - Prepare Phase 2: Agentic Tool-Calling (The "Hands").
 */

import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '@infrastructure/store';
import { VibeTheme } from '@themes/VibeStyles';
import { aiAnimations } from './AICopilotPanel.styles';

// Internal Modular Components
import { useAICopilot } from './copilot/useAICopilot';
import { ModelSelector } from './copilot/ModelSelector';
import { MessageList } from './copilot/MessageList';
import { ChatInput } from './copilot/ChatInput';
import { AICopilotPanelProps } from './copilot/types';

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({ dragHandleProps }) => {
    const { 
        input, setInput,
        messages,
        isThinking,
        activeProvider,
        selectedModel,
        allModels,
        handleModelChange,
        handleSend,
        showModelMenu, setShowModelMenu,
        modelSearch, setModelSearch
    } = useAICopilot();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                @keyframes pulse-sync {
                    0% { transform: scale(0.9); opacity: 0.6; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.9); opacity: 0.6; }
                }
                .sync-dot {
                    width: 6px;
                    height: 6px;
                    background: ${VibeTheme.colors.accent};
                    border-radius: 50%;
                    box-shadow: 0 0 8px ${VibeTheme.colors.accent};
                    animation: pulse-sync 2s infinite ease-in-out;
                }
            ` }} />
            
            <MessageList 
                messages={messages} 
                isThinking={isThinking} 
                messagesEndRef={messagesEndRef} 
            />

            <div style={{ padding: '20px', borderTop: `1px solid ${VibeTheme.colors.glassBorder}`, background: VibeTheme.colors.bgSecondary, position: 'relative' }}>
                <div style={{ 
                    position: 'absolute', top: '-10px', left: '20px', 
                    background: VibeTheme.colors.bgPrimary, 
                    padding: '2px 10px', borderRadius: '10px',
                    border: `1px solid ${VibeTheme.colors.glassBorder}`,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
                    color: VibeTheme.colors.accent, zIndex: 5
                }}>
                    <div className="sync-dot" />
                    SCENE CONTEXT SYNCED
                </div>
                <ModelSelector 
                    showModelMenu={showModelMenu}
                    setShowModelMenu={setShowModelMenu}
                    modelSearch={modelSearch}
                    setModelSearch={setModelSearch}
                    allModels={allModels}
                    activeProvider={activeProvider}
                    selectedModel={selectedModel}
                    handleModelChange={handleModelChange}
                />

                <ChatInput 
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    isThinking={isThinking}
                    onFocus={() => setShowModelMenu(false)}
                />
            </div>
        </div>
    );
};
