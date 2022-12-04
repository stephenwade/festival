import { useEffect, useRef } from 'react';

export function useSse<T extends string>(
  url: string | URL,
  events: readonly T[],
  onEvent: (eventName: T, data: unknown) => void
) {
  const eventSourceRef = useRef<EventSource>();

  useEffect(() => {
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    const handlers = events.map(
      (eventName) =>
        [
          eventName,
          (event: MessageEvent<string>) => {
            onEvent(eventName, JSON.parse(event.data));
          },
        ] as const
    );

    for (const [eventName, handler] of handlers) {
      eventSource.addEventListener(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of handlers) {
        eventSource.removeEventListener(eventName, handler);
      }

      eventSource.close();
    };
  }, [events, onEvent, url]);
}
