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
    /** Swipe direction detected this frame */
    swipe: 'left' | 'right' | 'up' | 'down' | null;
    /** Tap detected this frame */
    tapped: boolean;
    /** Double tap detected this frame */
    doubleTapped: boolean;
    /** Whether currently touching */
    isTouching: boolean;
}

/**
 * InputSystem - Provides a unified interface for keyboard, mouse, and touch interactions.
 * It translates raw browser events into a clean, frame-synced state that scripts
 * can easily query for movement, actions, and UI interaction.
 */
export class InputSystem extends System {
    /** 
     * Priority is 0 to ensure input is processed at the very beginning of the frame,
     * allowing all other systems and scripts to use the latest input state.
     */
    readonly priority = 0;

    /** Current snapshot of all input devices */
    readonly state: InputState = {
        horizontal: 0,
        vertical: 0,
        mousePosition: { x: 0, y: 0 },
        mouseNDC: { x: 0, y: 0 },
        isPointerDown: false,
        keysDown: new Set(),
        keysPressed: new Set(),
        keysReleased: new Set(),
        swipe: null,
        tapped: false,
        doubleTapped: false,
        isTouching: false,
    };

    /** Internal state for gesture detection (swipes/taps) */
    private touchStartX = 0;
    private touchStartY = 0;
    private touchStartTime = 0;
    private lastTapTime = 0;
    private touchMoved = false;

    /** Configuration constants for gesture sensitivity */
    private readonly SWIPE_THRESHOLD = 50;
    private readonly TAP_DURATION = 200;
    private readonly DOUBLE_TAP_GAP = 300;

    /** Maps physical keys to virtual movement axes */
    private keyAxisMapping = {
        horizontal: { positive: ['d', 'D', 'ArrowRight'], negative: ['a', 'A', 'ArrowLeft'] },
        vertical: { positive: ['w', 'W', 'ArrowUp'], negative: ['s', 'S', 'ArrowDown'] },
    };

    /**
     * Attaches global window listeners for input events.
     */
    initialize(): void {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousedown', this.onPointerDown);
        window.addEventListener('mouseup', this.onPointerUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('touchstart', this.onTouchStart, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd);
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });

        console.log('✅ InputSystem: Unified input listener attached');
    }

    /**
     * Updates axis values from keyboard state.
     * @param _deltaTime - Standard delta time.
     */
    update(_deltaTime: number, _entities: Entity[]): void {
        this.updateAxisFromKeyboard();
    }

    /**
     * Clears transient input states (taps, swipes, 'pressed' flags) at the end of every frame.
     */
    postUpdate(): void {
        this.state.keysPressed.clear();
        this.state.keysReleased.clear();
        this.state.swipe = null;
        this.state.tapped = false;
        this.state.doubleTapped = false;
    }

    /**
     * Detaches all global listeners to prevent memory leaks.
     */
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

    /** 
     * Checks if a specific key is currently being held down. 
     * Case-insensitive.
     */
    isKeyDown(key: string): boolean {
        return this.state.keysDown.has(key) || this.state.keysDown.has(key.toLowerCase());
    }

    /** 
     * Checks if a specific key was first pressed in the current frame. 
     */
    isKeyPressed(key: string): boolean {
        return this.state.keysPressed.has(key) || this.state.keysPressed.has(key.toLowerCase());
    }

    /** 
     * Checks if a specific key was released in the current frame. 
     */
    isKeyReleased(key: string): boolean {
        return this.state.keysReleased.has(key) || this.state.keysReleased.has(key.toLowerCase());
    }

    /** 
     * Returns the value of a virtual movement axis (-1.0 to 1.0). 
     */
    getAxis(name: 'horizontal' | 'vertical'): number {
        return name === 'horizontal' ? this.state.horizontal : this.state.vertical;
    }

    // ============ PRIVATE HANDLERS ============

    /**
     * Converts keyboard state into normalized axis values.
     */
    private updateAxisFromKeyboard(): void {
        const mapping = this.keyAxisMapping;

        // Horizontal axis calculation
        const hPositive = mapping.horizontal.positive.some(k => this.state.keysDown.has(k));
        const hNegative = mapping.horizontal.negative.some(k => this.state.keysDown.has(k));

        if (!this.state.isTouching) {
            this.state.horizontal = (hPositive ? 1 : 0) - (hNegative ? 1 : 0);
        }

        // Vertical axis calculation
        const vPositive = mapping.vertical.positive.some(k => this.state.keysDown.has(k));
        const vNegative = mapping.vertical.negative.some(k => this.state.keysDown.has(k));

        if (!this.state.isTouching) {
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
            this.touchStartTime = Date.now();
            this.touchMoved = false;
            this.state.isTouching = true;
            this.state.isPointerDown = true;
            this.updateMousePosition(touch.clientX, touch.clientY);
        }
    };

    private onTouchEnd = (e: TouchEvent): void => {
        const touchEndX = e.changedTouches[0]?.clientX ?? this.touchStartX;
        const touchEndY = e.changedTouches[0]?.clientY ?? this.touchStartY;
        const dx = touchEndX - this.touchStartX;
        const dy = touchEndY - this.touchStartY;
        const duration = Date.now() - this.touchStartTime;

        // Gesture analysis for swipe detection
        if (!this.touchMoved || Math.abs(dx) > this.SWIPE_THRESHOLD || Math.abs(dy) > this.SWIPE_THRESHOLD) {
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > this.SWIPE_THRESHOLD) {
                this.state.swipe = dx > 0 ? 'right' : 'left';
            } else if (Math.abs(dy) > this.SWIPE_THRESHOLD) {
                this.state.swipe = dy > 0 ? 'down' : 'up';
            }
        }

        // Single and Double tap detection logic
        if (duration < this.TAP_DURATION && !this.touchMoved && Math.abs(dx) < 20 && Math.abs(dy) < 20) {
            const now = Date.now();
            if (now - this.lastTapTime < this.DOUBLE_TAP_GAP) {
                this.state.doubleTapped = true;
            } else {
                this.state.tapped = true;
            }
            this.lastTapTime = now;
        }

        // Reset state on release
        this.state.isTouching = false;
        this.state.isPointerDown = false;
        this.state.horizontal = 0;
        this.state.vertical = 0;
    };

    private onTouchMove = (e: TouchEvent): void => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.updateMousePosition(touch.clientX, touch.clientY);
            this.touchMoved = true;

            // Virtual Joystick Implementation: Calculate movement axes from drag distance
            const dx = touch.clientX - this.touchStartX;
            const dy = touch.clientY - this.touchStartY;
            const maxDrag = 50; // Threshold for full axis value

            this.state.horizontal = Math.max(-1, Math.min(1, dx / maxDrag));
            this.state.vertical = Math.max(-1, Math.min(1, -dy / maxDrag)); // Inverted screen vs world Y
        }
    };

    /**
     * Updates mouse coordinates and calculates Normalized Device Coordinates (NDC).
     */
    private updateMousePosition(x: number, y: number): void {
        this.state.mousePosition.x = x;
        this.state.mousePosition.y = y;

        // Convert raw pixels to NDC space (-1.0 to 1.0) for Raycasting/UI scaling
        this.state.mouseNDC.x = (x / window.innerWidth) * 2 - 1;
        this.state.mouseNDC.y = -(y / window.innerHeight) * 2 + 1;
    }
}
