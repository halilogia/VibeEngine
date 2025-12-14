# Getting Started

A step-by-step guide to creating your first game with the engine.

---

## Step 1: Setup Project

Create a new HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First Game</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="game-canvas"></canvas>
  <script type="module" src="./game.ts"></script>
</body>
</html>
```

---

## Step 2: Create Game Entry Point

Create `game.ts`:

```typescript
import { 
  Application, 
  Scene, 
  Entity, 
  TransformComponent, 
  RenderComponent,
  CameraComponent,
  ScriptComponent
} from './src/engine';
import * as THREE from 'three';

// Create application
const app = new Application({
  canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
  width: window.innerWidth,
  height: window.innerHeight
});

// Create scene
const scene = new Scene('Game Scene');
app.loadScene(scene);

// Create camera
const camera = new Entity('Camera');
camera.addComponent(new TransformComponent());
camera.addComponent(new CameraComponent({ isActive: true }));
camera.getComponent(TransformComponent)?.setPosition(0, 5, 10);
scene.addEntity(camera);

// Create player cube
const player = new Entity('Player');
player.addComponent(new TransformComponent());
player.addComponent(new RenderComponent(
  new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x6366f1 })
  )
));
scene.addEntity(player);

// Create ground
const ground = new Entity('Ground');
ground.addComponent(new TransformComponent());
ground.addComponent(new RenderComponent(
  new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  )
));
ground.getComponent(TransformComponent)?.setRotation(-Math.PI / 2, 0, 0);
scene.addEntity(ground);

// Add lighting
const light = new Entity('Light');
light.addComponent(new TransformComponent());
light.getComponent(TransformComponent)?.setPosition(5, 10, 5);
// Note: Add light component here
scene.addEntity(light);

// Start
app.start();

// Handle resize
window.addEventListener('resize', () => {
  app.renderer.setSize(window.innerWidth, window.innerHeight);
});
```

---

## Step 3: Add Player Movement

Create a custom movement script:

```typescript
// PlayerMovement.ts
import { Script, TransformComponent } from './src/engine';

export class PlayerMovement extends Script {
  speed = 5;
  
  private keys = {
    w: false,
    a: false,
    s: false,
    d: false
  };
  
  initialize(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key in this.keys) this.keys[e.key as keyof typeof this.keys] = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key in this.keys) this.keys[e.key as keyof typeof this.keys] = false;
    });
  }
  
  update(deltaTime: number): void {
    const transform = this.entity?.getComponent(TransformComponent);
    if (!transform) return;
    
    const velocity = { x: 0, z: 0 };
    
    if (this.keys.w) velocity.z -= 1;
    if (this.keys.s) velocity.z += 1;
    if (this.keys.a) velocity.x -= 1;
    if (this.keys.d) velocity.x += 1;
    
    // Normalize
    const length = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    if (length > 0) {
      velocity.x /= length;
      velocity.z /= length;
    }
    
    // Apply movement
    transform.position.x += velocity.x * this.speed * deltaTime;
    transform.position.z += velocity.z * this.speed * deltaTime;
  }
}
```

Then attach it to your player:

```typescript
import { PlayerMovement } from './PlayerMovement';

const scriptComp = player.addComponent(new ScriptComponent());
scriptComp.addScript(new PlayerMovement());
```

---

## Step 4: Add Collision Detection

```typescript
import { CollisionComponent } from './src/engine';

// Add collision to player
player.addComponent(new CollisionComponent({
  type: 'box',
  isTrigger: false
}));

// Listen for collisions
player.on('collision:enter', (other: Entity) => {
  console.log('Collided with:', other.name);
});
```

---

## Step 5: Use the Visual Editor

Instead of coding everything manually, use the visual editor:

1. Run `npm run dev`
2. Open `http://localhost:5173/editor.html`
3. Create entities visually
4. Add components via Inspector
5. Save your scene (Ctrl+S)
6. Load the saved JSON in your game

```typescript
import { deserializeScene } from './src/editor/serialization';

// Load scene from JSON
const sceneJson = await fetch('./my-scene.json').then(r => r.text());
deserializeScene(sceneJson);
```

---

## Next Steps

- Read the [API Reference](./API.md) for all available classes
- Check out the [Examples](../examples/) folder
- Explore the [Editor Documentation](./Editor.md)
