# 🏛️ VibeEngine: Sovereign Elite Edition
> **A High-Performance, AI-Native TypeScript ECS Game Engine.**

VibeEngine is a next-generation 3D game engine and visual editor built on **Three.js**, designed specifically for an AI-first development workflow. It combines the rigorous structure of an **Entity-Component-System (ECS)** architecture with a deep **Neural Link** via Ollama, creating the first truly "Sovereign" game development environment.

---

## 🧠 Neural Link (The AI-Native Edge)
Unlike traditional editors, VibeEngine features a built-in **Neural Copilot** that lives inside the engine core.
*   **Persistent Memory:** The AI remembers your preferences and selected models (Llama, Qwen, etc.) via LocalStorage.
*   **Direct Scene Manipulation:** Ask the AI to /create, /modify, or /animate objects in real-time.
*   **Neural Interrupt:** Integrated "Stop Generation" capability for full developer control.
*   **Script Generator:** Automatically generate TypeScript components based on your descriptions.

---

## 💎 Engine Architecture (Technical Deep-Dive)

### ⚛️ Entity-Component-System (ECS)
VibeEngine's heart is a high-performance ECS that ensures a clear separation between data and logic.

*   **8 Specialized Components:**
    - `Transform`: Accurate 3D positioning, rotation, and scaling.
    - `Render`: High-fidelity mesh rendering (Cube, Sphere, GLB/GLTF).
    - `Camera`: Field of view and projection controls.
    - `Collision`: Tight bounding-box and complex mesh hitboxes.
    - `Script`: Custom logic hooks for entities.
    - `Audio`: 3D spatial sound and background ambiance.
    - `Animation`: Keyframe and skeletal support.
    - `Rigidbody`: Physical properties (Mass, Friction, Restitution).

*   **6 Core Systems:** 
    - `Input`: Global event mapping.
    - `Script System`: Runs every frame for custom logic.
    - `Physics System`: Powered by **Rapier (WASM)**.
    - `Animation System`: Handles tweening and state transitions.
    - `Audio System`: Manages listeners and spatial emitters.
    - `Render System`: Three.js-based WebGL/WebGPU pipeline.

---

## 🎨 Visual Studio (Sovereign UI)
A minimalist, frameless professional environment designed for maximum focus.

-   **Hierarchy Tray:** Real-time entity tree management.
-   **Inspector Panel:** Deep property editing for all components.
-   **Viewport (Elite View):** 3D scene view with OrbitControls and persistent **Sovereign Gizmos** (Move/Rotate/Scale).
-   **Assets Browser:** Universal drag-and-drop support for GLB/GLTF, textures, and scripts.
-   **Console Output:** Real-time debugging and command feedback.
-   **Layout Mastery:** Resizable panels that remember their size and position.

---

## 🚀 Quick Start (Development)

### 1. Environment Setup
Make sure you have [Node.js](https://nodejs.org/) installed.
```bash
git clone https://github.com/halilogia/VibeEngine.git
cd VibeEngine
npm install
```

### 2. Neural Link Activation (Ollama)
Install [Ollama](https://ollama.ai/) and pull a model:
```bash
ollama run qwen2.5:3b
```

### 3. Launching
```bash
# Run the Desktop Electron App (Recommended)
npm run electron:dev

# Run Web-based Editor
npm run dev
```

---

## ⚙️ Development & Build
| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production bundle |
| `npm run package:win` | Create Windows installer (.exe) |
| `npm run knip` | Analyze for unused files/dependencies |

---

## ⌨️ Studio Shortcuts
- **W / E / R:** Switch between Translate, Rotate, and Scale modes.
- **Ctrl+S:** Instant scene serialization to JSON.
- **Ctrl+Z / Ctrl+Y:** Advanced Undo/Redo stack.
- **Delete:** Remove selected entity from the Sovereign universe.

---

## ⚖️ License & Patents
This project is licensed under the **GNU General Public License v3 (GPL-3.0)**. 
- **Patent Protection:** Users are granted patent rights by the contributors.
- **Copyleft (Mandatory Open Source):** Any modifications or derivative works distributed must also be licensed under the GPL-3.0 and made publicly available.

---
**Architected with 🏛️ by HEK Interactive (Halil Emre)**
**Accelerated by 🦾 VibeEngine AI**
