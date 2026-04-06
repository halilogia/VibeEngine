type EventCallback = (...args: unknown[]) => void;

export class EventEmitter {
  private readonly events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
    return this;
  }

  once(event: string, callback: EventCallback): this {
    const wrapper = (...args: unknown[]) => {
      this.off(event, wrapper);
      callback(...args);
    };
    return this.on(event, wrapper);
  }

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

  emit(event: string, ...args: unknown[]): this {
    const callbacks = this.events.get(event);
    if (callbacks) {
      for (const callback of [...callbacks]) {
        callback(...args);
      }
    }
    return this;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  hasListeners(event: string): boolean {
    return (this.events.get(event)?.length ?? 0) > 0;
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.length ?? 0;
  }
}

export const globalEvents = new EventEmitter();
