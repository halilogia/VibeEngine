# Utilities & Editor APIs

Common utilities and internal APIs for managing assets and editor state.

## Prefab

Reusable entity templates that can be instantiated into any scene.

```typescript
class Prefab {
  constructor(name: string)
  
  // Methods
  addComponent(factory: () => Component): Prefab
  instantiate(scene: Scene): Entity
}
```

## AssetLoader

Centralized loading for 3D models, textures, and audio.

```typescript
class AssetLoader {
  static loadModel(url: string): Promise<THREE.Group>
  static loadTexture(url: string): Promise<THREE.Texture>
  static loadAudio(url: string, listener: THREE.AudioListener): Promise<THREE.Audio>
}
```

## EventEmitter

Custom event handling for inter-entity communication.

```typescript
class EventEmitter {
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
  once(event: string, callback: Function): void
}
```

## Timer

Time utility for frame counting and deltaTime management.

```typescript
class Timer {
  deltaTime: number      // seconds
  time: number           // current run time
  frameCount: number     // total frames
  
  // Methods
  update(): void
  reset(): void
}
```

## Editor State Hooks

React hooks used within the VibeEngine Studio to manage state.

### useEditorStore

```typescript
const { 
  selectedEntityId,
  editorMode,    // 'translate' | 'rotate' | 'scale'
  isPlaying,
  showGrid,
  
  selectEntity,
  setEditorMode,
  play,
  pause
} = useEditorStore()
```

### useSceneStore

```typescript
const {
  entities,
  rootEntityIds,
  sceneName,
  isDirty,
  
  addEntity,
  removeEntity,
  renameEntity,
  addComponent
} = useSceneStore()
```
