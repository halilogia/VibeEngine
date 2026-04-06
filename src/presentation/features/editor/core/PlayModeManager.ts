import { create } from "zustand";
import { useSceneStore, type EntityData } from "@infrastructure/store";
import { useEditorStore } from "@infrastructure/store";

interface PlayModeState {
  isPlaying: boolean;
  isPaused: boolean;
  playStartTime: number;

  savedState: {
    entities: Map<number, EntityData>;
    rootEntityIds: number[];
    nextEntityId: number;
    sceneName: string;
  } | null;

  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePause: () => void;
}

function cloneEntities(
  entities: Map<number, EntityData>,
): Map<number, EntityData> {
  return new Map(
    Array.from(entities.entries()).map(([id, entity]) => [
      id,
      {
        ...entity,
        children: [...entity.children],
        components: entity.components.map((c) => ({
          ...c,
          data: { ...c.data },
        })),
        tags: [...entity.tags],
      },
    ]),
  );
}

export const usePlayModeStore = create<PlayModeState>((set, get) => ({
  isPlaying: false,
  isPaused: false,
  playStartTime: 0,
  savedState: null,

  play: () => {
    const sceneState = useSceneStore.getState();

    const savedState = {
      entities: cloneEntities(sceneState.entities),
      rootEntityIds: [...sceneState.rootEntityIds],
      nextEntityId: sceneState.nextEntityId,
      sceneName: sceneState.sceneName,
    };

    set({
      isPlaying: true,
      isPaused: false,
      playStartTime: performance.now(),
      savedState,
    });

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

    if (savedState) {
      useSceneStore.setState({
        entities: savedState.entities,
        rootEntityIds: savedState.rootEntityIds,
        nextEntityId: savedState.nextEntityId,
        sceneName: savedState.sceneName,
        isDirty: true,
      });
    }

    set({
      isPlaying: false,
      isPaused: false,
      playStartTime: 0,
      savedState: null,
    });

    useEditorStore.getState().stop();
  },
}));

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
