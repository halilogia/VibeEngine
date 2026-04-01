/**
 * RenderComponent - 3D mesh/model rendering
 * Connects an entity to a Three.js Object3D for rendering.
 */

import * as THREE from 'three';
import { Component } from '@engine';
import { TransformComponent } from './TransformComponent';

export class RenderComponent extends Component {
    static readonly TYPE = 'Render';

    /** Three.js object to render (Mesh, Group, SkinnedMesh, etc.) */
    object3D: THREE.Object3D | null = null;

    /** Whether to cast shadows */
    castShadow: boolean = true;

    /** Whether to receive shadows */
    receiveShadow: boolean = true;

    /** Render layer (for selective rendering) */
    layer: number = 0;

    /** Has been added to Three.js scene */
    private addedToScene: boolean = false;

    constructor(object3D?: THREE.Object3D) {
        super();
        if (object3D) {
            this.setObject3D(object3D);
        }
    }

    /**
     * Set the 3D object to render
     */
    setObject3D(object3D: THREE.Object3D): this {
        // Remove old object if exists
        if (this.object3D && this.addedToScene) {
            this.object3D.parent?.remove(this.object3D);
            this.addedToScene = false;
        }

        this.object3D = object3D;
        this.applyShadowSettings();
        return this;
    }

    /**
     * Set a mesh with geometry and material
     */
    setMesh(geometry: THREE.BufferGeometry, material: THREE.Material): this {
        const mesh = new THREE.Mesh(geometry, material);
        return this.setObject3D(mesh);
    }

    /**
     * Apply shadow settings to object and children
     */
    applyShadowSettings(): void {
        if (!this.object3D) return;

        this.object3D.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = this.castShadow;
                child.receiveShadow = this.receiveShadow;
            }
        });
    }

    /**
     * Sync transform from TransformComponent to Object3D
     */
    syncTransform(): void {
        if (!this.object3D || !this.entity) return;

        const transform = this.entity.getComponent(TransformComponent);
        if (!transform) return;

        this.object3D.position.copy(transform.position);
        this.object3D.quaternion.copy(transform.quaternion);
        this.object3D.scale.copy(transform.scale);
    }

    /**
     * Add to Three.js scene
     */
    addToScene(scene: THREE.Scene): void {
        if (this.object3D && !this.addedToScene) {
            scene.add(this.object3D);
            this.addedToScene = true;
        }
    }

    /**
     * Remove from Three.js scene
     */
    removeFromScene(): void {
        if (this.object3D && this.addedToScene) {
            this.object3D.parent?.remove(this.object3D);
            this.addedToScene = false;
        }
    }

    /**
     * Set visibility
     */
    setVisible(visible: boolean): this {
        if (this.object3D) {
            this.object3D.visible = visible;
        }
        return this;
    }

    /**
     * Get visibility
     */
    get visible(): boolean {
        return this.object3D?.visible ?? false;
    }

    /**
     * Dispose of geometry and materials
     */
    dispose(): void {
        if (!this.object3D) return;

        this.object3D.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry?.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material?.dispose();
                }
            }
        });
    }

    override onDestroy(): void {
        this.removeFromScene();
        this.dispose();
    }

    override clone(): RenderComponent {
        const cloned = new RenderComponent();
        if (this.object3D) {
            cloned.object3D = this.object3D.clone();
        }
        cloned.castShadow = this.castShadow;
        cloned.receiveShadow = this.receiveShadow;
        cloned.layer = this.layer;
        return cloned;
    }
}
