/**
 * PlayModeManager - Manages Play/Stop for testing scenes
 */

import { create } from 'zustand';
import { useSceneStore, type EntityData, type ComponentData } from '../stores/sceneStore';
import { useEditorStore } from '../stores/editorStore';

interface PlayModeState {
    // State
    isPlaying: boolean;
    isPaused: boolean;
    playStartTime: number;

    // Saved state for restore
    savedState: {
        entities: Map<number, EntityData>;
        rootEntityIds: number[];
        nextEntityId: number;
        sceneName: string;
    } | null;

    // Actions
    play: () => void;
    pause: () => void;
    stop: () => void;
    togglePause: () => void;
}

function cloneEntities(entities: Map<number, EntityData>): Map<number, EntityData> {
    return new Map(
        Array.from(entities.entries()).map(([id, entity]) => [
            id,
            {
                ...entity,
                children: [...entity.children],
                components: entity.components.map(c => ({ ...c, data: { ...c.data } })),
                tags: [...entity.tags]
            }
        ])
    );
}

export const usePlayModeStore = create<PlayModeState>((set, get) => ({
    isPlaying: false,
    isPaused: false,
    playStartTime: 0,
    savedState: null,

    play: () => {
        const sceneState = useSceneStore.getState();

        // Save current state
        const savedState = {
            entities: cloneEntities(sceneState.entities),
            rootEntityIds: [...sceneState.rootEntityIds],
            nextEntityId: sceneState.nextEntityId,
            sceneName: sceneState.sceneName
        };

        set({
            isPlaying: true,
            isPaused: false,
            playStartTime: performance.now(),
            savedState
        });

        // Update editor store
        useEditorStore.getState().play();
    },

    pause: () => {
        set((state) => ({ isPaused: !state.isPaused }));
        useEditorStore.getState().pause();
    },

    togglePause: () => {
        set((state) => ({ isPaused: !state.isPaused }));
    },

    stop: () => {
        const { savedState } = get();

        // Restore saved state
        if (savedState) {
            useSceneStore.setState({
                entities: savedState.entities,
                rootEntityIds: savedState.rootEntityIds,
                nextEntityId: savedState.nextEntityId,
                sceneName: savedState.sceneName,
                isDirty: true
            });
        }

        set({
            isPlaying: false,
            isPaused: false,
            playStartTime: 0,
            savedState: null
        });

        // Update editor store
        useEditorStore.getState().stop();
    }
}));

/**
 * Simple game loop for play mode
 */
export class GameLoop {
    private running: boolean = false;
    private lastTime: number = 0;
    private updateCallback: ((deltaTime: number) => void) | null = null;

    start(onUpdate: (deltaTime: number) => void): void {
        this.running = true;
        this.lastTime = performance.now();
        this.updateCallback = onUpdate;
        this.tick();
    }

    stop(): void {
        this.running = false;
        this.updateCallback = null;
    }

    private tick = (): void => {
        if (!this.running) return;

        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        const { isPaused } = usePlayModeStore.getState();

        if (!isPaused && this.updateCallback) {
            this.updateCallback(deltaTime);
        }

        requestAnimationFrame(this.tick);
    };
}

export const gameLoop = new GameLoop();
