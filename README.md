# � VibeEngine

A modern **TypeScript ECS Game Engine** with a **Visual Editor**, built on Three.js.

---

## ✨ Features

### Engine Core
- **Entity-Component-System (ECS)** architecture
- **8 Built-in Components**: Transform, Render, Camera, Collision, Script, Audio, Animation, Rigidbody
- **6 Systems**: Input, Script, Physics, Animation, Audio, Render
- **Prefab System** for reusable entity templates
- **Asset Loader** for models, textures, and audio

### Visual Editor
- **Dark theme** professional UI
- **Resizable panels**: Hierarchy, Inspector, Viewport, Assets, Console
- **3D Viewport** with OrbitControls and TransformControls
- **Entity picking** - click to select in 3D
- **Play/Stop** with state restore
- **Drag-drop asset import** (GLB/GLTF)
- **Scene save/load** to JSON
- **Undo/Redo** + Keyboard shortcuts

---

## 🚀 Quick Start

### Install Dependencies

```bash
cd engine-standalone
npm install
```

### Development Mode

```bash
npm run dev
```

- **Editor**: http://localhost:5173/editor.html
- **Demo**: http://localhost:5173/

### Run as Desktop App (Electron)

```bash
npm run electron:dev
```

### Build Windows Executable

```bash
npm run package:win
```

This creates `release/VibeEngine Setup.exe`

---

## 📖 Usage Example

```typescript
import { Application, Scene, Entity, TransformComponent, RenderComponent } from './engine';
import * as THREE from 'three';

const app = new Application({ canvas: document.getElementById('canvas') });
const scene = new Scene('My Game');
app.loadScene(scene);

const cube = new Entity('Cube');
cube.addComponent(new TransformComponent());
cube.addComponent(new RenderComponent(
  new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x6366f1 })
  )
));
scene.addEntity(cube);

app.start();
```

---

## ⌨️ Editor Shortcuts

| Key | Action |
|-----|--------|
| W | Move mode |
| E | Rotate mode |
| R | Scale mode |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+S | Save scene |
| Delete | Delete entity |

---

## � Documentation

- [Getting Started](./docs/GETTING_STARTED.md)
- [API Reference](./docs/API.md)

---

## �️ Tech Stack

- [Three.js](https://threejs.org/) - 3D rendering
- [React](https://reactjs.org/) - Editor UI
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Electron](https://www.electronjs.org/) - Desktop app

---

## 📄 License

Proprietary - All Rights Reserved.
For licensing inquiries, contact the author.
