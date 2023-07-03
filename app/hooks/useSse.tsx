import { useEffect } from 'react';

const eventSources = new Map<
  string | URL,
  { eventSource: EventSource; refCount: number }
>();

export function useSse<T>(url: string | URL, onMessage: (data: T) => void) {
  useEffect(() => {
    const eventSourceData = eventSources.get(url);
    const eventSource = eventSourceData?.eventSource ?? new EventSource(url);
    eventSources.set(url, {
      eventSource,
      refCount: (eventSourceData?.refCount ?? 0) + 1,
    });

    const handler = (event: MessageEvent<string>) => {
      onMessage(JSON.parse(event.data) as T);
    };

    eventSource.addEventListener('message', handler);

    return () => {
      eventSource.removeEventListener('message', handler);

      const eventSourceData = eventSources.get(url);
      if (eventSourceData?.refCount === 1) {
        eventSource.close();
        eventSources.delete(url);
      } else if (eventSourceData) {
        eventSources.set(url, {
          eventSource: eventSourceData.eventSource,
          refCount: eventSourceData.refCount - 1,
        });
      } else {
        // This should never happen
        eventSource.close();
      }
    };
  }, [onMessage, url]);
}
