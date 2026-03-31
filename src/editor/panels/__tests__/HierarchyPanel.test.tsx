import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HierarchyPanel } from '../HierarchyPanel';

// Mock the stores
const mockSceneStore = {
    entities: new Map(),
    rootEntityIds: [],
    addEntity: vi.fn().mockReturnValue(1),
    removeEntity: vi.fn(),
};

const mockEditorStore = {
    selectedEntityId: null,
    selectEntity: vi.fn(),
    clearSelection: vi.fn(),
};

vi.mock('../../stores', () => ({
    useSceneStore: () => mockSceneStore,
    useEditorStore: () => mockEditorStore,
    getComponentInfo: vi.fn() // Need to mock if imported directly
}));

describe('HierarchyPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSceneStore.entities.clear();
        mockSceneStore.rootEntityIds = [];
        mockEditorStore.selectedEntityId = null;
    });

    it('should render empty state when no entities', () => {
        render(<HierarchyPanel />);
        expect(screen.getByText('No entities')).toBeDefined();
    });

    it('should list root entities', () => {
        const entity = { id: 1, name: 'Player', children: [] };
        mockSceneStore.entities.set(1, entity);
        mockSceneStore.rootEntityIds = [1];
        
        render(<HierarchyPanel />);
        expect(screen.getByText('Player')).toBeDefined();
    });

    it('should select entity on click', () => {
        const entity = { id: 1, name: 'Target', children: [] };
        mockSceneStore.entities.set(1, entity);
        mockSceneStore.rootEntityIds = [1];
        
        render(<HierarchyPanel />);
        fireEvent.click(screen.getByText('Target'));
        
        expect(mockEditorStore.selectEntity).toHaveBeenCalledWith(1);
    });

    it('should add a new entity when button clicked', () => {
        render(<HierarchyPanel />);
        // Find by title "Add Entity"
        const addBtn = screen.getByTitle('Add Entity');
        fireEvent.click(addBtn);
        
        expect(mockSceneStore.addEntity).toHaveBeenCalled();
        expect(mockEditorStore.selectEntity).toHaveBeenCalledWith(1);
    });

    it('should remove selected entity', () => {
        mockEditorStore.selectedEntityId = 1;
        render(<HierarchyPanel />);
        
        const deleteBtn = screen.getByTitle('Delete Entity');
        fireEvent.click(deleteBtn);
        
        expect(mockSceneStore.removeEntity).toHaveBeenCalledWith(1);
        expect(mockEditorStore.clearSelection).toHaveBeenCalled();
    });
});
