import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { CollisionComponent } from '../CollisionComponent';
import { Entity } from '@engine';
import { TransformComponent } from '../TransformComponent';

describe('CollisionComponent', () => {
    let c1: CollisionComponent;
    let c2: CollisionComponent;
    let e1: Entity;
    let e2: Entity;

    beforeEach(() => {
        e1 = new Entity('E1');
        e1.addComponent(new TransformComponent());
        c1 = e1.addComponent(new CollisionComponent());

        e2 = new Entity('E2');
        e2.addComponent(new TransformComponent());
        c2 = e2.addComponent(new CollisionComponent());
    });

    it('should calculate world bounding box correctly', () => {
        const transform = e1.getComponent(TransformComponent)!;
        transform.position.set(10, 0, 0);
        transform.setScale(2); 
        
        c1.setBox(1, 1, 1);
        const bbox = c1.getWorldBoundingBox();

        expect(bbox.min.x).toBe(9);
        expect(bbox.max.x).toBe(11);
    });

    it('should calculate world bounding sphere correctly', () => {
        const transform = e1.getComponent(TransformComponent)!;
        transform.position.set(0, 5, 0);
        transform.setScale(3);
        
        c1.setSphere(1);
        const sphere = c1.getWorldBoundingSphere();
        
        expect(sphere.center.y).toBe(5);
        expect(sphere.radius).toBe(3);
    });

    it('should detect sphere-sphere intersection', () => {
        c1.setSphere(1);
        c2.setSphere(1);
        
        e1.getComponent(TransformComponent)!.position.set(0, 0, 0);
        e2.getComponent(TransformComponent)!.position.set(1.5, 0, 0);
        
        expect(c1.intersects(c2)).toBe(true);
        
        e2.getComponent(TransformComponent)!.position.set(2.5, 0, 0);
        expect(c1.intersects(c2)).toBe(false);
    });

    it('should detect box-box intersection', () => {
        c1.setBox(1, 1, 1);
        c2.setBox(1, 1, 1);
        
        e1.getComponent(TransformComponent)!.position.set(0, 0, 0);
        e2.getComponent(TransformComponent)!.position.set(0.9, 0, 0);
        
        expect(c1.intersects(c2)).toBe(true);
        
        e2.getComponent(TransformComponent)!.position.set(1.1, 0, 0);
        expect(c1.intersects(c2)).toBe(false);
    });

    it('should respect collision layers and masks', () => {
        c1.layer = 1; 
        c1.mask = 1 << 2; 
        
        c2.layer = 2; 
        c2.mask = 0xFFFFFFFF; 
        
        e1.getComponent(TransformComponent)!.position.set(0, 0, 0);
        e2.getComponent(TransformComponent)!.position.set(0, 0, 0);
        
        expect(c1.intersects(c2)).toBe(true);
        
        c1.mask = 1 << 3; 
        expect(c1.intersects(c2)).toBe(false);
    });
});
