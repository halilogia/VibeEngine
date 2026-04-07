import { System, Entity } from '@engine';

export type ActionType = 'Button' | 'Axis';

export interface ActionMapping {
    name: string;
    type: ActionType;
    keys: string[];
    // For Axis
    positiveKeys?: string[];
    negativeKeys?: string[];
}

export interface InputState {
    horizontal: number;
    vertical: number;
    mousePosition: { x: number; y: number };
    mouseNDC: { x: number; y: number };
    isPointerDown: boolean;
    swipe: 'left' | 'right' | 'up' | 'down' | null;
    tapped: boolean;
    doubleTapped: boolean;
    isTouching: boolean;
}

export class InputSystem extends System {
    readonly priority = -100; // Run early

    readonly state: InputState = {
        horizontal: 0,
        vertical: 0,
        mousePosition: { x: 0, y: 0 },
        mouseNDC: { x: 0, y: 0 },
        isPointerDown: false,
        swipe: null,
        tapped: false,
        doubleTapped: false,
        isTouching: false,
    };

    private keysDown: Set<string> = new Set();
    private keysPressed: Set<string> = new Set();
    private keysReleased: Set<string> = new Set();

    private actions: Map<string, ActionMapping> = new Map();
    private actionValues: Map<string, number> = new Map();

    private touchStartX = 0;
    private touchStartY = 0;
    private touchStartTime = 0;
    private lastTapTime = 0;
    private touchMoved = false;

    private readonly SWIPE_THRESHOLD = 50;
    private readonly TAP_DURATION = 200;
    private readonly DOUBLE_TAP_GAP = 300;

    initialize(): void {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousedown', this.onPointerDown);
        window.addEventListener('mouseup', this.onPointerUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('touchstart', this.onTouchStart, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd);
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });

        // Default ELITE Mappings
        this.registerAction({ name: 'Horizontal', type: 'Axis', keys: [], positiveKeys: ['d', 'ArrowRight'], negativeKeys: ['a', 'ArrowLeft'] });
        this.registerAction({ name: 'Vertical', type: 'Axis', keys: [], positiveKeys: ['w', 'ArrowUp'], negativeKeys: ['s', 'ArrowDown'] });
        this.registerAction({ name: 'Jump', type: 'Button', keys: [' ', 'Spacebar'] });
        this.registerAction({ name: 'Fire', type: 'Button', keys: ['f', 'F', 'Control'] });

        console.log('🎮 InputSystem: Action-Based Mapping Core Online');
    }

    update(_deltaTime: number, _entities: Entity[]): void {
        this.actions.forEach((mapping, name) => {
            if (mapping.type === 'Button') {
                const isDown = mapping.keys.some(k => this.keysDown.has(k.toLowerCase()) || this.keysDown.has(k));
                this.actionValues.set(name, isDown ? 1 : 0);
            } else {
                const pos = mapping.positiveKeys?.some(k => this.keysDown.has(k.toLowerCase()) || this.keysDown.has(k)) ? 1 : 0;
                const neg = mapping.negativeKeys?.some(k => this.keysDown.has(k.toLowerCase()) || this.keysDown.has(k)) ? 1 : 0;
                this.actionValues.set(name, pos - neg);
            }
        });

        // Sync legacy state
        this.state.horizontal = this.getAxis('Horizontal');
        this.state.vertical = this.getAxis('Vertical');
    }

    postUpdate(): void {
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.state.swipe = null;
        this.state.tapped = false;
        this.state.doubleTapped = false;
    }

    // Legacy compatibility
    isKeyDown(key: string): boolean {
        return this.keysDown.has(key) || this.keysDown.has(key.toLowerCase());
    }

    isKeyPressed(key: string): boolean {
        return this.keysPressed.has(key) || this.keysPressed.has(key.toLowerCase());
    }

    isKeyReleased(key: string): boolean {
        return this.keysReleased.has(key) || this.keysReleased.has(key.toLowerCase());
    }

    // ELITE API
    getAxis(name: string): number {
        return this.actionValues.get(name) ?? 0;
    }

    getAction(name: string): number {
        return this.getAxis(name);
    }

    getButton(name: string): boolean {
        return this.getAction(name) > 0.5;
    }

    getButtonDown(name: string): boolean {
        const mapping = this.actions.get(name);
        if (!mapping) return false;
        return mapping.keys.some(k => this.keysPressed.has(k.toLowerCase()) || this.keysPressed.has(k));
    }

    registerAction(mapping: ActionMapping): void {
        this.actions.set(mapping.name, mapping);
        this.actionValues.set(mapping.name, 0);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (!this.keysDown.has(e.key)) {
            this.keysPressed.add(e.key);
        }
        this.keysDown.add(e.key);
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        this.keysDown.delete(e.key);
        this.keysReleased.add(e.key);
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

    destroy(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousedown', this.onPointerDown);
        window.removeEventListener('mouseup', this.onPointerUp);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchend', this.onTouchEnd);
        window.removeEventListener('touchmove', this.onTouchMove);
    }
}