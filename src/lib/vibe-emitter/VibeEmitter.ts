export type Listener<T = unknown> = (data: T) => void;

export class VibeEmitter<EventMap extends Record<string, unknown>> {
  private readonly listeners: Map<keyof EventMap, Set<Listener>> = new Map();

  on<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener);
  }

  once<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): void {
    const wrapper: Listener<EventMap[K]> = (data: EventMap[K]) => {
      this.off(event, wrapper);
      listener(data);
    };
    this.on(event, wrapper);
  }

  off<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as Listener);
    }
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(
            `❌ [VibeEmitter] Error in listener for event "${String(event)}":`,
            error,
          );
        }
      });
    }
  }

  clear(event?: keyof EventMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  count(event: keyof EventMap): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
