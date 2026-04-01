import { describe, it, expect } from 'vitest';
import { getAvailableScripts, SCRIPT_REGISTRY } from '../ScriptRegistry';

describe('ScriptRegistry', () => {
    it('should contain predefined scripts', () => {
        const scripts = getAvailableScripts();
        expect(scripts.length).toBeGreaterThan(0);
        
        const names = scripts.map(s => s.name);
        expect(names).toContain('RotatorScript');
        expect(names).toContain('PlayerMoveScript');
    });

    it('should have correct description for RotatorScript', () => {
        const rotator = SCRIPT_REGISTRY.find(s => s.name === 'RotatorScript');
        expect(rotator?.description).toContain('Y axis');
    });

    it('should return all available scripts', () => {
        const scripts = getAvailableScripts();
        expect(scripts).toEqual(SCRIPT_REGISTRY);
    });

    it('should have properties with default values', () => {
        const pulse = SCRIPT_REGISTRY.find(s => s.name === 'PulseScaleScript');
        const speedProp = pulse?.properties.find(p => p.name === 'speed');
        
        expect(speedProp).toBeDefined();
        expect(speedProp?.default).toBe(2.0);
    });
});
