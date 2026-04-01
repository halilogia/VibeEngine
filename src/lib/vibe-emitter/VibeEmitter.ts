/**
 * VibeEmitter - Type-Safe high-performance event system
 * Provides a robust communication layer with Generics support for engine modules.
 */

export type Listener<T = any> = (data: T) => void;

export class VibeEmitter<EventMap extends Record<string, any>> {
    private readonly listeners: Map<keyof EventMap, Set<Listener>> = new Map();

    /**
     * Subscribe to an event with type safety
     */
    on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener as Listener);
    }

    /**
     * Subscribe once to an event
     */
    once<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
        const wrapper: Listener<EventMap[K]> = (data: EventMap[K]) => {
            this.off(event, wrapper);
            listener(data);
        };
        this.on(event, wrapper);
    }

    /**
     * Unsubscribe from an event
     */
    off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(listener as Listener);
        }
    }

    /**
     * Emit an event with type-safe data payload
     */
    emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach((listener) => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`❌ [VibeEmitter] Error in listener for event "${String(event)}":`, error);
                }
            });
        }
    }

    /**
     * Clear all listeners for a specific event or all events
     */
    clear(event?: keyof EventMap): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get the number of active listeners for an event
     */
    count(event: keyof EventMap): number {
        return this.listeners.get(event)?.size ?? 0;
    }
}
