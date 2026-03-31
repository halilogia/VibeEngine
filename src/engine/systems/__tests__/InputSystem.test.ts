import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputSystem } from '../InputSystem';

describe('InputSystem', () => {
    let inputSystem: InputSystem;

    beforeEach(() => {
        inputSystem = new InputSystem();
        inputSystem.initialize();
        // Setup window dimensions for NDC calculation
        vi.stubGlobal('innerWidth', 1000);
        vi.stubGlobal('innerHeight', 1000);
    });

    afterEach(() => {
        inputSystem.destroy();
        vi.unstubAllGlobals();
    });

    it('should handle keyboard events', () => {
        // Mock keydown
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
        expect(inputSystem.isKeyDown('w')).toBe(true);
        expect(inputSystem.isKeyPressed('w')).toBe(true);

        // Update axis
        inputSystem.update(0.1, []);
        expect(inputSystem.getAxis('vertical')).toBe(1);

        // Post update should clear pressed state
        inputSystem.postUpdate();
        expect(inputSystem.isKeyDown('w')).toBe(true);
        expect(inputSystem.isKeyPressed('w')).toBe(false);

        // Mock keyup
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
        expect(inputSystem.isKeyDown('w')).toBe(false);
        expect(inputSystem.isKeyReleased('w')).toBe(true);
    });

    it('should calculate axis correctly from WASD', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        inputSystem.update(0.1, []);
        expect(inputSystem.getAxis('horizontal')).toBe(0); // D - A = 1 - 1 = 0

        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
        inputSystem.update(0.1, []);
        expect(inputSystem.getAxis('horizontal')).toBe(1); // D = 1
    });

    it('should handle mouse events and NDC', () => {
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 500 }));
        expect(inputSystem.state.mousePosition.x).toBe(500);
        expect(inputSystem.state.mousePosition.y).toBe(500);
        // NDC at center (500,500) of (1000,1000) should be (0, 0)
        expect(inputSystem.state.mouseNDC.x).toBeCloseTo(0);
        expect(inputSystem.state.mouseNDC.y).toBeCloseTo(0);

        window.dispatchEvent(new MouseEvent('mousedown'));
        expect(inputSystem.state.isPointerDown).toBe(true);
    });

    it('should detect taps and double taps', () => {
        // Mock short touch
        const touchStart = new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 100 } as any]
        });
        window.dispatchEvent(touchStart);
        
        const touchEnd = new TouchEvent('touchend', {
            changedTouches: [{ clientX: 105, clientY: 105 } as any]
        });
        window.dispatchEvent(touchEnd);
        
        expect(inputSystem.state.tapped).toBe(true);
    });

    it('should detect swipes', () => {
        // Mock long drag
        window.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 100 } as any]
        }));
        
        window.dispatchEvent(new TouchEvent('touchend', {
            changedTouches: [{ clientX: 200, clientY: 100 } as any]
        }));
        
        expect(inputSystem.state.swipe).toBe('right');
    });
});
