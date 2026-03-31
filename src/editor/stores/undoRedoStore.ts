/**
 * UndoRedoStore - History management for undo/redo
 */

import { create } from 'zustand';
import { useSceneStore, type EntityData } from './sceneStore';

interface HistoryState {
    entities: Map<number, EntityData>;
    rootEntityIds: number[];
    nextEntityId: number;
    sceneName: string;
}

interface UndoRedoState {
    past: HistoryState[];
    future: HistoryState[];
    maxHistory: number;

    // Actions
    pushState: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    clear: () => void;
}

function cloneState(): HistoryState {
    const state = useSceneStore.getState();
    return {
        entities: new Map(
            Array.from(state.entities.entries()).map(([id, entity]) => [
                id,
                {
                    ...entity,
                    children: [...entity.children],
                    components: entity.components.map(c => ({ ...c, data: { ...c.data } })),
                    tags: [...entity.tags]
                }
            ])
        ),
        rootEntityIds: [...state.rootEntityIds],
        nextEntityId: state.nextEntityId,
        sceneName: state.sceneName
    };
}

function restoreState(state: HistoryState): void {
    useSceneStore.setState({
        entities: state.entities,
        rootEntityIds: state.rootEntityIds,
        nextEntityId: state.nextEntityId,
        sceneName: state.sceneName,
        isDirty: true
    });
}

export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
    past: [],
    future: [],
    maxHistory: 50,

    pushState: () => {
        const currentState = cloneState();
        set((state) => ({
            past: [...state.past.slice(-state.maxHistory + 1), currentState],
            future: [] // Clear future on new action
        }));
    },

    undo: () => {
        const { past, future } = get();
        if (past.length === 0) return;

        const currentState = cloneState();
        const previousState = past[past.length - 1];

        restoreState(previousState);

        set({
            past: past.slice(0, -1),
            future: [currentState, ...future]
        });
    },

    redo: () => {
        const { past, future } = get();
        if (future.length === 0) return;

        const currentState = cloneState();
        const nextState = future[0];

        restoreState(nextState);

        set({
            past: [...past, currentState],
            future: future.slice(1)
        });
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    clear: () => set({ past: [], future: [] })
}));
