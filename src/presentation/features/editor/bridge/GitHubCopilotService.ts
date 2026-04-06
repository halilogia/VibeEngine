import { VIBE_ENGINE_SYSTEM_PROMPT } from "./OllamaService";
import type {
  AIChatMessage,
  AIChatOptions,
  AIChatResult,
} from "./OpenRouterService";

export class GitHubCopilotService {
  private static readonly BASE_URL = "https://models.inference.ai.azure.com";

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
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: systemMessages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(
        `GitHub Copilot API (Models) error ${response.status}: ${err}`,
      );
    }

    if (!response.body)
      throw new Error("No response stream from GitHub Copilot");

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
            // ignore
          }
        }
      }
    }

    return { content: fullContent, done: true };
  }
}
