import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InspectorPanel } from '../InspectorPanel';

// Mock the bridge functions
vi.mock('../../bridge', () => ({
    getComponentInfo: vi.fn().mockImplementation((type) => {
        if (type === 'Transform') {
            return {
                type: 'Transform',
                label: 'Transform',
                icon: 'Move',
                properties: [
                    { name: 'position', label: 'Position', type: 'vector3', default: [0, 0, 0] }
                ]
            };
        }
        return null;
    }),
    getAvailableComponents: vi.fn().mockReturnValue([
        { type: 'Render', label: 'Mesh Renderer', icon: 'Box' }
    ])
}));

// Mock the stores
const mockSceneStore = {
    entities: new Map<number, any>(),
    getEntity: vi.fn((id) => mockSceneStore.entities.get(id)),
    updateEntity: vi.fn(),
    renameEntity: vi.fn(),
    updateComponent: vi.fn(),
    addComponent: vi.fn(),
    removeComponent: vi.fn(),
};

const mockEditorStore = {
    selectedEntityId: null as number | null,
    activePanelId: 'inspector',
    setActivePanel: vi.fn(),
};

vi.mock('../../stores', () => ({
    useSceneStore: () => mockSceneStore,
    useEditorStore: () => mockEditorStore,
    getComponentInfo: vi.fn() // Need to mock if imported directly
}));

describe('InspectorPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockEditorStore.selectedEntityId = null;
    });

    it('should render empty state when no entity selected', () => {
        render(<InspectorPanel />);
        expect(screen.getByText(/NO ENTITY SELECTED/i)).toBeDefined();
    });

    it('should show entity name and components when selected', () => {
        const entity = {
            id: 1,
            name: 'Player',
            enabled: true,
            components: [
                { type: 'Transform', data: { position: [1, 2, 3] }, enabled: true }
            ]
        };
        mockEditorStore.selectedEntityId = 1;
        mockSceneStore.entities.set(1, entity as any);
        
        render(<InspectorPanel />);
        
        // Check component header
        expect(screen.getByText(/TRANSFORM/i)).toBeDefined();
    });

    it('should rename entity on input change', () => {
        const entity = { id: 1, name: 'OldName', components: [], enabled: true };
        mockEditorStore.selectedEntityId = 1;
        mockSceneStore.entities.set(1, entity as any);
        
        render(<InspectorPanel />);
        const input = screen.getByDisplayValue('OldName');
        
        fireEvent.change(input, { target: { value: 'NewName' } });
        expect(mockSceneStore.updateEntity).toHaveBeenCalledWith(1, { name: 'NewName' });
    });

    it('should update component properties', () => {
        const entity = {
            id: 1,
            name: 'Actor',
            components: [
                { type: 'Transform', data: { position: [0, 0, 0] }, enabled: true }
            ]
        };
        mockEditorStore.selectedEntityId = 1;
        mockSceneStore.entities.set(1, entity as any);
        
        render(<InspectorPanel />);
        
        // Find the X input for position
        // The component uses Vector3Input with 3 inputs
        const xInput = screen.getAllByRole('spinbutton')[0]; // First number input
        fireEvent.change(xInput, { target: { value: '10' } });
        
        expect(mockSceneStore.updateEntity).toHaveBeenCalled();
    });

    it('should show add component menu', () => {
        const entity = { id: 1, name: 'Actor', components: [], enabled: true };
        mockEditorStore.selectedEntityId = 1;
        mockSceneStore.entities.set(1, entity as any);
        
        render(<InspectorPanel />);
        
        const addBtn = screen.getByText(/Add Component/i);
        fireEvent.click(addBtn);
        
        expect(screen.getByText('Mesh Renderer')).toBeDefined();
    });
});
