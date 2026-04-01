/**
 * LocalSceneStorage — Manages scene persistence in browser localStorage
 * and provides auto-save functionality.
 */

import { serializeScene, deserializeScene } from '@editor/serialization';
import { useSceneStore } from '@infrastructure/store';

const STORAGE_KEY_PREFIX = 'vibe_scene_';
const STORAGE_INDEX_KEY = 'vibe_scene_index';
const AUTO_SAVE_KEY = 'vibe_autosave';

export interface SceneSaveInfo {
    key: string;
    name: string;
    savedAt: string;
    size: number;
}

/**
 * LocalSceneStorage — Manages browser localStorage scene persistence.
 */
export class LocalSceneStorage {
    private static autoSaveTimer: ReturnType<typeof setInterval> | null = null;

    /**
     * Save the current scene to localStorage under the given name.
     */
    static save(sceneName: string): void {
        const json = serializeScene();
        const key = `${STORAGE_KEY_PREFIX}${sceneName}`;

        try {
            localStorage.setItem(key, json);
            console.log(`✅ [Storage] Scene "${sceneName}" saved to browser storage`);

            // Update index
            const index = this.listScenes();
            const existing = index.find(s => s.key === key);
            const info: SceneSaveInfo = {
                key,
                name: sceneName,
                savedAt: new Date().toISOString(),
                size: json.length
            };

            if (existing) {
                const updated = index.map(s => s.key === key ? info : s);
                localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(updated));
            } else {
                localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify([...index, info]));
            }

            useSceneStore.getState().markClean();
        } catch (e) {
            console.error('❌ [Storage] Failed to save scene:', e);
            throw new Error('LocalStorage quota exceeded or write failed');
        }
    }

    /**
     * Load a scene from localStorage by name.
     */
    static load(sceneName: string): void {
        const key = `${STORAGE_KEY_PREFIX}${sceneName}`;
        const json = localStorage.getItem(key);

        if (!json) {
            throw new Error(`Scene "${sceneName}" not found in browser storage`);
        }

        deserializeScene(json);
        console.log(`✅ [Storage] Scene "${sceneName}" loaded from browser storage`);
    }

    /**
     * Delete a saved scene from localStorage.
     */
    static delete(sceneName: string): void {
        const key = `${STORAGE_KEY_PREFIX}${sceneName}`;
        localStorage.removeItem(key);

        const index = this.listScenes().filter(s => s.key !== key);
        localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
        console.log(`🗑️ [Storage] Scene "${sceneName}" deleted from browser storage`);
    }

    /**
     * List all scenes saved in localStorage.
     */
    static listScenes(): SceneSaveInfo[] {
        try {
            const raw = localStorage.getItem(STORAGE_INDEX_KEY);
            return raw ? JSON.parse(raw) as SceneSaveInfo[] : [];
        } catch {
            return [];
        }
    }

    /**
     * Save current scene as emergency auto-save.
     * Called automatically on a timer.
     */
    static autoSave(): void {
        const store = useSceneStore.getState();
        if (!store.isDirty) return;

        try {
            const json = serializeScene();
            localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({
                json,
                savedAt: new Date().toISOString(),
                sceneName: store.sceneName
            }));
            console.log('💾 [Storage] Auto-save completed');
        } catch {
            console.warn('⚠️ [Storage] Auto-save failed (quota?)');
        }
    }

    /**
     * Restore from the emergency auto-save if available.
     */
    static restoreAutoSave(): boolean {
        const raw = localStorage.getItem(AUTO_SAVE_KEY);
        if (!raw) return false;

        try {
            const { json } = JSON.parse(raw) as { json: string; savedAt: string; sceneName: string };
            deserializeScene(json);
            console.log('✅ [Storage] Auto-save restored');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Start the auto-save interval (every 30 seconds).
     */
    static startAutoSave(intervalMs = 30_000): void {
        if (this.autoSaveTimer) return;
        this.autoSaveTimer = setInterval(() => this.autoSave(), intervalMs);
        console.log('💾 [Storage] Auto-save enabled (every 30s)');
    }

    /**
     * Stop the auto-save interval.
     */
    static stopAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
}
