import { useState, useEffect, useRef } from 'react';
import { Message, ModelOption } from './types';
import { NeuralService, type AIProvider } from '../../../features/editor/bridge/NeuralService';
import { VibeVault } from '@infrastructure/security/VibeVault';
import { CommandInterpreter } from '../../../features/editor/bridge/AICopilot';
import { NeuralContextService } from '@infrastructure/services/NeuralContextService';

export function useAICopilot() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [activeProvider, setActiveProvider] = useState<AIProvider>((localStorage.getItem('vibe_ai_provider') as AIProvider) || 'ollama');
    const [selectedModel, setSelectedModel] = useState<string>(localStorage.getItem('vibe_last_ai_model') || '');
    const [allModels, setAllModels] = useState<ModelOption[]>([]);
    
    // Model search and menu state
    const [showModelMenu, setShowModelMenu] = useState(false);
    const [modelSearch, setModelSearch] = useState('');

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
        if (!input.trim() && !isThinking) return;

        const dynamicGithubKey = VibeVault.getSecret('github') || '';
        const dynamicOpenrouterKey = VibeVault.getSecret('openrouter') || '';
        
        const providerKey = activeProvider === 'ollama' ? null : (activeProvider === 'github' ? dynamicGithubKey : dynamicOpenrouterKey);
        
        const isLocal = activeProvider === 'ollama' || selectedModel.toLowerCase().includes('ollama');

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
        const assistantMsgId = (Date.now() + 1).toString();
        
        if (isThinking) {
            setIsThinking(false);
            return;
        }

        if (!isLocal && !providerKey) {
            const errorMsg = `To use ${selectedModel} (${activeProvider}), please add your API Key in Settings.`;
            setMessages(prev => [...prev, userMsg, { 
                id: assistantMsgId, 
                role: 'assistant', 
                content: `Neural connection failed: ${errorMsg}\n\nTip: You can switch to **Ollama** models below to work offline without a key.`, 
                streaming: false,
                timestamp: new Date()
            }]);
            setIsThinking(false);
            setInput('');
            return;
        }

        setInput('');
        setMessages(prev => [...prev, userMsg, { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date(), streaming: true }]);
        setIsThinking(true);

        try {
            const context = NeuralContextService.getFullContext();
            const history = [
                { role: 'system', content: context },
                ...messages.concat(userMsg).map(m => ({ role: m.role as any, content: m.content }))
            ];
            let streamedContent = '';

            const result = await NeuralService.chat({
                provider: activeProvider,
                model: selectedModel || (activeProvider === 'ollama' ? 'llama3:8b' : 
                                       activeProvider === 'github' ? 'gpt-4o' : 'openai/gpt-oss-20b'),
                messages: history,
                apiKey: providerKey || '',
                onToken: (token: string) => {
                    streamedContent += token;
                    
                    // Logic to separate <think> content from main answer
                    let currentThought = '';
                    let finalAnswer = streamedContent;

                    const thinkMatch = streamedContent.match(/<think>([\s\S]*?)(<\/think>|$)/);
                    if (thinkMatch) {
                        currentThought = thinkMatch[1];
                        finalAnswer = streamedContent.replace(/<think>[\s\S]*?(<\/think>|$)/, '').trim();
                    }

                    setMessages(prev => prev.map(m => m.id === assistantMsgId ? { 
                        ...m, 
                        content: finalAnswer, 
                        thought: currentThought || undefined,
                        thoughtCollapsed: true // Default to collapsed once it starts answering
                    } : m));
                }
            });

            const finalTokens = streamedContent;
            let finalThought = '';
            let finalContent = finalTokens;
            const finalThinkMatch = finalTokens.match(/<think>([\s\S]*?)<\/think>/);
            if (finalThinkMatch) {
                finalThought = finalThinkMatch[1];
                finalContent = finalTokens.replace(/<think>[\s\S]*?<\/think>/, '').trim();
            }

            const commands = NeuralService.extractCommands(finalContent);
            if (commands.length > 0) await CommandInterpreter.executeBatch(commands as any);

            setMessages(prev => prev.map(m => m.id === assistantMsgId ? { 
                ...m, 
                streaming: false, 
                content: finalContent,
                thought: finalThought || undefined,
                commands 
            } : m));
        } catch (error) {
            const content = `Neural Link Error: ${error instanceof Error ? error.message : String(error)}`;
            setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content, streaming: false } : m));
        } finally {
            setIsThinking(false);
        }
    };

    return {
        input, setInput,
        messages, setMessages,
        isThinking, setIsThinking,
        activeProvider,
        selectedModel,
        allModels,
        handleModelChange,
        handleSend,
        showModelMenu, setShowModelMenu,
        modelSearch, setModelSearch
    };
}
