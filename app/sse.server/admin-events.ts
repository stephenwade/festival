import { eventStream } from 'remix-utils/sse/server';

/**
 * Workaround for Remix App Server reloading all files on each request.
 *
 * @see {@link https://remix.run/docs/en/v1/other-api/serve Remix App Server}
 */
function getAdminEventTarget() {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (!globalThis.adminEventTarget) {
    globalThis.adminEventTarget = new EventTarget();
  }

  return globalThis.adminEventTarget;
}

declare global {
  // eslint-disable-next-line no-var
  var adminEventTarget: EventTarget | undefined;
}

export function dispatchAdminEvent(type: string, data: unknown) {
  const eventTarget = getAdminEventTarget();

  eventTarget.dispatchEvent(new CustomEvent(type, { detail: data }));
}

export function adminEventStream(request: Request, type: string) {
  const eventTarget = getAdminEventTarget();

  return eventStream(request.signal, (send) => {
    const callback = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      send({ data: JSON.stringify(event.detail) });
    };

    eventTarget.addEventListener(type, callback);

    return () => {
      eventTarget.removeEventListener(type, callback);
    };
  });
}
