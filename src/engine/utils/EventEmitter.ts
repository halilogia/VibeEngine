/**
 * EventEmitter - Simple event system for components and entities
 */

type EventCallback = (...args: any[]) => void;

export class EventEmitter {
    private readonly events: Map<string, EventCallback[]> = new Map();

    /**
     * Subscribe to an event
     */
    on(event: string, callback: EventCallback): this {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
        return this;
    }

    /**
     * Subscribe once (auto-removes after first call)
     */
    once(event: string, callback: EventCallback): this {
        const wrapper = (...args: any[]) => {
            this.off(event, wrapper);
            callback(...args);
        };
        return this.on(event, wrapper);
    }

    /**
     * Unsubscribe from an event
     */
    off(event: string, callback: EventCallback): this {
        const callbacks = this.events.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
        return this;
    }

    /**
     * Emit an event
     */
    emit(event: string, ...args: any[]): this {
        const callbacks = this.events.get(event);
        if (callbacks) {
            for (const callback of [...callbacks]) {
                callback(...args);
            }
        }
        return this;
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: string): this {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
        return this;
    }

    /**
     * Check if event has listeners
     */
    hasListeners(event: string): boolean {
        return (this.events.get(event)?.length ?? 0) > 0;
    }

    /**
     * Get listener count for an event
     */
    listenerCount(event: string): number {
        return this.events.get(event)?.length ?? 0;
    }
}

/** Global event bus for engine-wide events */
export const globalEvents = new EventEmitter();
