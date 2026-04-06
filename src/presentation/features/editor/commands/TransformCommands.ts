

import * as THREE from 'three';
import { Entity } from '@engine';
import { TransformComponent } from '@engine';
import type { ICommand } from './HistoryManager';

export class MoveCommand implements ICommand {
    description: string;
    private entity: Entity;
    private oldPosition: THREE.Vector3;
    private newPosition: THREE.Vector3;

    constructor(entity: Entity, oldPosition: THREE.Vector3, newPosition: THREE.Vector3) {
        this.entity = entity;
        this.oldPosition = oldPosition.clone();
        this.newPosition = newPosition.clone();
        this.description = `Move ${entity.name}`;
    }

    execute(): void {
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            transform.position.copy(this.newPosition);
        }
    }

    undo(): void {
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            transform.position.copy(this.oldPosition);
        }
    }
}

export class RotateCommand implements ICommand {
    description: string;
    private entity: Entity;
    private oldRotation: THREE.Euler;
    private newRotation: THREE.Euler;

    constructor(entity: Entity, oldRotation: THREE.Euler, newRotation: THREE.Euler) {
        this.entity = entity;
        this.oldRotation = oldRotation.clone();
        this.newRotation = newRotation.clone();
        this.description = `Rotate ${entity.name}`;
    }

    execute(): void {
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            transform.rotation.copy(this.newRotation);
            transform.quaternion.setFromEuler(transform.rotation);
        }
    }

    undo(): void {
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            transform.rotation.copy(this.oldRotation);
            transform.quaternion.setFromEuler(transform.rotation);
        }
    }
}

export class ScaleCommand implements ICommand {
    description: string;
    private entity: Entity;
    private oldScale: THREE.Vector3;
    private newScale: THREE.Vector3;

    constructor(entity: Entity, oldScale: THREE.Vector3, newScale: THREE.Vector3) {
        this.entity = entity;
        this.oldScale = oldScale.clone();
        this.newScale = newScale.clone();
        this.description = `Scale ${entity.name}`;
    }

    execute(): void {
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            transform.scale.copy(this.newScale);
        }
    }

    undo(): void {
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            transform.scale.copy(this.oldScale);
        }
    }
}
