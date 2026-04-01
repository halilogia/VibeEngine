import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhysicsSystem } from '../PhysicsSystem';
import { Entity } from '../../core/Entity';
import { TransformComponent } from '../../components/TransformComponent';
import { RigidbodyComponent } from '../../components/RigidbodyComponent';
import { CollisionComponent } from '../../components/CollisionComponent';

describe('PhysicsSystem', () => {
    let physicsSystem: PhysicsSystem;

    beforeEach(() => {
        physicsSystem = new PhysicsSystem();
    });

    it('should update position based on velocity', () => {
        const entity = new Entity('PhysicsEntity');
        const transform = entity.addComponent(new TransformComponent());
        const rb = entity.addComponent(new RigidbodyComponent());
        
        rb.velocity.set(10, 0, 0);
        rb.useGravity = false;
        
        // Update for 1 second
        physicsSystem.update(1.0, [entity]);
        
        expect(transform.position.x).toBe(10);
    });

    it('should apply gravity to non-kinematic rigidbodies', () => {
        const entity = new Entity('GravityEntity');
        const transform = entity.addComponent(new TransformComponent());
        const rb = entity.addComponent(new RigidbodyComponent());
        
        rb.useGravity = true;
        // gravityScale does not exist; gravity vector is used directly
        
        // Update for 1 second
        physicsSystem.update(1.0, [entity]);
        
        // Gravity is typically [0, -9.81, 0]
        expect(rb.velocity.y).toBeLessThan(0);
        expect(transform.position.y).toBeLessThan(0);
    });


    it('should detect collisions between overlapping colliders', () => {
        const e1 = new Entity('E1');
        const t1 = e1.addComponent(new TransformComponent());
        const c1 = e1.addComponent(new CollisionComponent());
        c1.onCollisionEnter = vi.fn();
        
        const e2 = new Entity('E2');
        const t2 = e2.addComponent(new TransformComponent());
        const c2 = e2.addComponent(new CollisionComponent());
        c2.onCollisionEnter = vi.fn();
        
        // Overlap them
        t1.position.set(0, 0, 0);
        t2.position.set(0.5, 0, 0); // They are 1x1x1 by default
        
        physicsSystem.update(0.016, [e1, e2]);
        
        expect(c1.onCollisionEnter).toHaveBeenCalled();
        expect(c2.onCollisionEnter).toHaveBeenCalled();
        expect(c1.activeCollisions.has(c2)).toBe(true);
    });

    it('should detect triggers correctly', () => {
        const e1 = new Entity('Trigger');
        const t1 = e1.addComponent(new TransformComponent());
        const c1 = e1.addComponent(new CollisionComponent());
        c1.isTrigger = true;
        c1.onTriggerEnter = vi.fn();
        
        const e2 = new Entity('Body');
        const t2 = e2.addComponent(new TransformComponent());
        const c2 = e2.addComponent(new CollisionComponent());
        
        t1.position.set(0, 0, 0);
        t2.position.set(0.8, 0, 0);
        
        physicsSystem.update(0.016, [e1, e2]);
        
        expect(c1.onTriggerEnter).toHaveBeenCalledWith(c2);
    });

    it('should fire collision exit when moving apart', () => {
        const e1 = new Entity('E1');
        const t1 = e1.addComponent(new TransformComponent());
        const c1 = e1.addComponent(new CollisionComponent());
        c1.onCollisionExit = vi.fn();
        
        const e2 = new Entity('E2');
        const t2 = e2.addComponent(new TransformComponent());
        const c2 = e2.addComponent(new CollisionComponent());
        
        // 1. Initial Collision
        t1.position.set(0, 0, 0);
        t2.position.set(0, 0, 0);
        physicsSystem.update(0.016, [e1, e2]);
        
        // 2. Move apart
        t2.position.set(10, 10, 10);
        physicsSystem.update(0.016, [e1, e2]);
        
        expect(c1.onCollisionExit).toHaveBeenCalled();
        expect(c1.activeCollisions.has(c2)).toBe(false);
    });
});
