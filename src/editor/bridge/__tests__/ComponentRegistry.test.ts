import { describe, it, expect } from 'vitest';
import { getComponentInfo, getAvailableComponents, COMPONENT_REGISTRY } from '../ComponentRegistry';

describe('ComponentRegistry', () => {
    it('should contain default components', () => {
        expect(COMPONENT_REGISTRY.length).toBeGreaterThan(0);
        
        const types = COMPONENT_REGISTRY.map(c => c.type);
        expect(types).toContain('Transform');
        expect(types).toContain('Render');
        expect(types).toContain('Rigidbody');
        expect(types).toContain('Script');
    });

    it('should return correct component info by type', () => {
        const info = getComponentInfo('Transform');
        expect(info).toBeDefined();
        expect(info?.type).toBe('Transform');
        expect(info?.label).toBe('Transform');
        expect(info?.properties.length).toBeGreaterThan(0);
    });

    it('should return undefined for unknown component type', () => {
        const info = getComponentInfo('UnknownNonExistentComponent');
        expect(info).toBeUndefined();
    });

    it('should return all available components', () => {
        const components = getAvailableComponents();
        expect(components).toEqual(COMPONENT_REGISTRY);
    });

    it('should have correct property structure for Transform', () => {
        const info = getComponentInfo('Transform');
        const posProp = info?.properties.find(p => p.name === 'position');
        
        expect(posProp).toBeDefined();
        expect(posProp?.type).toBe('vector3');
        expect(posProp?.default).toEqual([0, 0, 0]);
    });
});
