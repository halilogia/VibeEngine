import { VIBE_ENGINE_SYSTEM_PROMPT } from "./OllamaService";

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIChatOptions {
  model: string;
  messages: AIChatMessage[];
  apiKey: string;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

export interface AIChatResult {
  content: string;
  done: boolean;
}

export class OpenRouterService {
  private static readonly BASE_URL = "https://openrouter.ai/api/v1";

  static async chat(options: AIChatOptions): Promise<AIChatResult> {
    const { model, messages, apiKey, onToken, signal } = options;

    const systemMessages: AIChatMessage[] = [
      { role: "system", content: VIBE_ENGINE_SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(`${this.BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vibeengine.com",
        "X-Title": "VibeEngine Studio",
      },
      body: JSON.stringify({
        model,
        messages: systemMessages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${err}`);
    }

    if (!response.body) throw new Error("No response stream from OpenRouter");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              fullContent += content;
              onToken?.(content);
            }
          } catch {
            /* empty */
          }
        }
      }
    }

    return { content: fullContent, done: true };
  }
}
