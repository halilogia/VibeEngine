import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { TransformComponent } from '../TransformComponent';
import { Entity } from '../../core/Entity';

describe('TransformComponent', () => {
    let transform: TransformComponent;

    beforeEach(() => {
        transform = new TransformComponent();
    });

    it('should initialize with identity values', () => {
        expect(transform.position.x).toBe(0);
        expect(transform.rotation.x).toBe(0);
        expect(transform.scale.x).toBe(1);
    });

    it('should update local matrix on change', () => {
        transform.setPosition(10, 20, 30);
        transform.setScale(2, 2, 2);
        transform.updateLocalMatrix();
        
        const pos = new THREE.Vector3();
        const scale = new THREE.Vector3();
        transform.localMatrix.decompose(pos, new THREE.Quaternion(), scale);
        
        expect(pos.x).toBe(10);
        expect(scale.x).toBe(2);
    });

    it('should calculate world position correctly with parenting', () => {
        const parent = new Entity('Parent');
        const parentTransform = parent.addComponent(new TransformComponent());
        parentTransform.setPosition(100, 0, 0);
        
        const child = new Entity('Child');
        const childTransform = child.addComponent(new TransformComponent());
        childTransform.setPosition(10, 0, 0);
        
        parent.addChild(child);
        
        const worldPos = childTransform.getWorldPosition();
        expect(worldPos.x).toBe(110);
    });

    it('should provide correct direction vectors', () => {
        // Rotate 90 degrees around Y axis
        transform.setRotation(0, Math.PI / 2, 0);
        
        const forward = transform.getForward();
        // After 90 deg Y rotation, forward (-Z) becomes -X
        expect(forward.x).toBeCloseTo(-1);
        expect(forward.z).toBeCloseTo(0);
    });

    it('should clone correctly', () => {
        transform.setPosition(1, 2, 3);
        const cloned = transform.clone();
        
        expect(cloned.position.x).toBe(1);
        expect(cloned.position.y).toBe(2);
        expect(cloned.position.z).toBe(3);
        expect(cloned.entity).toBeNull();
    });
});
