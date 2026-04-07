import { useEditorStore } from "@infrastructure/store";
import { useUndoRedoStore } from "@infrastructure/store";
import { useSceneStore } from "@infrastructure/store";
import { downloadScene, createDefaultScene } from "@editor/serialization";

export function initKeyboardShortcuts(): void {
  document.addEventListener("keydown", handleKeyDown);
  console.log("✅ Keyboard shortcuts initialized");
}

export function cleanupKeyboardShortcuts(): void {
  document.removeEventListener("keydown", handleKeyDown);
}

function matchesShortcut(
  event: KeyboardEvent,
  shortcut: { key: string; ctrl: boolean; shift: boolean; alt: boolean },
): boolean {
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();

  // Check key match (handle special keys)
  const keyMatch =
    eventKey === shortcutKey ||
    (shortcutKey === "delete" && eventKey === "delete") ||
    (shortcutKey === "escape" && eventKey === "escape");

  if (!keyMatch) return false;

  // Check modifiers
  const ctrlMatch = shortcut.ctrl === (event.ctrlKey || event.metaKey);
  const shiftMatch = shortcut.shift === event.shiftKey;
  const altMatch = shortcut.alt === event.altKey;

  return ctrlMatch && shiftMatch && altMatch;
}

function handleKeyDown(e: KeyboardEvent): void {
  // Ignore input fields
  const target = e.target as HTMLElement;
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    return;
  }

  const { shortcuts, setEditorMode, selectEntity, toggleCommandPalette } =
    useEditorStore.getState();
  const { undo, redo, canUndo, canRedo, pushState } =
    useUndoRedoStore.getState();
  const { removeEntity } = useSceneStore.getState();

  // Check each shortcut
  for (const [id, binding] of Object.entries(shortcuts)) {
    if (matchesShortcut(e, binding)) {
      e.preventDefault();

      switch (id) {
        case "translate":
          setEditorMode("translate");
          break;
        case "rotate":
          setEditorMode("rotate");
          break;
        case "scale":
          setEditorMode("scale");
          break;
        case "undo":
          if (canUndo()) undo();
          break;
        case "redo":
        case "redoAlt":
          if (canRedo()) redo();
          break;
        case "save": {
          const { sceneName } = useSceneStore.getState();
          downloadScene(`${sceneName.replace(/\s+/g, "_")}.json`);
          break;
        }
        case "newScene":
          createDefaultScene();
          break;
        case "delete": {
          const { selectedEntityId } = useEditorStore.getState();
          if (selectedEntityId !== null) {
            pushState();
            removeEntity(selectedEntityId);
            selectEntity(null);
          }
          break;
        }
        case "commandPalette":
          toggleCommandPalette();
          break;
        case "escape":
          {
            const { showCommandPalette } = useEditorStore.getState();
            if (showCommandPalette) {
              toggleCommandPalette(false);
            } else {
              selectEntity(null);
            }
          }

          break;
      }
      return;
    }
  }
}
