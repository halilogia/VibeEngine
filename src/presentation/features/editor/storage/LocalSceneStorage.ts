import { serializeScene, deserializeScene } from "@editor/serialization";
import { useSceneStore } from "@infrastructure/store";

const STORAGE_KEY_PREFIX = "vibe_scene_";
const STORAGE_INDEX_KEY = "vibe_scene_index";
const AUTO_SAVE_KEY = "vibe_autosave";

export interface SceneSaveInfo {
  key: string;
  name: string;
  savedAt: string;
  size: number;
}

interface ErrorWithCause extends Error {
  cause?: unknown;
}

export class LocalSceneStorage {
  private static autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  static save(sceneName: string): void {
    const json = serializeScene();
    const key = `${STORAGE_KEY_PREFIX}${sceneName}`;

    try {
      localStorage.setItem(key, json);
      console.log(`✅ [Storage] Scene "${sceneName}" saved to browser storage`);

      const index = this.listScenes();
      const existing = index.find((s) => s.key === key);
      const info: SceneSaveInfo = {
        key,
        name: sceneName,
        savedAt: new Date().toISOString(),
        size: json.length,
      };

      if (existing) {
        const updated = index.map((s) => (s.key === key ? info : s));
        localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(updated));
      } else {
        localStorage.setItem(
          STORAGE_INDEX_KEY,
          JSON.stringify([...index, info]),
        );
      }

      useSceneStore.getState().markClean();
    } catch (error) {
      console.error("❌ [Storage] Failed to save scene:", error);
      const symptomError = new Error("LocalStorage quota exceeded or write failed") as ErrorWithCause;
      symptomError.cause = error;
      throw symptomError;
    }
  }

  static load(sceneName: string): void {
    const key = `${STORAGE_KEY_PREFIX}${sceneName}`;
    const json = localStorage.getItem(key);

    if (!json) {
      throw new Error(`Scene "${sceneName}" not found in browser storage`);
    }

    deserializeScene(json);
    console.log(
      `✅ [Storage] Scene "${sceneName}" loaded from browser storage`,
    );
  }

  static delete(sceneName: string): void {
    const key = `${STORAGE_KEY_PREFIX}${sceneName}`;
    localStorage.removeItem(key);

    const index = this.listScenes().filter((s) => s.key !== key);
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
    console.log(
      `🗑️ [Storage] Scene "${sceneName}" deleted from browser storage`,
    );
  }

  static listScenes(): SceneSaveInfo[] {
    try {
      const raw = localStorage.getItem(STORAGE_INDEX_KEY);
      return raw ? (JSON.parse(raw) as SceneSaveInfo[]) : [];
    } catch {
      return [];
    }
  }

  static autoSave(): void {
    const store = useSceneStore.getState();
    if (!store.isDirty) return;

    try {
      const json = serializeScene();
      localStorage.setItem(
        AUTO_SAVE_KEY,
        JSON.stringify({
          json,
          savedAt: new Date().toISOString(),
          sceneName: store.sceneName,
        }),
      );
      console.log("💾 [Storage] Auto-save completed");
    } catch {
      console.warn("⚠️ [Storage] Auto-save failed (quota?)");
    }
  }

  static restoreAutoSave(): boolean {
    const raw = localStorage.getItem(AUTO_SAVE_KEY);
    if (!raw) return false;

    try {
      const { json } = JSON.parse(raw) as {
        json: string;
        savedAt: string;
        sceneName: string;
      };
      deserializeScene(json);
      console.log("✅ [Storage] Auto-save restored");
      return true;
    } catch {
      return false;
    }
  }

  static startAutoSave(intervalMs = 30_000): void {
    if (this.autoSaveTimer) return;
    this.autoSaveTimer = setInterval(() => this.autoSave(), intervalMs);
    console.log("💾 [Storage] Auto-save enabled (every 30s)");
  }

  static stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}
