export type Listener<T> = (value: Readonly<T>) => void;
export type Unsubscribe = () => void;
export type Subscribe<T> = (listener: Listener<T>) => Unsubscribe;

export class ListenerSet<T> {
  private readonly listeners = new Set<Listener<T>>();

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(value: T) {
    for (const listener of this.listeners) {
      listener(value);
    }
  }

  clear() {
    this.listeners.clear();
  }
}
