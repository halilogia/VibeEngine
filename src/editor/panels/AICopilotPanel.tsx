/**
 * AICopilotPanel - Chat interface for AI-powered scene authoring
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Wand2, Trash2 } from 'lucide-react';
import { CommandInterpreter, SceneContext } from '../bridge';
import './AICopilotPanel.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    commands?: any[];
}

export const AICopilotPanel: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your VibeEngine AI Co-pilot. How can I help you build your scene today?',
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);

        // Simulation of AI processing
        setTimeout(() => {
            const response = processCommand(input);
            
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.text,
                timestamp: new Date(),
                commands: response.commands
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsThinking(false);

            // Execute commands if any with a subtle delay for 'AI feeling'
            if (response.commands && response.commands.length > 0) {
                setTimeout(() => {
                    CommandInterpreter.executeBatch(response.commands);
                }, 500);
            }
        }, 800);
    };

    /**
     * Mock command processor for prototype phase
     */
    const processCommand = (prompt: string): { text: string; commands: any[] } => {
        const lowerPrompt = prompt.toLowerCase();
        const selectedId = useEditorStore.getState().selectedEntityId;
        
        if (lowerPrompt.includes('pirate') || lowerPrompt.includes('battle')) {
            return {
                text: "Captain on deck! I've set up a pirate battle arena. I added an ocean, a central island, and your ship.",
                commands: [
                    { type: 'spawn_prefab', params: { prefabName: 'OceanTile' } },
                    { type: 'spawn_prefab', params: { prefabName: 'Island', position: [0, -0.5, 0] } },
                    { type: 'spawn_prefab', params: { prefabName: 'PirateShip', position: [5, 0.5, 5] } }
                ]
            };
        }

        if (lowerPrompt.includes('character') || lowerPrompt.includes('player')) {
            return {
                text: "I've added a playable character to the scene. You can control it with WASD when you press Play.",
                commands: [
                    { type: 'spawn_prefab', params: { prefabName: 'PlayerCharacter', position: [0, 0.5, -2] } }
                ]
            };
        }

        if (lowerPrompt.includes('move') || lowerPrompt.includes('wasd') || lowerPrompt.includes('control')) {
            if (selectedId) {
                return {
                    text: `I've attached player controls to entity #${selectedId}. It will now respond to WASD!`,
                    commands: [
                        { type: 'add_component', params: { entityId: selectedId, componentType: 'Script', data: { scriptName: 'PlayerMoveScript' } } },
                        { type: 'add_component', params: { entityId: selectedId, componentType: 'Collision', data: { colliderType: 'box' } } }
                    ]
                };
            }
            return { text: "I can make things move, but please select an entity in the hierarchy first!", commands: [] };
        }

        if (lowerPrompt.includes('rotate') || lowerPrompt.includes('spin')) {
            if (selectedId) {
                return {
                    text: `I've added a rotation behavior to entity #${selectedId}. It will now spin!`,
                    commands: [
                        { type: 'add_component', params: { entityId: selectedId, componentType: 'Script', data: { scriptName: 'RotatorScript', data: { speed: 2 } } } }
                    ]
                };
            }
            return { text: "Which object should I rotate? Please select one!", commands: [] };
        }

        if (lowerPrompt.includes('light') || lowerPrompt.includes('sun')) {
            return {
                text: "I've added a sun-like directional light to illuminate your world.",
                commands: [
                    { type: 'add_entity', params: { name: 'Sun' } },
                    { type: 'add_component', params: { entityId: 100, componentType: 'Light', data: { lightType: 'directional', intensity: 1.2 } } }
                ]
            };
        }

        return {
            text: "I understood your request: '" + prompt + "'. In the final version, I will use Gemini to generate specific commands for this. For now, try asking for a 'pirate scene'!",
            commands: []
        };
    };

    const clearHistory = () => {
        setMessages([{
            id: '1',
            role: 'assistant',
            content: 'Chat history cleared. How can I help you?',
            timestamp: new Date()
        }]);
    };

    return (
        <div className="editor-panel ai-copilot-panel">
            <div className="editor-panel-header">
                <div className="panel-title">
                    <Sparkles size={16} className="title-icon" />
                    <span>AI Co-pilot</span>
                </div>
                <div className="panel-actions">
                    <button className="panel-action-btn" onClick={clearHistory} title="Clear Chat">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="editor-panel-content">
                <div className="chat-history">
                    {messages.map(msg => (
                        <div key={msg.id} className={`chat-message ${msg.role}`}>
                            <div className="message-icon">
                                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className="message-bubble">
                                <div className="message-content">{msg.content}</div>
                                {msg.commands && msg.commands.length > 0 && (
                                    <div className="message-footer">
                                        <Wand2 size={10} />
                                        <span>Executed {msg.commands.length} commands</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="chat-message assistant thinking">
                            <div className="message-icon"><Bot size={16} /></div>
                            <div className="message-bubble">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="panel-footer chat-input-area">
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Say something like 'Create a pirate scene'..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="send-btn" onClick={handleSend} disabled={!input.trim() || isThinking}>
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
