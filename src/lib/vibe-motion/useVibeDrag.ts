/**
 * useVibeDrag - High-performance Native Drag Hook
 * Uses PointerEvents and VibeSpring to provide an 'Elite' smooth dragging experience.
 */

import { useRef, useCallback, useEffect } from 'react';
import { VibeSpring, DefaultSpring } from './VibeSpring';
import { VibeMotionManager } from './VibeMotionManager';

interface DragOptions {
    onDragStart?: () => void;
    onDrag?: (x: number, y: number) => void;
    onDragEnd?: (x: number, y: number) => void;
    initialX?: number;
    initialY?: number;
}

export const useVibeDrag = (options: DragOptions = {}) => {
    const { onDragStart, onDrag, onDragEnd, initialX = 0, initialY = 0 } = options;
    
    // Physical state
    const springX = useRef(new VibeSpring(initialX));
    const springY = useRef(new VibeSpring(initialY));
    const manager = VibeMotionManager.getInstance();

    // Interaction state
    const isDragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const targetEl = useRef<HTMLElement | null>(null);

    const updatePosition = useCallback(() => {
        if (!targetEl.current) return;
        
        onDrag?.(springX.current.currentPosition, springY.current.currentPosition);
        
        targetEl.current.style.transform = `translate3d(${springX.current.currentPosition}px, ${springY.current.currentPosition}px, 0)`;
    }, [onDrag]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging.current) return;

        const nextX = e.clientX - offset.current.x;
        const nextY = e.clientY - offset.current.y;

        springX.current.setTarget(nextX);
        springY.current.setTarget(nextY);

        manager.register('vibe-drag-x', springX.current, updatePosition);
        manager.register('vibe-drag-y', springY.current, updatePosition);
    }, [manager, updatePosition]);

    const handlePointerUp = useCallback(() => {
        isDragging.current = false;
        targetEl.current?.releasePointerCapture(1); // simplified pointer ID
        
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);

        onDragEnd?.(springX.current.currentPosition, springY.current.currentPosition);
    }, [handlePointerMove, onDragEnd]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!targetEl.current) return;
        
        onDragStart?.();
        
        isDragging.current = true;
        const rect = targetEl.current.getBoundingClientRect();
        
        // Calculate offset from current spring position
        offset.current = {
            x: e.clientX - springX.current.currentPosition,
            y: e.clientY - springY.current.currentPosition
        };

        targetEl.current.setPointerCapture(e.pointerId);
        
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    }, [handlePointerMove, handlePointerUp, onDragStart]);

    const setPosition = useCallback((x: number, y: number, immediate = false) => {
        springX.current.setTarget(x);
        springY.current.setTarget(y);
        
        if (immediate) {
            // Force reset physics for immediate jump
            (springX.current as any).position = x;
            (springY.current as any).velocity = 0;
            (springY.current as any).position = y;
            (springY.current as any).velocity = 0;
            updatePosition();
        } else {
            manager.register('vibe-drag-x', springX.current, updatePosition);
            manager.register('vibe-drag-y', springY.current, updatePosition);
        }
    }, [manager, updatePosition]);

    return {
        dragProps: {
            onPointerDown: handlePointerDown,
            style: { touchAction: 'none', cursor: 'grab' } as React.CSSProperties
        },
        targetRef: targetEl,
        setPosition,
        isDragging: isDragging.current
    };
};
