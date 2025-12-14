/**
 * SceneSerializer - Save/Load scene data to JSON
 */

import { useSceneStore, type EntityData, type ComponentData } from '../stores/sceneStore';

export interface SerializedScene {
    version: string;
    name: string;
    entities: SerializedEntity[];
}

export interface SerializedEntity {
    id: number;
    name: string;
    parentId: number | null;
    enabled: boolean;
    tags: string[];
    components: ComponentData[];
}

/**
 * Serialize current scene to JSON string
 */
export function serializeScene(): string {
    const state = useSceneStore.getState();

    const data: SerializedScene = {
        version: '1.0.0',
        name: state.sceneName,
        entities: []
    };

    // Serialize all entities
    state.entities.forEach((entity) => {
        data.entities.push({
            id: entity.id,
            name: entity.name,
            parentId: entity.parentId,
            enabled: entity.enabled,
            tags: [...entity.tags],
            components: entity.components.map(c => ({
                type: c.type,
                data: { ...c.data },
                enabled: c.enabled
            }))
        });
    });

    return JSON.stringify(data, null, 2);
}

/**
 * Deserialize JSON string to scene
 */
export function deserializeScene(json: string): void {
    const data: SerializedScene = JSON.parse(json);
    const store = useSceneStore.getState();

    // Clear existing scene
    store.clear();

    // Set scene name
    useSceneStore.setState({ sceneName: data.name });

    // Create entities (first pass - create all)
    const entityMap = new Map<number, EntityData>();

    for (const entity of data.entities) {
        const entityData: EntityData = {
            id: entity.id,
            name: entity.name,
            parentId: null, // Set in second pass
            children: [],
            components: entity.components,
            enabled: entity.enabled,
            tags: entity.tags
        };
        entityMap.set(entity.id, entityData);
    }

    // Second pass - set up hierarchy
    const rootIds: number[] = [];

    for (const entity of data.entities) {
        const entityData = entityMap.get(entity.id)!;

        if (entity.parentId === null) {
            rootIds.push(entity.id);
        } else {
            entityData.parentId = entity.parentId;
            const parent = entityMap.get(entity.parentId);
            if (parent) {
                parent.children.push(entity.id);
            }
        }
    }

    // Update store
    useSceneStore.setState({
        entities: entityMap,
        rootEntityIds: rootIds,
        nextEntityId: Math.max(...data.entities.map(e => e.id)) + 1,
        isDirty: false
    });
}

/**
 * Download scene as JSON file
 */
export function downloadScene(filename: string = 'scene.json'): void {
    const json = serializeScene();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Load scene from file input
 */
export function loadSceneFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                deserializeScene(reader.result as string);
                resolve();
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

/**
 * Create default scene with basic entities
 */
export function createDefaultScene(): void {
    const store = useSceneStore.getState();
    store.clear();

    // Set scene name
    useSceneStore.setState({ sceneName: 'New Scene' });

    // Add camera
    const cameraId = store.addEntity('Main Camera', null);
    store.addComponent(cameraId, {
        type: 'Camera',
        data: { fov: 75, near: 0.1, far: 1000, isActive: true },
        enabled: true
    });
    store.updateComponent(cameraId, 'Transform', {
        position: [0, 5, 10],
        rotation: [-20, 0, 0]
    });

    // Add directional light
    const lightId = store.addEntity('Directional Light', null);
    store.addComponent(lightId, {
        type: 'Light',
        data: { lightType: 'directional', color: '#ffffff', intensity: 1, castShadow: true },
        enabled: true
    });
    store.updateComponent(lightId, 'Transform', {
        position: [5, 10, 5],
        rotation: [-45, 30, 0]
    });

    // Add ground
    const groundId = store.addEntity('Ground', null);
    store.addComponent(groundId, {
        type: 'Render',
        data: { meshType: 'plane', color: '#374151', castShadow: false, receiveShadow: true },
        enabled: true
    });
    store.updateComponent(groundId, 'Transform', {
        scale: [20, 1, 20],
        rotation: [-90, 0, 0]
    });

    // Add sample cube
    const cubeId = store.addEntity('Cube', null);
    store.addComponent(cubeId, {
        type: 'Render',
        data: { meshType: 'cube', color: '#6366f1', castShadow: true, receiveShadow: true },
        enabled: true
    });
    store.updateComponent(cubeId, 'Transform', {
        position: [0, 0.5, 0]
    });

    useSceneStore.setState({ isDirty: false });
}
