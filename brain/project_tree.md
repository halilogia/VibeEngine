# 🌳 VibeEngine SRC Layer Map

A deep dive into the source code architecture.

```bash
src/
│   ├── engine/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── AnimationComponent.ts
│   │   │   ├── AudioComponent.ts
│   │   │   ├── CameraComponent.ts
│   │   │   ├── CollisionComponent.ts
│   │   │   ├── ParticleComponent.ts
│   │   │   ├── RenderComponent.ts
│   │   │   ├── RigidbodyComponent.ts
│   │   │   ├── ScriptComponent.ts
│   │   │   ├── TransformComponent.ts
│   │   │   ├── index.ts
│   │   │   ├── __tests__/
│   │   │   │   ├── AnimationComponent.test.ts
│   │   │   │   ├── AudioComponent.test.ts
│   │   │   │   ├── CameraComponent.test.ts
│   │   │   │   ├── CollisionComponent.test.ts
│   │   │   │   ├── ParticleComponent.test.ts
│   │   │   │   ├── RigidbodyComponent.test.ts
│   │   │   │   ├── ScriptComponent.test.ts
│   │   │   │   ├── TransformComponent.test.ts
│   │   ├── core/
│   │   │   ├── AppLoadingBridge.ts
│   │   │   ├── Application.ts
│   │   │   ├── Component.ts
│   │   │   ├── Entity.ts
│   │   │   ├── Physics.ts
│   │   │   ├── Scene.ts
│   │   │   ├── SceneManager.ts
│   │   │   ├── StorageManager.ts
│   │   │   ├── System.ts
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── __tests__/
│   │   │   │   ├── AppLoadingBridge.test.ts
│   │   │   │   ├── Entity.test.ts
│   │   │   │   ├── Scene.test.ts
│   │   ├── demo/
│   │   │   ├── EngineDemo.ts
│   │   ├── systems/
│   │   │   ├── AnimationSystem.ts
│   │   │   ├── AudioSystem.ts
│   │   │   ├── InputSystem.ts
│   │   │   ├── ParticleSystem.ts
│   │   │   ├── PhysicsSystem.ts
│   │   │   ├── RenderSystem.ts
│   │   │   ├── ScriptSystem.ts
│   │   │   ├── index.ts
│   │   │   ├── __tests__/
│   │   │   │   ├── AnimationSystem.test.ts
│   │   │   │   ├── AudioSystem.test.ts
│   │   │   │   ├── InputSystem.test.ts
│   │   │   │   ├── ParticleSystem.test.ts
│   │   │   │   ├── PhysicsSystem.test.ts
│   │   │   │   ├── RenderSystem.test.ts
│   │   │   │   ├── ScriptSystem.test.ts
│   │   ├── ui/
│   │   │   ├── UIManager.ts
│   │   │   ├── index.ts
│   │   ├── utils/
│   │   │   ├── AssetLoader.ts
│   │   │   ├── EntityPool.ts
│   │   │   ├── EventEmitter.ts
│   │   │   ├── ObjectPool.ts
│   │   │   ├── Prefab.ts
│   │   │   ├── Timer.ts
│   │   │   ├── index.ts
│   │   │   ├── __tests__/
│   │   │   │   ├── EventEmitter.test.ts
│   │   │   │   ├── ObjectPool.test.ts
│   ├── presentation/
│   │   ├── ui/
│   │   │   ├── common/
│   │   │   │   ├── VibeErrorBoundary.tsx
│   │   │   │   ├── VibeIcons.tsx
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── VibeIcons.test.tsx
│   │   │   ├── atomic/
│   │   │   │   ├── atoms/
│   │   │   │   │   ├── VibeButton.tsx
│   │   │   │   │   ├── VibeInput.tsx
│   │   │   │   ├── molecules/
│   │   │   │   │   ├── SovereignHeader.tsx
│   │   │   │   ├── organisms/
│   │   │   │   ├── templates/
│   │   │   ├── themes/
│   │   │   │   ├── VibeStyles.ts
│   │   │   ├── editor/
│   │   │   │   ├── AICopilotPanel.styles.ts
│   │   │   │   ├── AICopilotPanel.tsx
│   │   │   │   ├── AssetsPanel.styles.ts
│   │   │   │   ├── AssetsPanel.tsx
│   │   │   │   ├── CommandPalette.tsx
│   │   │   │   ├── ConsolePanel.styles.ts
│   │   │   │   ├── ConsolePanel.tsx
│   │   │   │   ├── ContextMenu.tsx
│   │   │   │   ├── EditorLayout.styles.ts
│   │   │   │   ├── EditorLayout.tsx
│   │   │   │   ├── HierarchyPanel.styles.ts
│   │   │   │   ├── HierarchyPanel.tsx
│   │   │   │   ├── InspectorPanel.styles.ts
│   │   │   │   ├── InspectorPanel.tsx
│   │   │   │   ├── MenuBar.styles.ts
│   │   │   │   ├── MenuBar.tsx
│   │   │   │   ├── ScriptEditorPanel.styles.ts
│   │   │   │   ├── ScriptEditorPanel.tsx
│   │   │   │   ├── SplashScreen.styles.ts
│   │   │   │   ├── SplashScreen.tsx
│   │   │   │   ├── StatusBar.styles.ts
│   │   │   │   ├── StatusBar.tsx
│   │   │   │   ├── ToastContainer.tsx
│   │   │   │   ├── Toolbar.styles.ts
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   ├── ViewportPanel.styles.ts
│   │   │   │   ├── ViewportPanel.tsx
│   │   │   │   ├── ViewportToolbar.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── launcher/
│   │   │   │   │   ├── LauncherViewModel.ts
│   │   │   │   │   ├── ProjectLauncher.tsx
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── ContextMenu.test.tsx
│   │   ├── features/
│   │   │   ├── editor/
│   │   │   │   ├── EditorApp.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── main.tsx
│   │   │   │   ├── assets/
│   │   │   │   │   ├── AssetManager.ts
│   │   │   │   │   ├── AssetUtils.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── AssetUtils.test.ts
│   │   │   │   ├── bridge/
│   │   │   │   │   ├── AICopilot.ts
│   │   │   │   │   ├── ComponentRegistry.ts
│   │   │   │   │   ├── EntityBridge.ts
│   │   │   │   │   ├── OllamaService.ts
│   │   │   │   │   ├── SceneContext.ts
│   │   │   │   │   ├── ScriptRegistry.ts
│   │   │   │   │   ├── global.d.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── AICopilot.test.ts
│   │   │   │   │   │   ├── ComponentRegistry.test.ts
│   │   │   │   │   │   ├── ScriptRegistry.test.ts
│   │   │   │   ├── commands/
│   │   │   │   │   ├── EntityCommands.ts
│   │   │   │   │   ├── HistoryManager.ts
│   │   │   │   │   ├── TransformCommands.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   ├── core/
│   │   │   │   │   ├── PlayModeManager.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── useKeyboardShortcuts.ts
│   │   │   │   ├── serialization/
│   │   │   │   │   ├── GameExporter.ts
│   │   │   │   │   ├── SceneSerializer.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── SceneSerializer.test.ts
│   │   │   │   ├── shortcuts/
│   │   │   │   │   ├── KeyboardShortcuts.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   ├── storage/
│   │   │   │   │   ├── LocalSceneStorage.ts
│   │   │   │   ├── styles/
│   │   │   │   ├── viewport/
│   │   │   │   │   ├── SelectionManager.ts
│   │   │   │   │   ├── index.ts
│   ├── lib/
│   │   ├── vibe-motion/
│   │   │   ├── README.md
│   │   │   ├── VibeMotion.tsx
│   │   │   ├── VibeMotionManager.ts
│   │   │   ├── VibeSpring.ts
│   │   │   ├── useVibeDrag.ts
│   │   ├── vibe-emitter/
│   │   │   ├── VibeEmitter.ts
│   │   ├── vibe-audio/
│   │   │   ├── VibeAudio.ts
│   │   ├── vibe-validator/
│   │   │   ├── VibeValidator.ts
│   ├── domain/
│   │   ├── utils/
│   │   │   ├── id.ts
│   ├── projects/
│   │   ├── external/
│   ├── infrastructure/
│   │   ├── services/
│   │   │   ├── ProjectScanner.ts
│   │   ├── store/
│   │   │   ├── consoleStore.ts
│   │   │   ├── editorStore.ts
│   │   │   ├── index.ts
│   │   │   ├── projectStore.ts
│   │   │   ├── sceneStore.ts
│   │   │   ├── toastStore.ts
│   │   │   ├── undoRedoStore.ts
│   │   │   ├── useProjectStore.ts
```
