# Task: AI Co-pilot Phase 1 - Command Infrastructure

- [x] Implement `AICopilot.ts` bridge
    - [x] Define `AICommand` interface and types
    - [x] Create `CommandInterpreter` class
    - [x] Implement core action handlers: `add_entity`, `remove_entity`, `update_transform`
    - [x] Add support for `add_component` and `update_component`
- [x] Integration with `useSceneStore`
    - [x] Ensure commands correctly trigger Zustand actions
    - [x] Handle batch command execution
- [x] Mock AI Test Script
    - [x] Create a utility to simulate AI responses
    - [x] Verify scene generation via console command

- [x] Task: AI Co-pilot Phase 2 - Context Awareness
    - [x] Implement `SceneContext.ts` serializer
    - [x] Create `serializeScene()` to get current hierarchy + state
    - [x] Create `getAssetManifest()` for model/script knowledge
    - [x] Integrate with `AICopilot.ts` to provide context to the AI

- [x] Task: AI Co-pilot Phase 3 - Editor UI Integration
    - [x] Update `editorStore.ts` with `showAICopilot` state
    - [x] Create `AICopilotPanel.tsx` and `AICopilotPanel.css`
    - [x] Integrate panel into `EditorLayout.tsx`
    - [x] Add toggle button to `Toolbar.tsx`
    - [x] Connect UI to `CommandInterpreter` for prototype demo

- [/] Task: AI Co-pilot Phase 4 - Creative Logic & Automation
    - [ ] Create `ScriptRegistry.ts` [/]
    - [ ] Update `SceneContext.ts` with script & prefab knowledge
    - [ ] Update `AICopilot.ts` with `spawn_prefab` and better script handling
    - [ ] Enhance `AICopilotPanel.tsx` with "moveable" and "rotating" behaviors
