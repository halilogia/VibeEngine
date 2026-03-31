import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from '../EventEmitter';

describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    it('should register and trigger listeners', () => {
        const callback = vi.fn();
        emitter.on('test-event', callback);
        
        emitter.emit('test-event', { data: 123 });
        
        expect(callback).toHaveBeenCalledWith({ data: 123 });
    });

    it('should handle multiple listeners for same event', () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        emitter.on('multi', cb1);
        emitter.on('multi', cb2);
        
        emitter.emit('multi', 'hello');
        
        expect(cb1).toHaveBeenCalledWith('hello');
        expect(cb2).toHaveBeenCalledWith('hello');
    });

    it('should remove listeners with off()', () => {
        const callback = vi.fn();
        emitter.on('remove-me', callback);
        emitter.off('remove-me', callback);
        
        emitter.emit('remove-me');
        
        expect(callback).not.toHaveBeenCalled();
    });

    it('should only trigger once() listeners once', () => {
        const callback = vi.fn();
        emitter.once('single', callback);
        
        emitter.emit('single');
        emitter.emit('single');
        
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should clear all listeners for an event', () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        emitter.on('clear', cb1);
        emitter.on('clear', cb2);
        
        emitter.removeAllListeners('clear');
        emitter.emit('clear');
        
        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
    });
});
