/**
 * Keyboard Shortcuts Handler
 * Manages global keyboard shortcuts for the editor.
 */

import { historyManager } from '../commands';

/**
 * Initialize keyboard shortcuts
 */
export function initKeyboardShortcuts(): void {
    document.addEventListener('keydown', handleKeyDown);
    console.log('✅ Keyboard shortcuts initialized');
}

/**
 * Cleanup keyboard shortcuts
 */
export function cleanupKeyboardShortcuts(): void {
    document.removeEventListener('keydown', handleKeyDown);
}

/**
 * Handle keydown events
 */
function handleKeyDown(e: KeyboardEvent): void {
    // Ignore if typing in an input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
    }

    const isCtrl = e.ctrlKey || e.metaKey;

    // Ctrl+Z - Undo
    if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyManager.undo()) {
            console.log('↩️ Undo');
        }
        return;
    }

    // Ctrl+Y or Ctrl+Shift+Z - Redo
    if ((isCtrl && e.key === 'y') || (isCtrl && e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        if (historyManager.redo()) {
            console.log('↪️ Redo');
        }
        return;
    }

    // Delete - Delete selected entity
    if (e.key === 'Delete') {
        // Will be handled by the editor store
        window.dispatchEvent(new CustomEvent('editor:delete'));
        return;
    }

    // W - Translate mode
    if (e.key === 'w' && !isCtrl) {
        window.dispatchEvent(new CustomEvent('editor:transform-mode', { detail: 'translate' }));
        return;
    }

    // E - Rotate mode
    if (e.key === 'e' && !isCtrl) {
        window.dispatchEvent(new CustomEvent('editor:transform-mode', { detail: 'rotate' }));
        return;
    }

    // R - Scale mode
    if (e.key === 'r' && !isCtrl) {
        window.dispatchEvent(new CustomEvent('editor:transform-mode', { detail: 'scale' }));
        return;
    }

    // F - Focus on selected
    if (e.key === 'f' && !isCtrl) {
        window.dispatchEvent(new CustomEvent('editor:focus-selected'));
        return;
    }
}
