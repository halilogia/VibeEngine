import { OllamaService, type OllamaMessage } from "./OllamaService";
import { OpenRouterService, type AIChatOptions } from "./OpenRouterService";
import { GitHubCopilotService } from "./GitHubCopilotService";

export type AIProvider = "ollama" | "github" | "openrouter";

export class NeuralService {
  static async chat(
    options: AIChatOptions & { provider: AIProvider },
  ): Promise<{ content: string; done: boolean }> {
    const { provider, ...chatOptions } = options;

    switch (provider) {
      case "github":
        return GitHubCopilotService.chat(chatOptions);
      case "openrouter":
        return OpenRouterService.chat(chatOptions);
      case "ollama":
      default:
        return OllamaService.chat({
          model: chatOptions.model,
          messages: chatOptions.messages as OllamaMessage[],
          onToken: chatOptions.onToken,
          signal: chatOptions.signal,
        });
    }
  }

  static async getAvailableModels(provider: AIProvider): Promise<string[]> {
    switch (provider) {
      case "ollama":
        return OllamaService.listModels();
      case "github":
        return [
          "Gemini 3 Flash (Preview)",
          "Gemini 3.1 Pro (Preview)",
          "GPT-4.1",
          "GPT-4o",
          "GPT-5 mini",
          "GPT-5.1-Codex",
          "GPT-5.1-Codex-Max",
          "GPT-5.1-Codex-Mini (Preview)",
          "GPT-5.2-Codex",
          "GPT-5.3-Codex",
          "GPT-5.4 mini",
          "Grok Code Fast 1",
        ];
      case "openrouter":
        return [
          "stepfun/step-3.5-flash",
          "qwen/qwen-3.6-plus-preview",
          "nvidia/nemotron-3-super",
          "arcee-ai/trinity-large-preview",
          "z-ai/glm-4.5-air",
          "nvidia/nemotron-3-nano-30b-a3b",
          "arcee-ai/trinity-mini",
          "nvidia/nemotron-nano-12b-2-vl",
          "nvidia/nemotron-nano-9b-v2",
          "minimax/minimax-m2.5",
          "qwen/qwen-3-coder-480b-a35b",
          "qwen/qwen-3-next-80b-a3b-instruct",
          "liquid/lfm-2.5-1.2b-thinking",
          "meta-llama/llama-3.3-70b-instruct",
          "openai/gpt-oss-20b",
          "openai/gpt-oss-120b",
        ];
      default:
        return [];
    }
  }

  static extractCommands(content: string) {
    return OllamaService.extractCommands(content);
  }
}
