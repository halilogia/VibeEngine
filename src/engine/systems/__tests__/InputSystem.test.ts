import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputSystem } from '../InputSystem';

describe('InputSystem', () => {
    let inputSystem: InputSystem;

    beforeEach(() => {
        inputSystem = new InputSystem();
        inputSystem.initialize();
        
        vi.stubGlobal('innerWidth', 1000);
        vi.stubGlobal('innerHeight', 1000);
    });

    afterEach(() => {
        inputSystem.destroy();
        vi.unstubAllGlobals();
    });

    it('should handle keyboard events and calculate Axis', () => {
        // Press W
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
        inputSystem.update(0.1, []);
        expect(inputSystem.getAxis('Vertical')).toBe(1);

        // Move to postUpdate
        inputSystem.postUpdate();
        
        // Release W
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
        inputSystem.update(0.1, []);
        expect(inputSystem.getAxis('Vertical')).toBe(0);
    });

    it('should calculate Horizontal axis correctly from WASD', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        inputSystem.update(0.1, []);
        expect(inputSystem.getAxis('Horizontal')).toBe(0); 

        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
        inputSystem.update(0.1, []);
        expect(inputSystem.getAxis('Horizontal')).toBe(1); 
    });

    it('should handle Buttons (Jump/Fire)', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
        inputSystem.update(0.1, []);
        expect(inputSystem.getButton('Jump')).toBe(true);

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
        inputSystem.update(0.1, []);
        expect(inputSystem.getButton('Fire')).toBe(true);
    });
});
