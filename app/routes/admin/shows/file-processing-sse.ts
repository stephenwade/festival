import type { LoaderFunction } from '@remix-run/node';

import {
  adminEventStream,
  dispatchAdminEvent,
} from '~/sse/admin-events.server';
import type { FileProcessingEventData } from '~/types/admin/FileProcessingEvent';

const EVENT_TYPE = 'file processing';

export function emitFileProcessingEvent(data: FileProcessingEventData) {
  dispatchAdminEvent(EVENT_TYPE, data);
}

export const loader = (({ request }) => {
  return adminEventStream(request, EVENT_TYPE);
}) satisfies LoaderFunction;
