import { create } from "zustand";

export interface EntityData {
  id: number;
  name: string;
  parentId: number | null;
  children: number[];
  components: ComponentData[];
  enabled: boolean;
  tags: string[];
}

export interface ComponentData {
  type: string;
  data: Record<string, unknown>;
  enabled: boolean;
}

export interface AssetData {
  id: string;
  name: string;
  type: "model" | "texture" | "audio" | "script" | "folder";
  path: string;
  parentId?: string | null;
}

interface SceneState {
  entities: Map<number, EntityData>;
  rootEntityIds: number[];

  nextEntityId: number;

  sceneName: string;
  isDirty: boolean;

  assets: AssetData[];

  addEntity: (name?: string, parentId?: number | null) => number;
  removeEntity: (id: number) => void;
  renameEntity: (id: number, name: string) => void;
  setParent: (entityId: number, parentId: number | null) => void;
  addComponent: (entityId: number, component: ComponentData) => void;
  removeComponent: (entityId: number, componentType: string) => void;
  updateComponent: (
    entityId: number,
    componentType: string,
    data: Record<string, unknown>,
  ) => void;
  updateEntity: (id: number, data: Partial<EntityData>) => void;
  loadScene: (sceneData: SceneFileData) => void;
  setSceneName: (name: string) => void;
  removeAsset: (id: string) => void;
  setAssets: (assets: AssetData[]) => void;
  clear: () => void;
  markDirty: () => void;
  markClean: () => void;

  selectedEntityId: number | null;
  setSelectedEntityId: (id: number | null) => void;
}

export interface SceneFileData {
  sceneName: string;
  version: string;
  nextEntityId: number;
  entities: EntityData[];
  rootEntityIds: number[];
}

export const useSceneStore = create<SceneState>((set, get) => ({
  entities: new Map(),
  rootEntityIds: [],
  nextEntityId: 1,
  sceneName: "Untitled Scene",
  isDirty: false,

  assets: [],
  selectedEntityId: null,

  addEntity: (name = "New Entity", parentId = null) => {
    const id = get().nextEntityId;
    const entity: EntityData = {
      id,
      name,
      parentId,
      children: [],
      components: [
        {
          type: "Transform",
          data: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          enabled: true,
        },
      ],
      enabled: true,
      tags: [],
    };

    set((state) => {
      const newEntities = new Map(state.entities);
      newEntities.set(id, entity);

      const newRoots = [...state.rootEntityIds];
      if (parentId === null) {
        newRoots.push(id);
      } else {
        const parent = newEntities.get(parentId);
        if (parent) {
          parent.children.push(id);
        }
      }

      return {
        entities: newEntities,
        rootEntityIds: newRoots,
        nextEntityId: id + 1,
        isDirty: true,
      };
    });

    return id;
  },

  removeEntity: (id) =>
    set((state) => {
      const entity = state.entities.get(id);
      if (!entity) return state;

      const newEntities = new Map(state.entities);

      if (entity.parentId !== null) {
        const parent = newEntities.get(entity.parentId);
        if (parent) {
          parent.children = parent.children.filter((cid) => cid !== id);
        }
      }

      const removeRecursive = (entityId: number) => {
        const e = newEntities.get(entityId);
        if (e) {
          e.children.forEach(removeRecursive);
          newEntities.delete(entityId);
        }
      };
      removeRecursive(id);

      const newRoots = state.rootEntityIds.filter((rid) => rid !== id);

      return { entities: newEntities, rootEntityIds: newRoots, isDirty: true };
    }),

  renameEntity: (id, name) =>
    set((state) => {
      const entity = state.entities.get(id);
      if (!entity) return state;

      const newEntities = new Map(state.entities);
      newEntities.set(id, { ...entity, name });

      return { entities: newEntities, isDirty: true };
    }),

  setParent: (entityId, parentId) =>
    set((state) => {
      const entity = state.entities.get(entityId);
      if (!entity) return state;

      const newEntities = new Map(state.entities);

      if (entity.parentId !== null) {
        const oldParent = newEntities.get(entity.parentId);
        if (oldParent) {
          oldParent.children = oldParent.children.filter(
            (id) => id !== entityId,
          );
        }
      }

      const newRoots = state.rootEntityIds.filter((id) => id !== entityId);

      if (parentId === null) {
        newRoots.push(entityId);
      } else {
        const newParent = newEntities.get(parentId);
        if (newParent) {
          newParent.children.push(entityId);
        }
      }

      newEntities.set(entityId, { ...entity, parentId });

      return { entities: newEntities, rootEntityIds: newRoots, isDirty: true };
    }),

  addComponent: (entityId, component) =>
    set((state) => {
      const entity = state.entities.get(entityId);
      if (!entity) return state;

      const newEntities = new Map(state.entities);
      newEntities.set(entityId, {
        ...entity,
        components: [...entity.components, component],
      });

      return { entities: newEntities, isDirty: true };
    }),

  removeComponent: (entityId, componentType) =>
    set((state) => {
      const entity = state.entities.get(entityId);
      if (!entity) return state;

      const newEntities = new Map(state.entities);
      newEntities.set(entityId, {
        ...entity,
        components: entity.components.filter((c) => c.type !== componentType),
      });

      return { entities: newEntities, isDirty: true };
    }),

  updateComponent: (entityId, componentType, data) =>
    set((state) => {
      const entity = state.entities.get(entityId);
      if (!entity) return state;

      const newEntities = new Map(state.entities);
      newEntities.set(entityId, {
        ...entity,
        components: entity.components.map((c) =>
          c.type === componentType ? { ...c, data: { ...c.data, ...data } } : c,
        ),
      });

      return { entities: newEntities, isDirty: true };
    }),

  updateEntity: (id: number, data: Partial<EntityData>) =>
    set((state) => {
      const entity = state.entities.get(id);
      if (!entity) return state;

      const newEntities = new Map(state.entities);
      newEntities.set(id, { ...entity, ...data });

      return { entities: newEntities, isDirty: true };
    }),

  setSelectedEntityId: (id: number | null) => set({ selectedEntityId: id }),

  getEntity: (id: number) => get().entities.get(id),

  loadScene: (sceneData) =>
    set(() => {
      const newEntities = new Map<number, EntityData>();

      for (const entity of sceneData.entities) {
        newEntities.set(entity.id, entity);
      }

      console.log(
        `✅ Scene loaded: ${sceneData.sceneName} (${sceneData.entities.length} entities)`,
      );

      return {
        entities: newEntities,
        rootEntityIds: sceneData.rootEntityIds,
        nextEntityId: sceneData.nextEntityId,
        sceneName: sceneData.sceneName,
        isDirty: false,
      };
    }),

  setSceneName: (name) => set({ sceneName: name, isDirty: true }),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
  setAssets: (assets) => set({ assets }),
  clear: () =>
    set({
      entities: new Map(),
      rootEntityIds: [],
      nextEntityId: 1,
      sceneName: "Untitled Scene",
      isDirty: false,
    }),

  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
}));
