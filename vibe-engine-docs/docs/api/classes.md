# Core Classes

These are the fundamental building blocks of the VibeEngine ECS architecture.

## Application

Main game application controller. It manages the renderer, current scene, and system updates.

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
```

## Scene

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

## Entity

A game object that holds components. Entities are the primary units in the ECS.

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
}
```

## Component

Base class for all components. Components store data and are attached to entities.

```typescript
abstract class Component {
  entity: Entity | null
  enabled: boolean
  
  // Lifecycle
  onAttach?(): void
  onDetach?(): void
  onEnable?(): void
  onDisable?(): void
}
```

## System

Base class for all systems. Systems contain the logic that operates on entities.

```typescript
abstract class System {
  priority: number
  requiredComponents: ComponentType[]
  
  // Lifecycle
  initialize?(app: Application): void
  update?(entities: Entity[], deltaTime: number): void
  lateUpdate?(entities: Entity[], deltaTime: number): void
}
```
