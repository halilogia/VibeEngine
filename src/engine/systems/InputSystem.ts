/**
 * InputSystem - Handles keyboard, mouse, and touch input
 * Updates input state every frame for scripts to query.
 */

import { System } from '../core/System';
import type { Entity } from '../core/Entity';

export interface InputState {
    /** Horizontal axis (-1 to 1) */
    horizontal: number;
    /** Vertical axis (-1 to 1) */
    vertical: number;
    /** Mouse/touch position in screen space */
    mousePosition: { x: number; y: number };
    /** Mouse/touch position in normalized device coordinates (-1 to 1) */
    mouseNDC: { x: number; y: number };
    /** Whether primary mouse button or touch is active */
    isPointerDown: boolean;
    /** Keys currently held down */
    keysDown: Set<string>;
    /** Keys pressed this frame */
    keysPressed: Set<string>;
    /** Keys released this frame */
    keysReleased: Set<string>;
}

export class InputSystem extends System {
    readonly priority = 0; // Run first

    /** Current input state */
    readonly state: InputState = {
        horizontal: 0,
        vertical: 0,
        mousePosition: { x: 0, y: 0 },
        mouseNDC: { x: 0, y: 0 },
        isPointerDown: false,
        keysDown: new Set(),
        keysPressed: new Set(),
        keysReleased: new Set(),
    };

    /** Touch movement state */
    private touchStartX = 0;
    private touchStartY = 0;
    private isTouching = false;

    /** Axis mapping for keyboard */
    private keyAxisMapping = {
        horizontal: { positive: ['d', 'D', 'ArrowRight'], negative: ['a', 'A', 'ArrowLeft'] },
        vertical: { positive: ['w', 'W', 'ArrowUp'], negative: ['s', 'S', 'ArrowDown'] },
    };

    initialize(): void {
        // Keyboard events
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);

        // Mouse events
        window.addEventListener('mousedown', this.onPointerDown);
        window.addEventListener('mouseup', this.onPointerUp);
        window.addEventListener('mousemove', this.onMouseMove);

        // Touch events
        window.addEventListener('touchstart', this.onTouchStart, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd);
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });

        console.log('✅ InputSystem initialized');
    }

    update(_deltaTime: number, _entities: Entity[]): void {
        // Update axis values from keyboard
        this.updateAxisFromKeyboard();

        // Clear per-frame events at end of frame (in postUpdate)
    }

    postUpdate(): void {
        // Clear per-frame states
        this.state.keysPressed.clear();
        this.state.keysReleased.clear();
    }

    destroy(): void {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousedown', this.onPointerDown);
        window.removeEventListener('mouseup', this.onPointerUp);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchend', this.onTouchEnd);
        window.removeEventListener('touchmove', this.onTouchMove);
    }

    // ============ QUERY METHODS ============

    /** Check if key is currently held */
    isKeyDown(key: string): boolean {
        return this.state.keysDown.has(key) || this.state.keysDown.has(key.toLowerCase());
    }

    /** Check if key was pressed this frame */
    isKeyPressed(key: string): boolean {
        return this.state.keysPressed.has(key) || this.state.keysPressed.has(key.toLowerCase());
    }

    /** Check if key was released this frame */
    isKeyReleased(key: string): boolean {
        return this.state.keysReleased.has(key) || this.state.keysReleased.has(key.toLowerCase());
    }

    /** Get axis value (keyboard or touch) */
    getAxis(name: 'horizontal' | 'vertical'): number {
        return name === 'horizontal' ? this.state.horizontal : this.state.vertical;
    }

    // ============ PRIVATE HANDLERS ============

    private updateAxisFromKeyboard(): void {
        const mapping = this.keyAxisMapping;

        // Horizontal
        const hPositive = mapping.horizontal.positive.some(k => this.state.keysDown.has(k));
        const hNegative = mapping.horizontal.negative.some(k => this.state.keysDown.has(k));

        if (!this.isTouching) {
            this.state.horizontal = (hPositive ? 1 : 0) - (hNegative ? 1 : 0);
        }

        // Vertical
        const vPositive = mapping.vertical.positive.some(k => this.state.keysDown.has(k));
        const vNegative = mapping.vertical.negative.some(k => this.state.keysDown.has(k));

        if (!this.isTouching) {
            this.state.vertical = (vPositive ? 1 : 0) - (vNegative ? 1 : 0);
        }
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        if (!this.state.keysDown.has(e.key)) {
            this.state.keysPressed.add(e.key);
        }
        this.state.keysDown.add(e.key);
    };

    private onKeyUp = (e: KeyboardEvent): void => {
        this.state.keysDown.delete(e.key);
        this.state.keysReleased.add(e.key);
    };

    private onPointerDown = (e: MouseEvent): void => {
        this.state.isPointerDown = true;
        this.updateMousePosition(e.clientX, e.clientY);
    };

    private onPointerUp = (): void => {
        this.state.isPointerDown = false;
    };

    private onMouseMove = (e: MouseEvent): void => {
        this.updateMousePosition(e.clientX, e.clientY);
    };

    private onTouchStart = (e: TouchEvent): void => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.isTouching = true;
            this.state.isPointerDown = true;
            this.updateMousePosition(touch.clientX, touch.clientY);
        }
    };

    private onTouchEnd = (): void => {
        this.isTouching = false;
        this.state.isPointerDown = false;
        this.state.horizontal = 0;
        this.state.vertical = 0;
    };

    private onTouchMove = (e: TouchEvent): void => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.updateMousePosition(touch.clientX, touch.clientY);

            // Calculate virtual joystick from touch drag
            const dx = touch.clientX - this.touchStartX;
            const dy = touch.clientY - this.touchStartY;
            const maxDrag = 50; // pixels

            this.state.horizontal = Math.max(-1, Math.min(1, dx / maxDrag));
            this.state.vertical = Math.max(-1, Math.min(1, -dy / maxDrag)); // Inverted Y
        }
    };

    private updateMousePosition(x: number, y: number): void {
        this.state.mousePosition.x = x;
        this.state.mousePosition.y = y;

        // Convert to NDC (-1 to 1)
        this.state.mouseNDC.x = (x / window.innerWidth) * 2 - 1;
        this.state.mouseNDC.y = -(y / window.innerHeight) * 2 + 1;
    }
}
