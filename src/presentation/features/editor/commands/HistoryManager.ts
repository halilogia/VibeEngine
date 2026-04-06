

export interface ICommand {
    
    execute(): void;
    
    undo(): void;
    
    description: string;
}

export class HistoryManager {
    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];
    private maxHistory: number;

    onHistoryChange?: () => void;

    constructor(maxHistory: number = 50) {
        this.maxHistory = maxHistory;
    }

    execute(command: ICommand): void {
        command.execute();
        this.undoStack.push(command);

        this.redoStack = [];

        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }

        this.onHistoryChange?.();
    }

    undo(): boolean {
        const command = this.undoStack.pop();
        if (!command) return false;

        command.undo();
        this.redoStack.push(command);
        this.onHistoryChange?.();
        return true;
    }

    redo(): boolean {
        const command = this.redoStack.pop();
        if (!command) return false;

        command.execute();
        this.undoStack.push(command);
        this.onHistoryChange?.();
        return true;
    }

    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    getUndoStack(): readonly ICommand[] {
        return this.undoStack;
    }

    getRedoStack(): readonly ICommand[] {
        return this.redoStack;
    }

    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
        this.onHistoryChange?.();
    }
}

export const historyManager = new HistoryManager();
