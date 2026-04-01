import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnimationSystem } from '../AnimationSystem';
import { Entity } from '@engine';
import { AnimationComponent } from '@engine';

describe('AnimationSystem', () => {
    let animationSystem: AnimationSystem;

    beforeEach(() => {
        animationSystem = new AnimationSystem();
    });

    it('should update animation components', () => {
        const entity = new Entity('AnimEntity');
        const animComp = entity.addComponent(new AnimationComponent());
        
        // Mock mixer since we don't need the real one for system test
        animComp.mixer = { update: vi.fn() } as any;
        
        const updateSpy = vi.spyOn(animComp, 'update');
        
        animationSystem.update(0.016, [entity]);
        
        expect(updateSpy).toHaveBeenCalledWith(0.016);
    });

    it('should skip components without mixers', () => {
        const entity = new Entity('NoMixerEntity');
        const animComp = entity.addComponent(new AnimationComponent());
        animComp.mixer = null;
        
        const updateSpy = vi.spyOn(animComp, 'update');
        
        animationSystem.update(0.016, [entity]);
        
        expect(updateSpy).not.toHaveBeenCalled();
    });
});
