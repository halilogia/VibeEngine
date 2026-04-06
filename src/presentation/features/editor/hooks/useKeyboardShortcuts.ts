import { useEffect } from "react";
import { useEditorStore } from "@infrastructure/store";
import { useUndoRedoStore } from "@infrastructure/store";
import { downloadScene, createDefaultScene } from "@editor/serialization";
import { useSceneStore } from "@infrastructure/store";

export function useKeyboardShortcuts(): void {
  const {
    setEditorMode,
    selectEntity,
    selectedEntityId,
    toggleCommandPalette,
  } = useEditorStore();
  const { removeEntity } = useSceneStore();
  const { undo, redo, canUndo, canRedo, pushState } = useUndoRedoStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      if (!ctrl) {
        switch (e.key.toLowerCase()) {
          case "w":
            setEditorMode("translate");
            e.preventDefault();
            break;
          case "e":
            setEditorMode("rotate");
            e.preventDefault();
            break;
          case "r":
            setEditorMode("scale");
            e.preventDefault();
            break;
        }
      }

      if (ctrl && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          if (canRedo()) redo();
        } else {
          if (canUndo()) undo();
        }
        e.preventDefault();
      }

      if (ctrl && e.key.toLowerCase() === "y") {
        if (canRedo()) redo();
        e.preventDefault();
      }

      if (ctrl && e.key.toLowerCase() === "s") {
        const { sceneName } = useSceneStore.getState();
        downloadScene(`${sceneName.replace(/\s+/g, "_")}.json`);
        e.preventDefault();
      }

      if (ctrl && e.key.toLowerCase() === "n") {
        createDefaultScene();
        e.preventDefault();
      }

      if (e.key === "Delete" && selectedEntityId !== null) {
        pushState();
        removeEntity(selectedEntityId);
        selectEntity(null);
        e.preventDefault();
      }

      if (ctrl && e.key.toLowerCase() === "p") {
        toggleCommandPalette();
        e.preventDefault();
      }

      if (e.key === "Escape") {
        const { showCommandPalette } = useEditorStore.getState();
        if (showCommandPalette) {
          toggleCommandPalette(false);
        } else {
          selectEntity(null);
        }
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedEntityId,
    setEditorMode,
    selectEntity,
    removeEntity,
    undo,
    redo,
    canUndo,
    canRedo,
    pushState,
    toggleCommandPalette,
  ]);
}
