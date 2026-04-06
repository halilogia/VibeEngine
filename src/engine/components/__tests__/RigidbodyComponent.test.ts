import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { RigidbodyComponent } from '../RigidbodyComponent';

describe('RigidbodyComponent', () => {
    let rb: RigidbodyComponent;

    beforeEach(() => {
        rb = new RigidbodyComponent();
    });

    it('should apply force correctly (F = ma)', () => {
        rb.mass = 2; 
        const force = new THREE.Vector3(10, 0, 0); 
        rb.addForce(force); 
        
        expect(rb.velocity.x).toBe(5);
    });

    it('should clamp velocity to max speed', () => {
        rb.maxSpeed = 10;
        rb.velocity.set(20, 0, 0);
        rb.clampVelocity();
        
        expect(rb.velocity.length()).toBe(10);
    });

    it('should apply drag over time', () => {
        rb.velocity.set(10, 0, 0);
        rb.drag = 0.5;

        rb.applyDrag(1.0);
        expect(rb.velocity.x).toBe(5);

        rb.applyDrag(0.5);
        expect(rb.velocity.x).toBe(3.75);
    });

    it('should apply gravity correctly', () => {
        rb.velocity.set(0, 0, 0);
        rb.gravity.set(0, -10, 0);
        rb.useGravity = true;
        
        rb.applyGravity(1.0); 
        expect(rb.velocity.y).toBe(-10);
    });

    it('should NOT apply physics if isKinematic is true', () => {
        rb.isKinematic = true;
        rb.velocity.set(0, 0, 0);
        
        rb.addForce(new THREE.Vector3(100, 0, 0));
        rb.applyGravity(1.0);
        
        expect(rb.velocity.x).toBe(0);
        expect(rb.velocity.y).toBe(0);
    });

    it('should clone properties correctly', () => {
        rb.mass = 5;
        rb.drag = 0.8;
        const cloned = rb.clone();
        
        expect(cloned.mass).toBe(5);
        expect(cloned.drag).toBe(0.8);
    });
});
