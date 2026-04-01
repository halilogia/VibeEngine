/**
 * VibeMotion - React Animation Component
 * A lightweight alternative to framer-motion's motion.div.
 */

import React, { useRef, useEffect, useState } from 'react';
import { VibeSpring, DefaultSpring, type SpringConfig } from './VibeSpring';
import { VibeMotionManager } from './VibeMotionManager';

interface VibeMotionProps extends React.HTMLAttributes<HTMLDivElement> {
    animate?: {
        x?: number;
        y?: number;
        scale?: number;
        opacity?: number;
    };
    transition?: SpringConfig;
    initial?: {
        x?: number;
        y?: number;
        scale?: number;
        opacity?: number;
    };
}

export const VibeMotion: React.FC<VibeMotionProps> = ({ 
    animate, 
    transition = DefaultSpring, 
    initial,
    children, 
    style,
    ...props 
}) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const springs = useRef<Record<string, VibeSpring>>({});
    const manager = VibeMotionManager.getInstance();

    useEffect(() => {
        if (!elementRef.current) return;

        // Initialize springs for any animated property
        if (animate) {
            Object.entries(animate).forEach(([key, value]) => {
                if (!springs.current[key]) {
                    const startValue = initial?.[key as keyof typeof initial] ?? value;
                    springs.current[key] = new VibeSpring(startValue, transition);
                }
                springs.current[key].setTarget(value);

                manager.register(`vibe-motion-${elementRef.current?.id}-${key}`, springs.current[key], (pos) => {
                    if (!elementRef.current) return;
                    updateElementStyles(elementRef.current, springs.current);
                });
            });
        }
    }, [animate, transition, initial, manager]);

    const updateElementStyles = (el: HTMLDivElement, activeSprings: Record<string, VibeSpring>) => {
        const x = activeSprings.x?.currentPosition ?? 0;
        const y = activeSprings.y?.currentPosition ?? 0;
        const scale = activeSprings.scale?.currentPosition ?? 1;
        const opacity = activeSprings.opacity?.currentPosition ?? 1;

        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        el.style.opacity = opacity.toString();
    };

    return (
        <div 
            ref={elementRef} 
            style={{ 
                ...style, 
                willChange: 'transform, opacity' 
            }} 
            {...props}
        >
            {children}
        </div>
    );
};
