import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandInterpreter, type CommandResult } from '../AICopilot';

// Mock the sceneStore
vi.mock('../../stores/sceneStore', () => ({
    useSceneStore: {
        getState: () => ({
            addEntity: vi.fn().mockReturnValue(1),
            removeEntity: vi.fn(),
            updateComponent: vi.fn(),
            addComponent: vi.fn(),
            renameEntity: vi.fn(),
            setParent: vi.fn(),
            entities: new Map(),
            rootEntityIds: []
        }),
        setState: vi.fn()
    }
}));

describe('AICopilot Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should execute add_entity command correctly', async () => {
        const command = {
            type: 'add_entity',
            params: { name: 'Test Box', components: [{ type: 'Transform', data: { position: [1, 2, 3] } }] }
        };
        
        const results = await CommandInterpreter.executeBatch([command as any]);
        expect(results[0].success).toBe(true);
        expect(results[0].entityId).toBe(1);
    });

    it('should execute spawn_prefab command correctly', async () => {
        const command = {
            type: 'spawn_prefab',
            params: { prefabName: 'PlayerCharacter', position: [10, 0, 10] }
        };
        
        const results = await CommandInterpreter.executeBatch([command as any]);
        expect(results[0].success).toBe(true);
    });

    it('should handle batch execution', async () => {
        const commands = [
            { type: 'add_entity', params: { name: 'Obj 1' } },
            { type: 'add_entity', params: { name: 'Obj 2' } }
        ];
        
        const results = await CommandInterpreter.executeBatch(commands as any);
        expect(results.length).toBe(2);
        expect(results.every((r: CommandResult) => r.success)).toBe(true);
    });

    it('should fail gracefully on unknown command', async () => {
        const command = { type: 'unknown_command', params: {} };
        const results = await CommandInterpreter.executeBatch([command as any]);
        expect(results[0].success).toBe(false);
        expect(results[0].message).toContain('Unsupported command type');
    });
});
