# API Reference

Complete API documentation for the Game Engine.

---

## Table of Contents

1. [Core Classes](#core-classes)
2. [Components](#components)
3. [Systems](#systems)
4. [Utilities](#utilities)
5. [Editor API](#editor-api)

---

## Core Classes

### Application

Main game application controller.

```typescript
class Application {
  constructor(options: ApplicationOptions)
  
  // Properties
  scene: Scene | null        // Current active scene
  renderer: THREE.WebGLRenderer
  isRunning: boolean
  
  // Methods
  loadScene(scene: Scene): void
  start(): void
  stop(): void
  getSystem<T extends System>(type: new(...args: any[]) => T): T | undefined
}

interface ApplicationOptions {
  canvas: HTMLCanvasElement
  width?: number
  height?: number
  antialias?: boolean
}
```

---

### Scene

Container for entities and scene-level operations.

```typescript
class Scene {
  constructor(name?: string)
  
  // Properties
  name: string
  entities: Entity[]
  
  // Methods
  addEntity(entity: Entity): void
  removeEntity(entity: Entity): void
  getEntityByName(name: string): Entity | undefined
  getEntitiesByTag(tag: string): Entity[]
  findEntity(predicate: (e: Entity) => boolean): Entity | undefined
  clear(): void
}
```

---

### Entity

Game object that holds components.

```typescript
class Entity {
  constructor(name?: string)
  
  // Properties
  id: string
  name: string
  enabled: boolean
  parent: Entity | null
  children: Entity[]
  tags: Set<string>
  
  // Component Methods
  addComponent<T extends Component>(component: T): T
  removeComponent<T extends Component>(type: new(...args: any[]) => T): void
  getComponent<T extends Component>(type: new(...args: any[]) => T): T | undefined
  hasComponent<T extends Component>(type: new(...args: any[]) => T): boolean
  
  // Hierarchy Methods
  addChild(child: Entity): void
  removeChild(child: Entity): void
  
  // Tag Methods
  addTag(tag: string): void
  removeTag(tag: string): void
  hasTag(tag: string): boolean
  
  // Events
  emit(event: string, data?: any): void
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
}
```

---

### Component

Base class for all components.

```typescript
abstract class Component {
  // Properties
  entity: Entity | null
  enabled: boolean
  
  // Lifecycle (override in subclass)
  onAttach?(): void
  onDetach?(): void
  onEnable?(): void
  onDisable?(): void
  
  // Utility
  clone(): Component
}
```

---

### System

Base class for all systems.

```typescript
abstract class System {
  // Properties
  priority: number                    // Lower = runs first
  requiredComponents: ComponentType[] // Components entity must have
  
  // Lifecycle
  initialize?(app: Application): void
  update?(entities: Entity[], deltaTime: number): void
  lateUpdate?(entities: Entity[], deltaTime: number): void
  destroy?(): void
}
```

---

### Script

Base class for custom entity behaviors.

```typescript
abstract class Script {
  // Properties
  entity: Entity | null
  
  // Lifecycle (override in subclass)
  initialize?(): void   // Called once when added
  start?(): void        // Called on first update
  update?(deltaTime: number): void
  lateUpdate?(deltaTime: number): void
  onDestroy?(): void
}
```

---

## Components

### TransformComponent

Position, rotation, and scale.

```typescript
class TransformComponent extends Component {
  // Properties
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  
  // Methods
  setPosition(x: number, y: number, z: number): void
  setRotation(x: number, y: number, z: number): void
  setScale(x: number, y: number, z: number): void
  getWorldMatrix(): THREE.Matrix4
  lookAt(target: THREE.Vector3): void
}
```

---

### RenderComponent

3D mesh rendering.

```typescript
class RenderComponent extends Component {
  constructor(object3D: THREE.Object3D)
  
  // Properties
  object3D: THREE.Object3D
  visible: boolean
  castShadow: boolean
  receiveShadow: boolean
}
```

---

### CameraComponent

Game camera.

```typescript
class CameraComponent extends Component {
  constructor(options?: CameraOptions)
  
  // Properties
  camera: THREE.PerspectiveCamera
  isActive: boolean
  
  // Methods
  setFOV(fov: number): void
  setNearFar(near: number, far: number): void
}
```

---

### CollisionComponent

Collision detection.

```typescript
class CollisionComponent extends Component {
  constructor(options: CollisionOptions)
  
  // Properties
  type: 'box' | 'sphere' | 'capsule'
  isTrigger: boolean
  
  // Events (via entity.on())
  // 'collision:enter' - when collision starts
  // 'collision:stay' - while colliding
  // 'collision:exit' - when collision ends
}
```

---

### ScriptComponent

Attach custom scripts.

```typescript
class ScriptComponent extends Component {
  // Methods
  addScript<T extends Script>(script: T): T
  removeScript(script: Script): void
  getScript<T extends Script>(type: new(...args: any[]) => T): T | undefined
}
```

---

### AudioComponent

Sound playback.

```typescript
class AudioComponent extends Component {
  constructor(audio?: THREE.Audio)
  
  // Properties
  volume: number
  loop: boolean
  isPlaying: boolean
  
  // Methods
  play(): void
  pause(): void
  stop(): void
  setBuffer(buffer: AudioBuffer): void
}
```

---

## Utilities

### Prefab

Reusable entity templates.

```typescript
class Prefab {
  constructor(name: string)
  
  // Methods
  addComponent(factory: () => Component): Prefab
  instantiate(scene: Scene): Entity
}
```

---

### AssetLoader

Load 3D assets.

```typescript
class AssetLoader {
  // Static Methods
  static loadModel(url: string): Promise<THREE.Group>
  static loadTexture(url: string): Promise<THREE.Texture>
  static loadAudio(url: string, listener: THREE.AudioListener): Promise<THREE.Audio>
}
```

---

### EventEmitter

Event system.

```typescript
class EventEmitter {
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
  once(event: string, callback: Function): void
}
```

---

### Timer

Time utilities.

```typescript
class Timer {
  // Properties
  deltaTime: number      // Time since last frame (seconds)
  time: number           // Total elapsed time
  frameCount: number     // Total frames
  
  // Methods
  update(): void
  reset(): void
}
```

---

## Editor API

### useEditorStore

Editor state management.

```typescript
const { 
  selectedEntityId,
  editorMode,    // 'translate' | 'rotate' | 'scale'
  isPlaying,
  showGrid,
  showAxes,
  
  selectEntity,
  setEditorMode,
  play,
  pause,
  stop
} = useEditorStore()
```

---

### useSceneStore

Scene data management.

```typescript
const {
  entities,       // Map<number, EntityData>
  rootEntityIds,
  sceneName,
  isDirty,
  
  addEntity,
  removeEntity,
  renameEntity,
  addComponent,
  updateComponent,
  removeComponent
} = useSceneStore()
```

---

### useAssetManager

Asset import/management.

```typescript
const {
  assets,
  loading,
  
  importModel,
  importTexture,
  getAsset,
  removeAsset
} = useAssetManager()
```

---

### Serialization

```typescript
import { 
  serializeScene, 
  deserializeScene, 
  downloadScene,
  loadSceneFromFile,
  createDefaultScene 
} from './editor/serialization'

// Save scene to JSON string
const json = serializeScene()

// Load scene from JSON
deserializeScene(json)

// Download as file
downloadScene('my-scene.json')
```
