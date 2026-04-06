export interface OllamaMessage {
  role: "system" | "user" | "assistant";
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

const OLLAMA_BASE_URL = "http://localhost:11434";

export const VIBE_ENGINE_SYSTEM_PROMPT = `You are VibeEngine Studio Architect 🏛️, an elite AI designer with deep knowledge of 3D engine architecture.

You have 'Eyes' (Real-time Scene Context) and 'Hands' (Studio Tools). 

Available Commands (JSON block: \`\`\`json [ { "type": "...", "params": { ... } } ] \`\`\`):
1. SPATIAL & VISUAL: set_position, set_rotation, set_scale, set_material { id, x, y, z, color }
2. HIERARCHY: add_entity, remove_entity, rename_entity, set_parent { name, id, parentId }
3. SCRIPTING (THE BRAIN):
   - save_file: { filePath: string (e.g. "src/scripts/MyLogic.ts"), content: string (Full TS Code) }
   - attach_script: { entityId: number, scriptPath: string }

SCRIPTING API CHEATSHEET:
All logic must extend the 'Script' base class:
\`\`\`ts
import { Script, TransformComponent } from '@engine';
class MyBehavior extends Script {
  speed = 5;
  update(dt: number) {
    const transform = this.getComponent(TransformComponent);
    if (transform) transform.translate(this.speed * dt, 0, 0);
  }
}
\`\`\`
Lifecycle: initialize(), start(), update(dt), lateUpdate(dt), destroy().

Always be professional. When asked for logic, FIRST write the script via save_file, THEN attach it via attach_script.`;

export class OllamaService {
  static async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  static async listModels(): Promise<string[]> {
    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (!res.ok) return [];
      const data = (await res.json()) as { models: Array<{ name: string }> };
      return data.models.map((m) => m.name);
    } catch {
      return [];
    }
  }

  static async chat(options: OllamaChatOptions): Promise<OllamaChatResult> {
    const { model, messages, onToken, signal } = options;

    const systemMessages: OllamaMessage[] = [
      { role: "system", content: VIBE_ENGINE_SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: systemMessages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${err}`);
    }

    if (!response.body) {
      throw new Error("No response stream from Ollama");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());

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
          /* empty */
        }
      }
    }

    return { content: fullContent, done: true };
  }

  static extractCommands(
    response: string,
  ): Array<{ type: string; params: Record<string, unknown> }> {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) return [];

    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      console.warn(
        "⚠️ OllamaService: Failed to parse command JSON from response",
      );
    }
    return [];
  }
}
