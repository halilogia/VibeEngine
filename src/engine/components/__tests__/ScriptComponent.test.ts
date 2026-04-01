import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScriptComponent, Script } from '../ScriptComponent';
import { Entity } from '@engine';

// Mock concrete script implementation
class TestScript extends Script {
    initCalled = false;
    startCalled = 0;
    updateCount = 0;
    lastDelta = 0;
    destroyed = false;

    override initialize() { this.initCalled = true; }
    override start() { this.startCalled++; }
    override update(dt: number) { 
        this.updateCount++; 
        this.lastDelta = dt;
    }
    // Added lateUpdate to allow spying in tests
    override lateUpdate(dt: number) { }
    override destroy() { this.destroyed = true; }
}

describe('ScriptComponent', () => {
    let scriptComp: ScriptComponent;
    let entity: Entity;
    let mockApp: any;

    beforeEach(() => {
        entity = new Entity('ScriptedEntity');
        scriptComp = entity.addComponent(new ScriptComponent());
        mockApp = { id: 'MockApp' };
        scriptComp.app = mockApp;
    });

    it('should add a script and call initialize', () => {
        const script = new TestScript();
        scriptComp.addScript(script);
        
        expect(scriptComp.scripts.length).toBe(1);
        expect(script.initCalled).toBe(true);
        expect(script.entity).toBe(entity);
        expect(script.app).toBe(mockApp);
    });

    it('should call startAll exactly once', () => {
        const script = scriptComp.addScript(new TestScript());
        
        scriptComp.startAll();
        expect(script.startCalled).toBe(1);
        
        scriptComp.startAll(); // Second call
        expect(script.startCalled).toBe(1); // Should still be 1
    });

    it('should call updateAll and lateUpdateAll', () => {
        const script = scriptComp.addScript(new TestScript());
        
        scriptComp.updateAll(0.1);
        expect(script.updateCount).toBe(1);
        expect(script.lastDelta).toBe(0.1);
        
        const lateSpy = vi.spyOn(script, 'lateUpdate');
        scriptComp.lateUpdateAll(0.2);
        expect(lateSpy).toHaveBeenCalledWith(0.2);
    });

    it('should handle script removal and destruction', () => {
        const script = scriptComp.addScript(new TestScript());
        
        const removed = scriptComp.removeScript(script);
        expect(removed).toBe(true);
        expect(script.destroyed).toBe(true);
        expect(scriptComp.scripts.length).toBe(0);
    });

    it('should clone scripts and preserve properties', () => {
        const script = scriptComp.addScript(new TestScript());
        script.lastDelta = 99; // Set a property
        
        const clonedComp = scriptComp.clone();
        expect(clonedComp.scripts.length).toBe(1);
        
        const clonedScript = clonedComp.scripts[0] as TestScript;
        expect(clonedScript.lastDelta).toBe(99);
        expect(clonedScript).not.toBe(script); // Should be a new instance
    });
});
