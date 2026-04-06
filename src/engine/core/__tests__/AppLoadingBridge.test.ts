import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initLoadingBridge, updateLoadingStatus } from '../AppLoadingBridge';

describe('AppLoadingBridge', () => {
    beforeEach(() => {
        
        delete (window as any).VibeLoading;
    });

    it('should initialize the loading bridge on the window object', () => {
        initLoadingBridge();
        expect((window as any).VibeLoading).toBeDefined();
        expect((window as any).VibeLoading.status).toBe('initializing');
        expect((window as any).VibeLoading.progress).toBe(0);
    });

    it('should update progress correctly based on total modules', () => {
        initLoadingBridge();
        const total = 4;

        updateLoadingStatus('ModuleA', 'success', 'Ready', total);
        expect((window as any).VibeLoading.progress).toBe(25);
        expect((window as any).VibeLoading.modules['ModuleA']).toBe('success');

        updateLoadingStatus('ModuleB', 'success', 'Ready', total);
        expect((window as any).VibeLoading.progress).toBe(50);
    });

    it('should handle errors in module loading', () => {
        initLoadingBridge();
        const total = 2;

        updateLoadingStatus('ModuleA', 'error', 'Failed!', total);
        expect((window as any).VibeLoading.modules['ModuleA']).toBe('error');
        expect((window as any).VibeLoading.details).toBe('Failed!');
    });

    it('should set status to ready when progress reached 100%', () => {
        initLoadingBridge();
        const total = 1;

        updateLoadingStatus('Main', 'success', 'All good', total);
        expect((window as any).VibeLoading.progress).toBe(100);
        expect((window as any).VibeLoading.status).toBe('ready');
    });

    it('should not throw if the bridge is not initialized', () => {
        expect(() => {
            updateLoadingStatus('Module', 'success', 'Details', 1);
        }).not.toThrow();
    });
});
