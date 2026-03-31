import { describe, it, expect, vi } from 'vitest';
import { Scene } from '../Scene';
import { Entity } from '../Entity';

describe('Scene', () => {
    it('should initialize with a name and empty entities', () => {
        const scene = new Scene('MainScene');
        expect(scene.name).toBe('MainScene');
        expect(scene.getAllEntities().length).toBe(0);
    });

    it('should add root-level entities', () => {
        const scene = new Scene('MainScene');
        const entity = new Entity('Player');
        
        scene.addEntity(entity);
        
        expect(scene.getAllEntities()).toContain(entity);
        expect(scene.getAllEntities().find(e => e.id === entity.id)).toBe(entity);
    });

    it('should track entire hierarchy in getAllEntities', () => {
        const scene = new Scene('MainScene');
        const parent = new Entity('Parent');
        const child = new Entity('Child');
        
        parent.addChild(child);
        scene.addEntity(parent);
        
        const all = scene.getAllEntities();
        expect(all.length).toBe(2);
        expect(all).toContain(parent);
        expect(all).toContain(child);
    });

    it('should remove entities correctly', () => {
        const scene = new Scene('MainScene');
        const entity = new Entity('Target');
        
        scene.addEntity(entity);
        scene.removeEntity(entity);
        
        expect(scene.getAllEntities().length).toBe(0);
        expect(scene.getAllEntities()).not.toContain(entity);
    });

    it('should clear all entities on clear()', () => {
        const scene = new Scene('MainScene');
        scene.addEntity(new Entity('E1'));
        scene.addEntity(new Entity('E2'));
        
        scene.clear();
        
        expect(scene.getAllEntities().length).toBe(0);
    });
});
