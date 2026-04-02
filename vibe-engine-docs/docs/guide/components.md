# Components Reference

Components are the data building blocks of VibeEngine. Each component represents a specific set of properties that can be attached to an entity.

## Common Components

### TransformComponent
The most basic component, defining position, rotation, and scale. Every entity that exists in the 3D world must have a Transform.

### RenderComponent
Used to display 3D geometry. It holds references to meshes, materials, and visibility flags.

### CameraComponent
Defines a viewpoint in the scene. Only one camera can be "active" at a time for the main game view.

### ScriptComponent
The bridge between data and logic. It allows you to attach custom behaviors (Scripts) to your entities.

## Advanced Components

### CollisionComponent
Integrates with the physics engine to handle hit detection and triggers.

### AudioComponent
Provides spatialized audio nodes for immersive soundscapes.

### ParticleComponent
Used for visual effects like smoke, fire, and explosions.

---

Next: [VibeEngine Studio](../studio/index.md)
