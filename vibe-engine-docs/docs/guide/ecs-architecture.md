# ECS Architecture

The Entity-Component-System (ECS) is the heart of **VibeEngine**. It ensures that logic is decoupled from data, making the engine blazing fast and easy to maintain.

## What is ECS?

Instead of complex class hierarchies, ECS breaks down objects into three distinct roles:

- **Entity**: A unique ID that represents an object (e.g., Player, Camera, PointLight).
- **Component**: Pure data containers that are attached to entities (e.g., `TransformComponent`, `RenderComponent`).
- **System**: Logic that operates on all entities sharing a common set of components.

## Entity

An entity is nothing more than a container for components. It doesn't have any logic of its own.

```typescript
const player = new Entity('Player');
player.addComponent(new TransformComponent());
player.addComponent(new RenderComponent(mesh));
```

## Component

Components store data. They are lightweight and should not contain complex logic.

```typescript
class HealthComponent extends Component {
  value: number = 100;
  isDead: boolean = false;
}
```

## System

Systems are where the magic happens. They filter entities by their components and update them every frame.

```typescript
class MovementSystem extends System {
  update(entities: Entity[], deltaTime: number) {
    for (const entity of entities) {
      if (entity.hasComponent(TransformComponent) && entity.hasComponent(VelocityComponent)) {
        // Apply movement logic here
      }
    }
  }
}
```

## VibeEngine Implementation

VibeEngine uses a high-performance registry to manage entities and components. This registry optimizes memory layout for cache locality, ensuring that your game remains fast even with thousands of active entities.

---

Next: [Scene Management](./scene-management.md)
