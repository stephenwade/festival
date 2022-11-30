import { EventEmitter } from 'node:events';

import { createSseResponseWithEmitter } from './sse-response.server';

/**
 * Workaround for Remix App Server reloading all files on each request.
 *
 * @see {@link https://remix.run/docs/en/v1/other-api/serve Remix App Server}
 */
export const getAdminEmitter = () => {
  if (!global.adminEmitter) {
    global.adminEmitter = new EventEmitter();
  }

  return global.adminEmitter;
};

declare global {
  // eslint-disable-next-line no-var
  var adminEmitter: EventEmitter;
}

export function createAdminSseResponse(request: Request, events: string[]) {
  const emitter = getAdminEmitter();

  return createSseResponseWithEmitter(request, emitter, events);
}
