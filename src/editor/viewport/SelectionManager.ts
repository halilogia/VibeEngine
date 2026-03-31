/**
 * SelectionManager - Handles entity picking via raycasting
 */

import * as THREE from 'three';

export class SelectionManager {
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private camera: THREE.Camera | null = null;
    private scene: THREE.Scene | null = null;

    /** Map of Three.js object UUIDs to editor entity IDs */
    private objectToEntityMap: Map<string, number> = new Map();

    /** Outline effect objects */
    private outlineMeshes: Map<number, THREE.LineSegments> = new Map();

    /** Outline material */
    private outlineMaterial: THREE.LineBasicMaterial;

    constructor() {
        this.outlineMaterial = new THREE.LineBasicMaterial({
            color: 0xf59e0b,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });
    }

    /**
     * Initialize with camera and scene
     */
    initialize(camera: THREE.Camera, scene: THREE.Scene): void {
        this.camera = camera;
        this.scene = scene;
    }

    /**
     * Register an object for picking
     */
    registerObject(object3D: THREE.Object3D, entityId: number): void {
        this.objectToEntityMap.set(object3D.uuid, entityId);

        // Also register children
        object3D.traverse((child) => {
            if (child !== object3D) {
                this.objectToEntityMap.set(child.uuid, entityId);
            }
        });
    }

    /**
     * Unregister an object
     */
    unregisterObject(object3D: THREE.Object3D): void {
        this.objectToEntityMap.delete(object3D.uuid);
        object3D.traverse((child) => {
            this.objectToEntityMap.delete(child.uuid);
        });
    }

    /**
     * Pick entity at screen coordinates
     */
    pick(x: number, y: number, containerWidth: number, containerHeight: number): number | null {
        if (!this.camera || !this.scene) return null;

        // Convert to normalized device coordinates
        this.mouse.x = (x / containerWidth) * 2 - 1;
        this.mouse.y = -(y / containerHeight) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Get all pickable objects
        const pickableObjects: THREE.Object3D[] = [];
        this.scene.traverse((obj) => {
            if (this.objectToEntityMap.has(obj.uuid)) {
                pickableObjects.push(obj);
            }
        });

        // Cast ray
        const intersects = this.raycaster.intersectObjects(pickableObjects, true);

        if (intersects.length > 0) {
            // Find the entity ID for the hit object
            let obj: THREE.Object3D | null = intersects[0].object;
            while (obj) {
                const entityId = this.objectToEntityMap.get(obj.uuid);
                if (entityId !== undefined) {
                    return entityId;
                }
                obj = obj.parent;
            }
        }

        return null;
    }

    /**
     * Show selection outline for an entity
     */
    showOutline(entityId: number, mesh: THREE.Mesh): void {
        this.clearOutline(entityId);

        if (!this.scene || !mesh.geometry) return;

        const edges = new THREE.EdgesGeometry(mesh.geometry);
        const outline = new THREE.LineSegments(edges, this.outlineMaterial);

        // Match transform
        outline.position.copy(mesh.position);
        outline.rotation.copy(mesh.rotation);
        outline.scale.copy(mesh.scale);

        // Add slightly scaled up
        outline.scale.multiplyScalar(1.01);

        this.scene.add(outline);
        this.outlineMeshes.set(entityId, outline);
    }

    /**
     * Clear outline for an entity
     */
    clearOutline(entityId: number): void {
        const outline = this.outlineMeshes.get(entityId);
        if (outline && this.scene) {
            this.scene.remove(outline);
            outline.geometry.dispose();
            this.outlineMeshes.delete(entityId);
        }
    }

    /**
     * Clear all outlines
     */
    clearAllOutlines(): void {
        this.outlineMeshes.forEach((_, entityId) => {
            this.clearOutline(entityId);
        });
    }

    /**
     * Update outline position to match object
     */
    updateOutline(entityId: number, mesh: THREE.Mesh): void {
        const outline = this.outlineMeshes.get(entityId);
        if (outline) {
            outline.position.copy(mesh.position);
            outline.rotation.copy(mesh.rotation);
            outline.scale.copy(mesh.scale).multiplyScalar(1.01);
        }
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        this.clearAllOutlines();
        this.outlineMaterial.dispose();
        this.objectToEntityMap.clear();
    }
}

// Singleton
export const selectionManager = new SelectionManager();
