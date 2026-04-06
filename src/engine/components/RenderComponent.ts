

import * as THREE from 'three';
import { Component } from '@engine';
import { TransformComponent } from './TransformComponent';

export class RenderComponent extends Component {
    static readonly TYPE = 'Render';

    object3D: THREE.Object3D | null = null;

    castShadow: boolean = true;

    receiveShadow: boolean = true;

    layer: number = 0;

    private addedToScene: boolean = false;

    constructor(object3D?: THREE.Object3D) {
        super();
        if (object3D) {
            this.setObject3D(object3D);
        }
    }

    setObject3D(object3D: THREE.Object3D): this {
        
        if (this.object3D && this.addedToScene) {
            this.object3D.parent?.remove(this.object3D);
            this.addedToScene = false;
        }

        this.object3D = object3D;
        this.applyShadowSettings();
        return this;
    }

    setMesh(geometry: THREE.BufferGeometry, material: THREE.Material): this {
        const mesh = new THREE.Mesh(geometry, material);
        return this.setObject3D(mesh);
    }

    applyShadowSettings(): void {
        if (!this.object3D) return;

        this.object3D.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = this.castShadow;
                child.receiveShadow = this.receiveShadow;
            }
        });
    }

    syncTransform(): void {
        if (!this.object3D || !this.entity) return;

        const transform = this.entity.getComponent(TransformComponent);
        if (!transform) return;

        this.object3D.position.copy(transform.position);
        this.object3D.quaternion.copy(transform.quaternion);
        this.object3D.scale.copy(transform.scale);
    }

    addToScene(scene: THREE.Scene): void {
        if (this.object3D && !this.addedToScene) {
            scene.add(this.object3D);
            this.addedToScene = true;
        }
    }

    removeFromScene(): void {
        if (this.object3D && this.addedToScene) {
            this.object3D.parent?.remove(this.object3D);
            this.addedToScene = false;
        }
    }

    setVisible(visible: boolean): this {
        if (this.object3D) {
            this.object3D.visible = visible;
        }
        return this;
    }

    get visible(): boolean {
        return this.object3D?.visible ?? false;
    }

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
