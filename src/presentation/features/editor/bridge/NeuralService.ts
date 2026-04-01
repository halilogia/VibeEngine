/**
 * NeuralService - The unified gateway for all AI providers in VibeEngine.
 * Orchestrates Ollama, GitHub Copilot, and OpenRouter services.
 */
import { VibeVault } from '@infrastructure/security/VibeVault';

import { OllamaService } from './OllamaService';
import { OpenRouterService, type AIChatMessage, type AIChatOptions } from './OpenRouterService';
import { GitHubCopilotService } from './GitHubCopilotService';

export type AIProvider = 'ollama' | 'github' | 'openrouter';

export class NeuralService {
    /**
     * Central chat dispatcher. Routes requests to the appropriate provider.
     */
    static async chat(options: AIChatOptions & { provider: AIProvider }): Promise<{ content: string; done: boolean }> {
        const { provider, ...chatOptions } = options;

        switch (provider) {
            case 'github':
                return GitHubCopilotService.chat(chatOptions);
            case 'openrouter':
                return OpenRouterService.chat(chatOptions);
            case 'ollama':
            default:
                // OllamaService matches the standard interface
                return OllamaService.chat({
                    model: chatOptions.model,
                    messages: chatOptions.messages as any,
                    onToken: chatOptions.onToken,
                    signal: chatOptions.signal
                });
        }
    }

    /**
     * Returns a list of default models for cloud providers or queries Ollama for local.
     */
    static async getAvailableModels(provider: AIProvider): Promise<string[]> {
        switch (provider) {
            case 'ollama':
                return OllamaService.listModels();
            case 'github':
                return [
                    'gpt-4o',
                    'gpt-4o-mini',
                    'phi-3.5-moe-instruct',
                    'llama-3.1-405b-instruct',
                    'meta-llama-3.1-70b-instruct'
                ];
            case 'openrouter':
                return [
                    'anthropic/claude-3.5-sonnet',
                    'openai/gpt-4o',
                    'meta-llama/llama-3.1-405b',
                    'google/gemini-pro-1.5',
                    'mistralai/mistral-large'
                ];
            default:
                return [];
        }
    }

    /**
     * Helper to extract commands from strings (delegates to OllamaService implementation).
     */
    static extractCommands(content: string) {
        return OllamaService.extractCommands(content);
    }
}
