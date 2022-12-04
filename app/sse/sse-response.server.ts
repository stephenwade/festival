import type { EventEmitter } from 'node:events';

/**
 * Data passed into this function will be serialized with `JSON.stringify`.
 */
type SendFunction = (event: string, data: unknown) => void;
type CleanupFunction = () => void;

/**
 * Based on code found at
 * https://github.com/remix-run/remix/discussions/2622#discussioncomment-3916017.
 *
 * For more information on server-sent events, see
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events Using server-sent events}
 * on MDN.
 */
export function createSseResponse(
  request: Request,
  init: (send: SendFunction) => CleanupFunction
) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const cleanup = init(send);

      let closed = false;
      const close = () => {
        if (closed) return;
        cleanup();
        closed = true;
        request.signal.removeEventListener('abort', close);
        controller.close();
      };

      request.signal.addEventListener('abort', close);
      if (request.signal.aborted) {
        close();
        return;
      }
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream' },
  });
}

export function createSseResponseWithEmitter(
  request: Request,
  emitter: EventEmitter,
  events: readonly string[]
) {
  return createSseResponse(request, (send) => {
    const handlers = events.map(
      (eventName) =>
        [
          eventName,
          (data: unknown) => {
            send(eventName, data);
          },
        ] as const
    );

    for (const [eventName, handler] of handlers) {
      emitter.addListener(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of handlers) {
        emitter.removeListener(eventName, handler);
      }
    };
  });
}
