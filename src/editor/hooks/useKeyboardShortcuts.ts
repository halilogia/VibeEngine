/**
 * KeyboardShortcuts - Global keyboard shortcuts for the editor
 */

import { useEffect } from 'react';
import { useEditorStore } from '../stores';
import { useUndoRedoStore } from '../stores/undoRedoStore';
import { downloadScene, createDefaultScene } from '../serialization';
import { useSceneStore } from '../stores/sceneStore';

export function useKeyboardShortcuts(): void {
    const { setEditorMode, selectEntity, selectedEntityId } = useEditorStore();
    const { removeEntity } = useSceneStore();
    const { undo, redo, canUndo, canRedo, pushState } = useUndoRedoStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const ctrl = e.ctrlKey || e.metaKey;

            // Transform modes
            if (!ctrl) {
                switch (e.key.toLowerCase()) {
                    case 'w':
                        setEditorMode('translate');
                        e.preventDefault();
                        break;
                    case 'e':
                        setEditorMode('rotate');
                        e.preventDefault();
                        break;
                    case 'r':
                        setEditorMode('scale');
                        e.preventDefault();
                        break;
                }
            }

            // Undo/Redo
            if (ctrl && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) {
                    if (canRedo()) redo();
                } else {
                    if (canUndo()) undo();
                }
                e.preventDefault();
            }

            if (ctrl && e.key.toLowerCase() === 'y') {
                if (canRedo()) redo();
                e.preventDefault();
            }

            // Save
            if (ctrl && e.key.toLowerCase() === 's') {
                const { sceneName } = useSceneStore.getState();
                downloadScene(`${sceneName.replace(/\s+/g, '_')}.json`);
                e.preventDefault();
            }

            // New scene
            if (ctrl && e.key.toLowerCase() === 'n') {
                createDefaultScene();
                e.preventDefault();
            }

            // Delete
            if (e.key === 'Delete' && selectedEntityId !== null) {
                pushState(); // Save for undo
                removeEntity(selectedEntityId);
                selectEntity(null);
                e.preventDefault();
            }

            // Escape - deselect
            if (e.key === 'Escape') {
                selectEntity(null);
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedEntityId, setEditorMode, selectEntity, removeEntity, undo, redo, canUndo, canRedo, pushState]);
}
