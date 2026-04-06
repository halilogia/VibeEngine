

import { historyManager } from '@editor/commands';

export function initKeyboardShortcuts(): void {
    document.addEventListener('keydown', handleKeyDown);
    console.log('✅ Keyboard shortcuts initialized');
}

export function cleanupKeyboardShortcuts(): void {
    document.removeEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e: KeyboardEvent): void {
    
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
    }

    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyManager.undo()) {
            console.log('↩️ Undo');
        }
        return;
    }

    if ((isCtrl && e.key === 'y') || (isCtrl && e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        if (historyManager.redo()) {
            console.log('↪️ Redo');
        }
        return;
    }

    if (e.key === 'Delete') {
        
        window.dispatchEvent(new CustomEvent('editor:delete'));
        return;
    }

    if (e.key === 'w' && !isCtrl) {
        window.dispatchEvent(new CustomEvent('editor:transform-mode', { detail: 'translate' }));
        return;
    }

    if (e.key === 'e' && !isCtrl) {
        window.dispatchEvent(new CustomEvent('editor:transform-mode', { detail: 'rotate' }));
        return;
    }

    if (e.key === 'r' && !isCtrl) {
        window.dispatchEvent(new CustomEvent('editor:transform-mode', { detail: 'scale' }));
        return;
    }

    if (e.key === 'f' && !isCtrl) {
        window.dispatchEvent(new CustomEvent('editor:focus-selected'));
        return;
    }
}
