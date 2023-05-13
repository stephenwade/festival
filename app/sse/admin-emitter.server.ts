import { EventEmitter } from 'node:events';

import { createSseResponseWithEmitter } from './sse-response.server';

/**
 * Workaround for Remix App Server reloading all files on each request.
 *
 * @see {@link https://remix.run/docs/en/v1/other-api/serve Remix App Server}
 */
export function getAdminEmitter<T extends string>() {
  if (!global.adminEmitter) {
    // eslint-disable-next-line unicorn/prefer-event-target
    global.adminEmitter = new EventEmitter();
  }

  return global.adminEmitter as EventEmitterAllowEventNames<T>;
}

declare global {
  // eslint-disable-next-line no-var
  var adminEmitter: EventEmitter;
}

export interface EventEmitterAllowEventNames<T extends string>
  extends EventEmitter {
  emit(eventName: T, ...args: unknown[]): boolean;
}

export function createAdminSseResponse(
  request: Request,
  events: readonly string[]
) {
  const emitter = getAdminEmitter();

  return createSseResponseWithEmitter(request, emitter, events);
}
