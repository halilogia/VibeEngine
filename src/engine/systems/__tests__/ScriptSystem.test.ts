import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScriptSystem } from '../ScriptSystem';
import { Entity } from '@engine';
import { ScriptComponent } from '@engine';

describe('ScriptSystem', () => {
    let scriptSystem: ScriptSystem;
    let mockApp: any;

    beforeEach(() => {
        mockApp = {
            scene: {
                getAllEntities: vi.fn().mockReturnValue([])
            }
        };
        scriptSystem = new ScriptSystem();
        scriptSystem.app = mockApp;
    });

    it('should call start exactly once and then update', () => {
        const entity = new Entity('ScriptEntity');
        const scriptComp = entity.addComponent(new ScriptComponent());
        
        const startSpy = vi.spyOn(scriptComp, 'startAll');
        const updateSpy = vi.spyOn(scriptComp, 'updateAll');
        
        // 1. First update
        scriptSystem.update(0.016, [entity]);
        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).toHaveBeenCalledTimes(1);
        
        // 2. Second update
        scriptSystem.update(0.016, [entity]);
        expect(startSpy).toHaveBeenCalledTimes(1); // Still once
        expect(updateSpy).toHaveBeenCalledTimes(2);
    });

    it('should call lateUpdate in postUpdate phase', () => {
        const entity = new Entity('LateEntity');
        const scriptComp = entity.addComponent(new ScriptComponent());
        
        mockApp.scene.getAllEntities.mockReturnValue([entity]);
        const lateUpdateSpy = vi.spyOn(scriptComp, 'lateUpdateAll');
        
        scriptSystem.postUpdate(0.016);
        
        expect(lateUpdateSpy).toHaveBeenCalled();
    });

    it('should reset started tracking', () => {
        const entity = new Entity('ResetEntity');
        const scriptComp = entity.addComponent(new ScriptComponent());
        
        const startSpy = vi.spyOn(scriptComp, 'startAll');
        
        scriptSystem.update(0.016, [entity]);
        expect(startSpy).toHaveBeenCalledTimes(1);
        
        scriptSystem.reset();
        
        scriptSystem.update(0.016, [entity]);
        expect(startSpy).toHaveBeenCalledTimes(2); // Called again after reset
    });
});
