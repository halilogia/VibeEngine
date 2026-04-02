# Components

Components are data containers that describe the properties and behaviors of an entity.

## TransformComponent

Position, rotation, and scale of an entity in 3D space.

```typescript
class TransformComponent extends Component {
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

## RenderComponent

3D mesh rendering properties.

```typescript
class RenderComponent extends Component {
  constructor(object3D: THREE.Object3D)
  
  object3D: THREE.Object3D
  visible: boolean
  castShadow: boolean
  receiveShadow: boolean
}
```

## CameraComponent

Configuration for a game camera.

```typescript
class CameraComponent extends Component {
  constructor(options?: CameraOptions)
  
  camera: THREE.PerspectiveCamera
  isActive: boolean
  
  // Methods
  setFOV(fov: number): void
  setNearFar(near: number, far: number): void
}
```

## CollisionComponent

Physical properties and collision callback hooks.

```typescript
class CollisionComponent extends Component {
  constructor(options: CollisionOptions)
  
  type: 'box' | 'sphere' | 'capsule'
  isTrigger: boolean
  
  // Events
  // 'collision:enter'
  // 'collision:stay'
  // 'collision:exit'
}
```

## ScriptComponent

Attach and manage custom entity scripts.

```typescript
class ScriptComponent extends Component {
  addScript<T extends Script>(script: T): T
  removeScript(script: Script): void
  getScript<T extends Script>(type: new(...args: any[]) => T): T | undefined
}
```

## AudioComponent

Sound playback and 3D spatialized audio.

```typescript
class AudioComponent extends Component {
  constructor(audio?: THREE.Audio)
  
  volume: number
  loop: boolean
  isPlaying: boolean
  
  // Methods
  play(): void
  pause(): void
  stop(): void
}
```
