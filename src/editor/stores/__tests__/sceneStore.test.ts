import { describe, it, expect, beforeEach } from 'vitest';
import { useSceneStore } from '../sceneStore';

describe('sceneStore', () => {
    beforeEach(() => {
        useSceneStore.getState().clear();
    });

    it('should add an entity with default components', () => {
        const id = useSceneStore.getState().addEntity('Player');
        const entity = useSceneStore.getState().entities.get(id);
        
        expect(id).toBe(1);
        expect(entity?.name).toBe('Player');
        expect(entity?.components.some(c => c.type === 'Transform')).toBe(true);
        expect(useSceneStore.getState().rootEntityIds).toContain(id);
    });

    it('should handle parent-child relationships', () => {
        const parentId = useSceneStore.getState().addEntity('Parent');
        const childId = useSceneStore.getState().addEntity('Child', parentId);
        
        const parent = useSceneStore.getState().entities.get(parentId);
        const child = useSceneStore.getState().entities.get(childId);
        
        expect(child?.parentId).toBe(parentId);
        expect(parent?.children).toContain(childId);
        expect(useSceneStore.getState().rootEntityIds).not.toContain(childId);
    });

    it('should remove entity and its children recursively', () => {
        const parentId = useSceneStore.getState().addEntity('Parent');
        const childId = useSceneStore.getState().addEntity('Child', parentId);
        const grandChildId = useSceneStore.getState().addEntity('GrandChild', childId);
        
        useSceneStore.getState().removeEntity(parentId);
        
        expect(useSceneStore.getState().entities.has(parentId)).toBe(false);
        expect(useSceneStore.getState().entities.has(childId)).toBe(false);
        expect(useSceneStore.getState().entities.has(grandChildId)).toBe(false);
        expect(useSceneStore.getState().rootEntityIds.length).toBe(0);
    });

    it('should update component data correctly', () => {
        const id = useSceneStore.getState().addEntity('Test');
        useSceneStore.getState().updateComponent(id, 'Transform', { position: [10, 20, 30] });
        
        const entity = useSceneStore.getState().entities.get(id);
        const transform = entity?.components.find(c => c.type === 'Transform');
        
        expect(transform?.data.position).toEqual([10, 20, 30]);
    });

    it('should set parent and update old/new parent children lists', () => {
        const e1Id = useSceneStore.getState().addEntity('E1');
        const e2Id = useSceneStore.getState().addEntity('E2');
        const e3Id = useSceneStore.getState().addEntity('E3');
        
        // E3 is child of E1
        useSceneStore.getState().setParent(e3Id, e1Id);
        expect(useSceneStore.getState().entities.get(e1Id)?.children).toContain(e3Id);
        
        // Move E3 to E2
        useSceneStore.getState().setParent(e3Id, e2Id);
        expect(useSceneStore.getState().entities.get(e1Id)?.children).not.toContain(e3Id);
        expect(useSceneStore.getState().entities.get(e2Id)?.children).toContain(e3Id);
        expect(useSceneStore.getState().entities.get(e3Id)?.parentId).toBe(e2Id);
    });
});
