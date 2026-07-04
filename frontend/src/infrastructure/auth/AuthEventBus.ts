type AuthEventListener = (payload?: any) => void;

class AuthEventBusClass {
  private listeners = new Map<string, Set<AuthEventListener>>();

  /**
   * Subscribe to an authentication event.
   * Returns an unsubscribe function.
   */
  on(event: string, callback: AuthEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Publish/Dispatch an event to all subscribers.
   */
  emit(event: string, payload?: any): void {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`Error in AuthEventBus listener for ${event}:`, err);
      }
    });
  }

  /**
   * Clear all registered listeners. Primarily for test environments.
   */
  clear(): void {
    this.listeners.clear();
  }
}

export const AuthEventBus = new AuthEventBusClass();
