# Scene Management

In VibeEngine, a **Scene** is a collection of entities that define a game world. It includes everything from the 3D geometry and lights to the background environment and cameras.

## What is a Scene?

A scene is a root container for all entity hierarchies. It manages the lifecycle of entities, handles additions/removals, and coordinates scene-wide operations.

### Key Operations

```typescript
const scene = new Scene('MyAwesomeScene');

// Add entity
scene.addEntity(player);

// Find entity
const camera = scene.getEntityByName('MainCamera');

// Search for entities by tag
const enemies = scene.getEntitiesByTag('enemy');
```

## Serialization

One of the core features of VibeEngine is its **AI-Native Serialization**. We use a human-readable JSON format that the integrated AI can understand and manipulate.

### JSON Representation

```json
{
  "name": "MyAwesomeScene",
  "entities": [
    {
      "id": 1,
      "name": "Player",
      "components": [
        {
          "type": "TransformComponent",
          "data": { "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] }
        }
      ]
    }
  ]
}
```

### Loading and Saving

```typescript
import { serializeScene, deserializeScene } from './editor/serialization';

// Save scene to JSON
const sceneJson = serializeScene();

// Load scene from JSON
deserializeScene(sceneJson);
```

## Scene Lifecycle

A scene goes through several phases:

1. **Initialization**: Loading assets and setting up the engine.
2. **Update**: Logic systems updating entity data.
3. **LateUpdate**: Last-minute calculations (e.g., camera smoothing).
4. **Rendering**: The GPU drawing the scene to the screen.

---

Next: [Components Documentation](./components.md)
