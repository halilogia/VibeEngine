

import { System } from '@engine';
import type { Entity } from '@engine';

export interface InputState {
    
    horizontal: number;
    
    vertical: number;
    
    mousePosition: { x: number; y: number };
    
    mouseNDC: { x: number; y: number };
    
    isPointerDown: boolean;
    
    keysDown: Set<string>;
    
    keysPressed: Set<string>;
    
    keysReleased: Set<string>;
    
    swipe: 'left' | 'right' | 'up' | 'down' | null;
    
    tapped: boolean;
    
    doubleTapped: boolean;
    
    isTouching: boolean;
}

export class InputSystem extends System {
    
    readonly priority = 0;

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

    private touchStartX = 0;
    private touchStartY = 0;
    private touchStartTime = 0;
    private lastTapTime = 0;
    private touchMoved = false;

    private readonly SWIPE_THRESHOLD = 50;
    private readonly TAP_DURATION = 200;
    private readonly DOUBLE_TAP_GAP = 300;

    private keyAxisMapping = {
        horizontal: { positive: ['d', 'D', 'ArrowRight'], negative: ['a', 'A', 'ArrowLeft'] },
        vertical: { positive: ['w', 'W', 'ArrowUp'], negative: ['s', 'S', 'ArrowDown'] },
    };

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

    update(_deltaTime: number, _entities: Entity[]): void {
        this.updateAxisFromKeyboard();
    }

    postUpdate(): void {
        this.state.keysPressed.clear();
        this.state.keysReleased.clear();
        this.state.swipe = null;
        this.state.tapped = false;
        this.state.doubleTapped = false;
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

    isKeyDown(key: string): boolean {
        return this.state.keysDown.has(key) || this.state.keysDown.has(key.toLowerCase());
    }

    isKeyPressed(key: string): boolean {
        return this.state.keysPressed.has(key) || this.state.keysPressed.has(key.toLowerCase());
    }

    isKeyReleased(key: string): boolean {
        return this.state.keysReleased.has(key) || this.state.keysReleased.has(key.toLowerCase());
    }

    getAxis(name: 'horizontal' | 'vertical'): number {
        return name === 'horizontal' ? this.state.horizontal : this.state.vertical;
    }

    private updateAxisFromKeyboard(): void {
        const mapping = this.keyAxisMapping;

        const hPositive = mapping.horizontal.positive.some(k => this.state.keysDown.has(k));
        const hNegative = mapping.horizontal.negative.some(k => this.state.keysDown.has(k));

        if (!this.state.isTouching) {
            this.state.horizontal = (hPositive ? 1 : 0) - (hNegative ? 1 : 0);
        }

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

        if (!this.touchMoved || Math.abs(dx) > this.SWIPE_THRESHOLD || Math.abs(dy) > this.SWIPE_THRESHOLD) {
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > this.SWIPE_THRESHOLD) {
                this.state.swipe = dx > 0 ? 'right' : 'left';
            } else if (Math.abs(dy) > this.SWIPE_THRESHOLD) {
                this.state.swipe = dy > 0 ? 'down' : 'up';
            }
        }

        if (duration < this.TAP_DURATION && !this.touchMoved && Math.abs(dx) < 20 && Math.abs(dy) < 20) {
            const now = Date.now();
            if (now - this.lastTapTime < this.DOUBLE_TAP_GAP) {
                this.state.doubleTapped = true;
            } else {
                this.state.tapped = true;
            }
            this.lastTapTime = now;
        }

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

            const dx = touch.clientX - this.touchStartX;
            const dy = touch.clientY - this.touchStartY;
            const maxDrag = 50; 

            this.state.horizontal = Math.max(-1, Math.min(1, dx / maxDrag));
            this.state.vertical = Math.max(-1, Math.min(1, -dy / maxDrag)); 
        }
    };

    private updateMousePosition(x: number, y: number): void {
        this.state.mousePosition.x = x;
        this.state.mousePosition.y = y;

        this.state.mouseNDC.x = (x / window.innerWidth) * 2 - 1;
        this.state.mouseNDC.y = -(y / window.innerHeight) * 2 + 1;
    }
}
