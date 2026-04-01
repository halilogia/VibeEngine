/**
 * AICopilotPanel - Chat interface for AI-powered scene authoring
 * Connected to Ollama for real LLM responses.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Wand2, Trash2, Grid, Cpu, ChevronDown, WifiOff, Loader2 } from 'lucide-react';
import { CommandInterpreter } from '../bridge';
import { OllamaService, type OllamaMessage } from '../bridge/OllamaService';
import { useEditorStore } from '../stores';
import './AICopilotPanel.css';

// #region Types
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    commands?: Array<{ type: string; params: Record<string, unknown> }>;
    streaming?: boolean;
}

interface OllamaModel {
    id: string;
    name: string;
    provider: string;
}

const DEFAULT_MODELS: OllamaModel[] = [
    { id: 'llama3:8b', name: 'Llama 3 (8B)', provider: 'Ollama' },
];
// #endregion

export const AICopilotPanel: React.FC = () => {
    const { activePanelId, setActivePanel } = useEditorStore();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your VibeEngine AI Copilot powered by Ollama. Try asking me to "add a red cube" or "create a point light".',
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const [ollamaReady, setOllamaReady] = useState<boolean | null>(null);
    const [availableModels, setAvailableModels] = useState<OllamaModel[]>(DEFAULT_MODELS);
    const [selectedModel, setSelectedModel] = useState<OllamaModel>(DEFAULT_MODELS[0]);
    const [showModelMenu, setShowModelMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // #region Lifecycle
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        OllamaService.isAvailable().then(async (available) => {
            setOllamaReady(available);
            if (available) {
                console.log('✅ [OllamaService] Connected to local Ollama server');
                const modelNames = await OllamaService.listModels();
                if (modelNames.length > 0) {
                    const fetchedModels = modelNames.map(name => ({
                        id: name,
                        name: name.charAt(0).toUpperCase() + name.slice(1).replace(':latest', ''),
                        provider: 'Ollama'
                    }));
                    setAvailableModels(fetchedModels);
                    setSelectedModel(fetchedModels[0]);
                }
            } else {
                console.warn('⚠️ [OllamaService] Ollama not reachable at localhost:11434');
            }
        });
    }, []);
    // #endregion

    // #region Chat
    const buildOllamaMessages = (history: Message[]): OllamaMessage[] =>
        history
            .filter(m => !m.streaming)
            .map(m => ({ role: m.role, content: m.content }));

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        const currentInput = input.trim();
        setInput('');
        setMessages(prev => [...prev, userMessage]);
        setIsThinking(true);

        if (!ollamaReady) {
            // Fallback to mock if Ollama not available
            setTimeout(() => {
                const response = getMockResponse(currentInput);
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.text,
                    timestamp: new Date(),
                    commands: response.commands
                };
                setMessages(prev => [...prev, assistantMessage]);
                setIsThinking(false);
                if (response.commands.length > 0) {
                    setTimeout(() => CommandInterpreter.executeBatch(response.commands as Parameters<typeof CommandInterpreter.executeBatch>[0]), 300);
                }
            }, 600);
            return;
        }

        // Real Ollama streaming
        const streamingId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
            id: streamingId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            streaming: true
        }]);

        abortRef.current = new AbortController();

        try {
            const historyMessages = buildOllamaMessages([...messages, userMessage]);

            let fullContent = '';
            await OllamaService.chat({
                model: selectedModel.id,
                messages: historyMessages,
                signal: abortRef.current.signal,
                onToken: (token) => {
                    fullContent += token;
                    setMessages(prev => prev.map(m =>
                        m.id === streamingId ? { ...m, content: fullContent } : m
                    ));
                }
            });

            // Extract and execute commands from complete response
            const commands = OllamaService.extractCommands(fullContent);

            setMessages(prev => prev.map(m =>
                m.id === streamingId ? { ...m, streaming: false, commands } : m
            ));

            if (commands.length > 0) {
                console.log(`🤖 [AI] Executing ${commands.length} scene commands`);
                setTimeout(() => CommandInterpreter.executeBatch(commands as Parameters<typeof CommandInterpreter.executeBatch>[0]), 300);
            }
        } catch (e) {
            const errMsg = (e instanceof Error && e.name !== 'AbortError')
                ? `⚠️ Ollama error: ${e.message}`
                : 'Request cancelled.';

            setMessages(prev => prev.map(m =>
                m.id === streamingId ? { ...m, content: errMsg, streaming: false } : m
            ));
        } finally {
            setIsThinking(false);
            abortRef.current = null;
        }
    };
    // #endregion

    // #region Mock Fallback
    const getMockResponse = (prompt: string) => {
        const low = prompt.toLowerCase();
        if (low.includes('cube') || low.includes('box')) {
            return { text: "Added a cube to the scene!", commands: [{ type: 'add_entity', params: { name: 'Cube' } }] };
        }
        if (low.includes('light')) {
            return { text: "Added a point light!", commands: [{ type: 'add_entity', params: { name: 'Point Light' } }] };
        }
        return { text: `Ollama is not running. Start it with: ollama serve\nThen select a model with: ollama pull ${selectedModel.id}`, commands: [] };
    };
    // #endregion

    const clearHistory = () => {
        abortRef.current?.abort();
        setMessages([{
            id: '1', role: 'assistant',
            content: 'Chat cleared. How can I help?',
            timestamp: new Date()
        }]);
    };

    return (
        <div 
            className={`editor-panel ai-copilot-panel glass-panel ${activePanelId === 'aiCopilot' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('aiCopilot')}
        >
            <div className="editor-panel-header">
                {/* Model Selector */}
                <div className="model-selector-container">
                    <button className="model-selector" onClick={() => setShowModelMenu(!showModelMenu)}>
                        {ollamaReady === false
                            ? <WifiOff size={14} style={{ color: '#ef4444' }} />
                            : ollamaReady === null
                                ? <Loader2 size={14} className="spin" />
                                : <Cpu size={14} className="model-icon" />
                        }
                        <span className="model-name">{selectedModel.name}</span>
                        <ChevronDown size={14} className={`chevron ${showModelMenu ? 'rotate' : ''}`} />
                    </button>
                    {showModelMenu && (
                        <div className="model-menu">
                            {availableModels.map(model => (
                                <div
                                    key={model.id}
                                    className={`model-option ${selectedModel.id === model.id ? 'active' : ''}`}
                                    onClick={() => { setSelectedModel(model); setShowModelMenu(false); }}
                                >
                                    <span className="option-name">{model.name}</span>
                                    <span className="option-provider">{model.provider}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {ollamaReady === false && (
                    <span className="ollama-status offline">Ollama Offline</span>
                )}
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
                                <div className="message-content">
                                    {msg.content}
                                    {msg.streaming && <span className="cursor-blink">▌</span>}
                                </div>
                                {msg.commands && msg.commands.length > 0 && (
                                    <div className="message-footer">
                                        <Wand2 size={10} />
                                        <span>Executed {msg.commands.length} commands</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isThinking && !messages.some(m => m.streaming) && (
                        <div className="chat-message assistant">
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
                <div className="quick-actions">
                    <button className="chip" onClick={() => { setInput('Add a red cube'); handleSend(); }}>
                        <Sparkles size={12} /> Red Cube
                    </button>
                    <button className="chip" onClick={() => { setInput('Create a point light'); handleSend(); }}>
                        <Wand2 size={12} /> Add Light
                    </button>
                    <button className="chip" onClick={() => { setInput('Make the selected entity spin'); handleSend(); }}>
                        <Grid size={12} /> Spin
                    </button>
                    <button className="chip" onClick={() => { setInput('Add a player character with physics'); handleSend(); }}>
                        <User size={12} /> Player
                    </button>
                </div>
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder={ollamaReady ? `Ask ${selectedModel.name}...` : 'Ollama offline — mock mode active'}
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
