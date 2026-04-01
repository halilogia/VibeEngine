import { describe, it, expect, vi, beforeEach } from 'vitest';
import { serializeScene, deserializeScene } from '../SceneSerializer';

// Mock the sceneStore
const mockStore = {
    sceneName: 'Test Scene',
    entities: new Map(),
    rootEntityIds: [],
    nextEntityId: 1,
    isDirty: false,
    clear: vi.fn(),
};

vi.mock('../../stores/sceneStore', () => ({
    useSceneStore: {
        getState: () => mockStore,
        setState: vi.fn((update) => {
            Object.assign(mockStore, typeof update === 'function' ? update(mockStore) : update);
        })
    }
}));

describe('SceneSerializer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockStore.entities.clear();
        mockStore.rootEntityIds = [];
        mockStore.sceneName = 'Test Scene';
    });

    it('should serialize an empty scene correctly', () => {
        const json = serializeScene();
        const data = JSON.parse(json);
        
        expect(data.name).toBe('Test Scene');
        expect(data.entities).toEqual([]);
    });

    it('should serialize a scene with hierarchy', () => {
        // Setup mock data
        const entity1 = {
            id: 1,
            name: 'Parent',
            parentId: null,
            enabled: true,
            tags: ['tag1'],
            components: [{ type: 'Transform', data: { position: [0, 0, 0] }, enabled: true }]
        };
        const entity2 = {
            id: 2,
            name: 'Child',
            parentId: 1,
            enabled: true,
            tags: [],
            components: []
        };
        
        mockStore.entities.set(1, entity1);
        mockStore.entities.set(2, entity2);
        
        const json = serializeScene();
        const data = JSON.parse(json);
        
        expect(data.entities.length).toBe(2);
        expect(data.entities[0].name).toBe('Parent');
        expect(data.entities[1].parentId).toBe(1);
    });

    it('should deserialize a scene correctly', () => {
        const testData = {
            version: '1.0.0',
            name: 'Loaded Scene',
            entities: [
                {
                    id: 10,
                    name: 'Remote Entity',
                    parentId: null,
                    enabled: true,
                    tags: [],
                    components: []
                }
            ]
        };
        
        deserializeScene(JSON.stringify(testData));
        
        expect(mockStore.sceneName).toBe('Loaded Scene');
        expect(mockStore.entities.has(10)).toBe(true);
        expect(mockStore.entities.get(10).name).toBe('Remote Entity');
    });
});
