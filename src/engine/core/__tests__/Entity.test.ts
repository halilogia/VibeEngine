import { describe, it, expect, vi } from 'vitest';
import { Entity } from '../Entity';
import { Component } from '../Component';

class MockComponent extends Component {
    static override readonly TYPE = 'MockComponent';
    
    onAttach = vi.fn();
    onDetach = vi.fn();
    onEnable = vi.fn();
    onDisable = vi.fn();
    
    clone() { return new MockComponent(); }
}

describe('Entity', () => {
    it('should initialize with a unique ID and name', () => {
        const e1 = new Entity('Test 1');
        const e2 = new Entity('Test 2');
        
        expect(e1.id).toBeDefined();
        expect(e2.id).toBeDefined();
        expect(e1.id).not.toBe(e2.id);
        expect(e1.name).toBe('Test 1');
    });

    it('should manage components correctly', () => {
        const entity = new Entity('Actor');
        const component = new MockComponent();
        
        entity.addComponent(component);
        
        expect(entity.hasComponent(MockComponent)).toBe(true);
        expect(entity.getComponent(MockComponent)).toBe(component);
        expect(component.entity).toBe(entity);
        expect(component.onAttach).toHaveBeenCalled();
    });

    it('should handle component removal', () => {
        const entity = new Entity('Actor');
        const component = new MockComponent();
        
        entity.addComponent(component);
        entity.removeComponent(MockComponent);
        
        expect(entity.hasComponent(MockComponent)).toBe(false);
        expect(component.entity).toBeNull();
        expect(component.onDetach).toHaveBeenCalled();
    });

    it('should manage hierarchy (parent/child)', () => {
        const parent = new Entity('Parent');
        const child = new Entity('Child');
        
        parent.addChild(child);
        
        expect(parent.children).toContain(child);
        expect(child.parent).toBe(parent);
        expect(child.activeInHierarchy).toBe(true);
        
        parent.enabled = false;
        expect(child.activeInHierarchy).toBe(false);
    });

    it('should clone with all components and children', () => {
        const root = new Entity('Root');
        root.addComponent(new MockComponent());
        
        const leaf = new Entity('Leaf');
        root.addChild(leaf);
        
        const cloned = root.clone();
        
        expect(cloned.name).toBe('Root_clone');
        expect(cloned.hasComponent(MockComponent)).toBe(true);
        expect(cloned.children.length).toBe(1);
        expect(cloned.children[0].name).toBe('Leaf_clone');
    });
});
