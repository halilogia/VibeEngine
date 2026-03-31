/**
 * EntityBridge - Syncs editor scene data with actual engine entities
 * This is the core integration layer between the editor UI and the game engine.
 */

import * as THREE from 'three';
import { Application, Entity, TransformComponent, RenderComponent, CollisionComponent } from '../../engine';
import { useSceneStore, type EntityData, type ComponentData } from '../stores/sceneStore';

export class EntityBridge {
    /** Engine application reference */
    private app: Application | null = null;

    /** Map of editor entity IDs to engine entities */
    private entityMap: Map<number, Entity> = new Map();

    /** Three.js scene for editor objects */
    private editorScene: THREE.Scene | null = null;

    /** Selection outline objects */
    private selectionOutlines: Map<number, THREE.LineSegments> = new Map();

    /**
     * Initialize bridge with an application
     */
    initialize(app: Application, editorScene: THREE.Scene): void {
        this.app = app;
        this.editorScene = editorScene;
    }

    /**
     * Create an engine entity from editor data
     */
    createEntity(data: EntityData): Entity | null {
        if (!this.app) return null;

        const entity = new Entity(data.name);

        // Add components based on data
        for (const compData of data.components) {
            this.addComponentToEntity(entity, compData);
        }

        // Add to engine scene
        this.app.scene.addEntity(entity);

        // Store mapping
        this.entityMap.set(data.id, entity);

        return entity;
    }

    /**
     * Update an engine entity from editor data
     */
    updateEntity(data: EntityData): void {
        const entity = this.entityMap.get(data.id);
        if (!entity) return;

        // Update name
        entity.name = data.name;

        // Update components
        for (const compData of data.components) {
            this.updateComponentOnEntity(entity, compData);
        }
    }

    /**
     * Remove an engine entity
     */
    removeEntity(id: number): void {
        const entity = this.entityMap.get(id);
        if (entity && this.app) {
            this.app.scene.removeEntity(entity);
            this.entityMap.delete(id);
        }

        // Remove selection outline
        this.clearSelectionOutline(id);
    }

    /**
     * Add component to entity based on type
     */
    private addComponentToEntity(entity: Entity, compData: ComponentData): void {
        switch (compData.type) {
            case 'Transform': {
                const transform = new TransformComponent();
                this.applyTransformData(transform, compData.data);
                entity.addComponent(transform);
                break;
            }
            case 'Render': {
                // Create default cube mesh if no geometry specified
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({
                    color: compData.data.color || 0x6366f1
                });
                const render = new RenderComponent(new THREE.Mesh(geometry, material));
                entity.addComponent(render);
                break;
            }
            case 'Collision': {
                const collision = new CollisionComponent({
                    type: compData.data.type || 'box'
                });
                entity.addComponent(collision);
                break;
            }
        }
    }

    /**
     * Update component on entity
     */
    private updateComponentOnEntity(entity: Entity, compData: ComponentData): void {
        switch (compData.type) {
            case 'Transform': {
                const transform = entity.getComponent(TransformComponent);
                if (transform) {
                    this.applyTransformData(transform, compData.data);
                }
                break;
            }
        }
    }

    /**
     * Apply transform data to TransformComponent
     */
    private applyTransformData(transform: TransformComponent, data: Record<string, any>): void {
        if (data.position) {
            transform.setPosition(data.position[0], data.position[1], data.position[2]);
        }
        if (data.rotation) {
            transform.setRotation(
                THREE.MathUtils.degToRad(data.rotation[0]),
                THREE.MathUtils.degToRad(data.rotation[1]),
                THREE.MathUtils.degToRad(data.rotation[2])
            );
        }
        if (data.scale) {
            transform.setScale(data.scale[0], data.scale[1], data.scale[2]);
        }
    }

    /**
     * Show selection outline for an entity
     */
    showSelectionOutline(id: number): void {
        const entity = this.entityMap.get(id);
        if (!entity || !this.editorScene) return;

        const render = entity.getComponent(RenderComponent);
        if (!render?.object3D) return;

        // Clear previous outline
        this.clearSelectionOutline(id);

        // Create outline
        const mesh = render.object3D as THREE.Mesh;
        if (mesh.geometry) {
            const edges = new THREE.EdgesGeometry(mesh.geometry);
            const line = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 })
            );

            // Copy transform
            line.position.copy(mesh.position);
            line.rotation.copy(mesh.rotation);
            line.scale.copy(mesh.scale);

            this.editorScene.add(line);
            this.selectionOutlines.set(id, line);
        }
    }

    /**
     * Clear selection outline
     */
    clearSelectionOutline(id: number): void {
        const outline = this.selectionOutlines.get(id);
        if (outline && this.editorScene) {
            this.editorScene.remove(outline);
            outline.geometry.dispose();
            this.selectionOutlines.delete(id);
        }
    }

    /**
     * Clear all selection outlines
     */
    clearAllOutlines(): void {
        this.selectionOutlines.forEach((outline, id) => {
            this.clearSelectionOutline(id);
        });
    }

    /**
     * Get engine entity by editor ID
     */
    getEntity(id: number): Entity | undefined {
        return this.entityMap.get(id);
    }

    /**
     * Get Three.js object for an entity
     */
    getObject3D(id: number): THREE.Object3D | null {
        const entity = this.entityMap.get(id);
        if (!entity) return null;

        const render = entity.getComponent(RenderComponent);
        return render?.object3D ?? null;
    }

    /**
     * Sync all entities from store to engine
     */
    syncFromStore(): void {
        const { entities, rootEntityIds } = useSceneStore.getState();

        // Create/update all entities
        rootEntityIds.forEach(id => {
            const data = entities.get(id);
            if (data) {
                if (this.entityMap.has(id)) {
                    this.updateEntity(data);
                } else {
                    this.createEntity(data);
                }
            }
        });
    }

    /**
     * Clear all bridge data
     */
    clear(): void {
        this.entityMap.forEach((entity, id) => {
            this.removeEntity(id);
        });
        this.entityMap.clear();
        this.clearAllOutlines();
    }
}

// Singleton instance
export const entityBridge = new EntityBridge();
