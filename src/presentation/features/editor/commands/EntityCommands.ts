

import { Entity } from '@engine';
import { Scene } from '@engine';
import type { ICommand } from './HistoryManager';

export class AddEntityCommand implements ICommand {
    description: string;
    private scene: Scene;
    private entity: Entity;

    constructor(scene: Scene, entity: Entity) {
        this.scene = scene;
        this.entity = entity;
        this.description = `Add ${entity.name}`;
    }

    execute(): void {
        this.scene.addEntity(this.entity);
    }

    undo(): void {
        this.scene.removeEntity(this.entity);
    }
}

export class RemoveEntityCommand implements ICommand {
    description: string;
    private scene: Scene;
    private entity: Entity;

    constructor(scene: Scene, entity: Entity) {
        this.scene = scene;
        this.entity = entity;
        this.description = `Remove ${entity.name}`;
    }

    execute(): void {
        this.scene.removeEntity(this.entity);
    }

    undo(): void {
        this.scene.addEntity(this.entity);
    }
}

export class RenameEntityCommand implements ICommand {
    description: string;
    private entity: Entity;
    private oldName: string;
    private newName: string;

    constructor(entity: Entity, newName: string) {
        this.entity = entity;
        this.oldName = entity.name;
        this.newName = newName;
        this.description = `Rename to ${newName}`;
    }

    execute(): void {
        this.entity.name = this.newName;
    }

    undo(): void {
        this.entity.name = this.oldName;
    }
}
