/**
 * GitHubCopilotService - Connection to GitHub Models API.
 * Uses GitHub Personal Access Tokens (PAT) to access GPT-4o and other models.
 */

import { VIBE_ENGINE_SYSTEM_PROMPT } from './OllamaService';
import { VibeVault } from '@infrastructure/security/VibeVault';
import type { AIChatMessage, AIChatOptions, AIChatResult } from './OpenRouterService';

export class GitHubCopilotService {
    private static readonly BASE_URL = 'https://models.inference.ai.azure.com';

    /**
     * Send a chat request to GitHub Models API with streaming support.
     * Requires a GitHub Personal Access Token (PAT).
     */
    static async chat(options: AIChatOptions): Promise<AIChatResult> {
        const { model, messages, apiKey, onToken, signal } = options;

        const systemMessages: AIChatMessage[] = [
            { role: 'system', content: VIBE_ENGINE_SYSTEM_PROMPT },
            ...messages
        ];

        const response = await fetch(`${this.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'gpt-4o', // Default to GPT-4o if not specified
                messages: systemMessages,
                stream: true
            }),
            signal
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`GitHub Copilot API (Models) error ${response.status}: ${err}`);
        }

        if (!response.body) throw new Error('No response stream from GitHub Copilot');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullContent += content;
                            onToken?.(content);
                        }
                    } catch {
                        // Partial JSON chunk
                    }
                }
            }
        }

        return { content: fullContent, done: true };
    }
}
