import * as THREE from "three";
import {
  Application,
  Entity,
  TransformComponent,
  RenderComponent,
  CollisionComponent,
} from "@engine";
import {
  useSceneStore,
  type EntityData,
  type ComponentData,
} from "@infrastructure/store";

export class EntityBridge {
  private app: Application | null = null;

  private entityMap: Map<number, Entity> = new Map();

  private editorScene: THREE.Scene | null = null;

  private selectionOutlines: Map<number, THREE.LineSegments> = new Map();

  initialize(app: Application, editorScene: THREE.Scene): void {
    this.app = app;
    this.editorScene = editorScene;
  }

  createEntity(data: EntityData): Entity | null {
    if (!this.app) return null;

    const entity = new Entity(data.name);

    for (const compData of data.components) {
      this.addComponentToEntity(entity, compData);
    }

    this.app.scene.addEntity(entity);

    this.entityMap.set(data.id, entity);

    return entity;
  }

  updateEntity(data: EntityData): void {
    const entity = this.entityMap.get(data.id);
    if (!entity) return;

    entity.name = data.name;

    for (const compData of data.components) {
      this.updateComponentOnEntity(entity, compData);
    }
  }

  removeEntity(id: number): void {
    const entity = this.entityMap.get(id);
    if (entity && this.app) {
      this.app.scene.removeEntity(entity);
      this.entityMap.delete(id);
    }

    this.clearSelectionOutline(id);
  }

  private addComponentToEntity(entity: Entity, compData: ComponentData): void {
    switch (compData.type) {
      case "Transform": {
        const transform = new TransformComponent();
        this.applyTransformData(transform, compData.data);
        entity.addComponent(transform);
        break;
      }
      case "Render": {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
          color: (compData.data.color as THREE.ColorRepresentation) || 0x6366f1,
        });
        const render = new RenderComponent(new THREE.Mesh(geometry, material));
        entity.addComponent(render);
        break;
      }
      case "Collision": {
        const collision = new CollisionComponent({
          type: (compData.data.type as import('@engine').ColliderType) || "box",
        });
        entity.addComponent(collision);
        break;
      }
    }
  }

  private updateComponentOnEntity(
    entity: Entity,
    compData: ComponentData,
  ): void {
    switch (compData.type) {
      case "Transform": {
        const transform = entity.getComponent(TransformComponent);
        if (transform) {
          this.applyTransformData(transform, compData.data);
        }
        break;
      }
    }
  }

  private applyTransformData(
    transform: TransformComponent,
    data: Record<string, unknown>,
  ): void {
    if (data.position) {
      const position = data.position as number[];
      transform.setPosition(position[0], position[1], position[2]);
    }
    if (data.rotation) {
      const rotation = data.rotation as number[];
      transform.setRotation(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2]),
      );
    }
    if (data.scale) {
      const scale = data.scale as number[];
      transform.setScale(scale[0], scale[1], scale[2]);
    }
  }

  showSelectionOutline(id: number): void {
    const entity = this.entityMap.get(id);
    if (!entity || !this.editorScene) return;

    const render = entity.getComponent(RenderComponent);
    if (!render?.object3D) return;

    this.clearSelectionOutline(id);

    const mesh = render.object3D as THREE.Mesh;
    if (mesh.geometry) {
      const edges = new THREE.EdgesGeometry(mesh.geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 }),
      );

      line.position.copy(mesh.position);
      line.rotation.copy(mesh.rotation);
      line.scale.copy(mesh.scale);

      this.editorScene.add(line);
      this.selectionOutlines.set(id, line);
    }
  }

  clearSelectionOutline(id: number): void {
    const outline = this.selectionOutlines.get(id);
    if (outline && this.editorScene) {
      this.editorScene.remove(outline);
      outline.geometry.dispose();
      this.selectionOutlines.delete(id);
    }
  }

  clearAllOutlines(): void {
    this.selectionOutlines.forEach((_outline, id) => {
      this.clearSelectionOutline(id);
    });
  }

  getEntity(id: number): Entity | undefined {
    return this.entityMap.get(id);
  }

  getObject3D(id: number): THREE.Object3D | null {
    const entity = this.entityMap.get(id);
    if (!entity) return null;

    const render = entity.getComponent(RenderComponent);
    return render?.object3D ?? null;
  }

  syncFromStore(): void {
    const { entities, rootEntityIds } = useSceneStore.getState();

    rootEntityIds.forEach((id) => {
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

  clear(): void {
    this.entityMap.forEach((_entity, id) => {
      this.removeEntity(id);
    });
    this.entityMap.clear();
    this.clearAllOutlines();
  }
}

export const entityBridge = new EntityBridge();
