/**
 * Command Pattern for Undo/Redo functionality
 * Base classes and history manager.
 */

/**
 * Base Command interface
 */
export interface ICommand {
    /** Execute the command */
    execute(): void;
    /** Undo the command */
    undo(): void;
    /** Description for UI */
    description: string;
}

/**
 * History Manager - manages undo/redo stack
 */
export class HistoryManager {
    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];
    private maxHistory: number;

    /** Callback when history changes */
    onHistoryChange?: () => void;

    constructor(maxHistory: number = 50) {
        this.maxHistory = maxHistory;
    }

    /**
     * Execute a command and add to history
     */
    execute(command: ICommand): void {
        command.execute();
        this.undoStack.push(command);

        // Clear redo stack
        this.redoStack = [];

        // Limit history size
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }

        this.onHistoryChange?.();
    }

    /**
     * Undo last command
     */
    undo(): boolean {
        const command = this.undoStack.pop();
        if (!command) return false;

        command.undo();
        this.redoStack.push(command);
        this.onHistoryChange?.();
        return true;
    }

    /**
     * Redo last undone command
     */
    redo(): boolean {
        const command = this.redoStack.pop();
        if (!command) return false;

        command.execute();
        this.undoStack.push(command);
        this.onHistoryChange?.();
        return true;
    }

    /**
     * Check if undo is available
     */
    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    /**
     * Get undo stack (for debugging/UI)
     */
    getUndoStack(): readonly ICommand[] {
        return this.undoStack;
    }

    /**
     * Get redo stack (for debugging/UI)
     */
    getRedoStack(): readonly ICommand[] {
        return this.redoStack;
    }

    /**
     * Clear all history
     */
    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
        this.onHistoryChange?.();
    }
}

// Global history manager instance
export const historyManager = new HistoryManager();
