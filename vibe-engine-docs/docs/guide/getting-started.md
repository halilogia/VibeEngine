# Getting Started

Learn how to get up and running with VibeEngine.

## Installation

Getting started with VibeEngine is simple. You can install it using `npm` or by cloning the repository.

### Prerequisites

- **Node.js**: Version 18.0.0 or higher.
- **npm** or **pnpm**: Most current version recommended.

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/halilogia/VibeEngine.git

# Navigate to the project directory
cd VibeEngine

# Install dependencies
npm install

# Start the VibeEngine Studio
npm run dev
```

## Creating Your First Scene

1. **Launch the Studio**: Once you run `npm run dev`, open your browser to `http://localhost:5173`.
2. **Add an Entity**: Click the `+` button in the Hierarchy Panel.
3. **Attach a Component**: Select the new entity and choose "Add Component" in the Inspector.
4. **Enter Play Mode**: Press the `Play` button to start the simulation.

## Project Structure

A typical VibeEngine project looks like this:

- **`src/engine/`**: The core ECS logic and rendering pipeline.
- **`src/domain/`**: Business logic and data models.
- **`src/presentation/`**: UI components and editor features.
- **`assets/`**: Your 3D models, textures, and audio files.

---

Next: [ECS Architecture](./ecs-architecture.md)
