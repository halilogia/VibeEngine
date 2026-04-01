/**
 * OllamaService - Real-time connection to Ollama local LLM server.
 * Handles streaming chat requests and parses AI commands from responses.
 *
 * @example
 * const result = await OllamaService.chat('llama3:8b', messages, onToken);
 */

export interface OllamaMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OllamaChatOptions {
    model: string;
    messages: OllamaMessage[];
    onToken?: (token: string) => void;
    signal?: AbortSignal;
}

export interface OllamaChatResult {
    content: string;
    done: boolean;
}

const OLLAMA_BASE_URL = 'http://localhost:11434';

/**
 * Engine system prompt: instructs the LLM to respond with JSON commands
 * when it wants to manipulate the scene.
 */
export const VIBE_ENGINE_SYSTEM_PROMPT = `You are VibeEngine AI Copilot, an AI assistant embedded inside a 3D game engine.

You can help users by:
1. Answering questions about game development
2. Controlling the scene by emitting JSON commands

When you want to modify the scene, output a JSON block like this ANYWHERE in your response:
\`\`\`json
[
  { "type": "add_entity", "params": { "name": "Cube" } },
  { "type": "add_component", "params": { "entityId": 1, "componentType": "Render", "data": { "meshType": "cube", "color": "#6366f1" } } }
]
\`\`\`

Available commands:
- add_entity: { name: string }
- remove_entity: { entityId: number }
- rename_entity: { entityId: number, name: string }
- add_component: { entityId: number, componentType: "Transform"|"Render"|"Light"|"Camera"|"Physics"|"Script", data: object }
- update_component: { entityId: number, componentType: string, data: object }
- remove_component: { entityId: number, componentType: string }

Render meshTypes: "cube", "sphere", "plane", "cylinder", "cone"
Light types: "directional", "point", "spot"

Always be helpful and concise. If the user asks to create something, emit the appropriate commands.`;

/**
 * OllamaService — Communicates with the local Ollama REST API.
 */
export class OllamaService {
    /**
     * Check if Ollama server is reachable.
     */
    static async isAvailable(): Promise<boolean> {
        try {
            const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
                signal: AbortSignal.timeout(2000)
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    /**
     * Fetch the list of locally available models.
     */
    static async listModels(): Promise<string[]> {
        try {
            const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
            if (!res.ok) return [];
            const data = await res.json() as { models: Array<{ name: string }> };
            return data.models.map(m => m.name);
        } catch {
            return [];
        }
    }

    /**
     * Send a chat request to Ollama with optional streaming token callback.
     * Uses the streaming `/api/chat` endpoint for real-time feel.
     *
     * @param options - Chat options including model, messages, and callbacks
     * @returns The complete assistant response
     */
    static async chat(options: OllamaChatOptions): Promise<OllamaChatResult> {
        const { model, messages, onToken, signal } = options;

        const systemMessages: OllamaMessage[] = [
            { role: 'system', content: VIBE_ENGINE_SYSTEM_PROMPT },
            ...messages
        ];

        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages: systemMessages,
                stream: true
            }),
            signal
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Ollama API error ${response.status}: ${err}`);
        }

        if (!response.body) {
            throw new Error('No response stream from Ollama');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line) as {
                        message?: { content: string };
                        done?: boolean;
                    };

                    if (parsed.message?.content) {
                        fullContent += parsed.message.content;
                        onToken?.(parsed.message.content);
                    }

                    if (parsed.done) {
                        return { content: fullContent, done: true };
                    }
                } catch {
                    // Partial chunk, ignore
                }
            }
        }

        return { content: fullContent, done: true };
    }

    /**
     * Extract JSON command blocks from an AI response string.
     * Parses ```json [...] ``` blocks and returns the commands array.
     *
     * @param response - The full AI response text
     * @returns Array of parsed AI commands, or empty array if none found
     */
    static extractCommands(response: string): Array<{ type: string; params: Record<string, unknown> }> {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) return [];

        try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            console.warn('⚠️ OllamaService: Failed to parse command JSON from response');
        }
        return [];
    }
}
