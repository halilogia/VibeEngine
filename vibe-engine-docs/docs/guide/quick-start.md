# Quick Start

Get your first VibeEngine scene up and running in minutes.

## Step 1: Initialize Project

```bash
git clone https://github.com/halilogia/VibeEngine.git
cd VibeEngine
npm install
npm run dev
```

## Step 2: The Studio

Open `http://localhost:5173` in your browser. You will see the **VibeEngine Studio**.

## Step 3: Add a Cube

1. In the **Hierarchy Panel** (Left), click the `+` button.
2. Select the new entity and name it "MyCube".
3. In the **Inspector Panel** (Right), click **Add Component**.
4. Choose `RenderComponent` and select a Box mesh.

## Step 4: Add a Script

1. Create a new file in your project: `src/scripts/Rotate.ts`.
2. Add the following code:

```typescript
export class Rotate extends Script {
  update(deltaTime: number) {
    this.entity.getComponent(TransformComponent).rotation.y += deltaTime;
  }
}
```

3. Drag this script onto your "MyCube" entity in the Inspector.

## Step 5: Play!

Press the **Play** button at the top of the editor. Your cube should now be rotating in real-time.

---

Next: [ECS Architecture](./ecs-architecture.md)
