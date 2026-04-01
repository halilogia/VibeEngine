# 🏛️ VibeEngine Architecture & Project Tree

VibeEngine uses a **Dual-Architecture** split: One for the **Visual Editor (React/UI)** and one for the **Engine Core (ECS/3D Logic)**. This is why you see "Components" in multiple places—they serve completely different purposes.

---

## 📂 1. `src/presentation/ui/editor` (The Visual Studio)
These are **React Components**. They are the buttons, menus, and windows you see in the editor.
- **MenuBar.tsx**: The unified top bar.
- **ViewportToolbar.tsx**: The overlay inside the 3D view.
- **EditorLayout.tsx**: The master container for all windows.
- **UI Logic**: Purely visual and interactive (HTML/CSS/JS).

## 📂 2. `src/engine/components` (The 3D Engine Core)
These are **ECS (Entity-Component-System) Components**. They are **NOT UI Elements**.
- **TransformComponent.ts**: Holds the 3D position/rotation (X, Y, Z).
- **CameraComponent.ts**: Controls the 3D view (FOV, Zoom).
- **RigidbodyComponent.ts**: Handles physics (gravity, collision).
- **Logic**: These control the 3D objects, not the editor's buttons.

---

## 🗺️ High-Level Project Tree

```bash
VibeEngine Root
├── 🖥️ electron/           # Desktop Bridge (Access to Filesystem)
│   ├── main.cjs           # Starts the OS application
│   └── preload.cjs        # Connects Engine logic to OS
│
├── 🎨 src/
│   ├── 🛠️ engine/         # THE CORE (Three.js + ECS)
│   │   ├── systems/       # Physics, Rendering, Input logic
│   │   └── components/    # 3D Data (Transform, Camera, Light)
│   │
│   ├── 🏛️ presentation/   # THE EDITOR (React)
│   │   ├── ui/            # UI Atoms, Themes, and Layouts
│   │   └── features/      # Large logic modules (Launcher, Inspector)
│   │
│   ├── 📁 domain/         # Business logic (Independent of UI)
│   └── 📁 infrastructure/ # Data storage and Project Discovery
│
└── 🌐 index.html / editor.html # Host pages for the app
```

---

## 🐧 Why Electron on CachyOS? (Or any OS)
Even on a fast Linux like CachyOS, a **Web Browser** is a "Prison" (Sandbox).
- **Problem**: Chrome/Firefox cannot scan your `/home/halile/` folders directly without you manually uploading Her file one by one. They cannot "Save" to your disk automatically.
- **Solution (Electron)**: It gives the engine **"System Privilege"**.
    - It allows **Automatic Scanning** of your projects folder.
    - It allows **One-Click Save** directly to your files.
    - It allows **Physics and Rendering optimization** by communicating directly with the OS bridge.

> [!NOTE]
> If you run in a browser, the Scanner will fail. Use `npm run electron:dev` to unlock the full power of the engine.
