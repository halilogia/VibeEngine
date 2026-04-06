# Project Manager 🏛️🚀

The VibeEngine Project Manager (Launcher) is the central hub for managing your game projects. It provides a "Unity Hub" style experience for project discovery, creation, and isolation.

## Key Features

### 🏛️ Sovereign Architecture
The Project Manager ensures that every project is a completely isolated "isolated island". There is no code or asset cross-contamination between projects, thanks to the **Sovereign Elite Project Isolation** system.

### ⚡ Quick Create
You can now create a new, perfectly structured project with a single click:
1. Open the **Project Manager**.
2. Click **CREATE NEW**.
3. Enter your project name.
4. Click **⚡ QUICK CREATE**.
The engine will automatically initialize the project in the `projects/` directory within the engine's root folder.

### 🎨 Custom Location
If you prefer to store your projects on an external drive or a specific directory:
1. Click **CHOOSE LOCATION & CREATE**.
2. You can then navigate to any folder on your system and initialize the architecture there.

### 🟢 Project Discovery (Auto-Scan)
The Project Manager automatically scans the `projects/` directory on startup to populate your library. You can also manually "Import" any existing project folder.

## Project Structure
When a new project is created, the following "Sovereign Structure" is initialized:

- `project-data.json`: The core manifest of your project.
- `src/domain/`: Place your scripts and logic here.
- `src/levels/`: Stores your scene data (.json).
- `public/assets/models/`: Your 3D models (.glb, .gltf).
- `public/assets/textures/`: Your textures and materials.

## Unity Hub Style Workflow
- To return to the Project Manager from the Editor, use **File -> Manage Projects** or `Ctrl+L`.
- The engine always starts in Launcher mode to allow you to choose your active workspace.
