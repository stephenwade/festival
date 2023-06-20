import type { Prisma } from '@prisma/client';
import type { LoaderFunction, SerializeFrom } from '@remix-run/node';

import {
  adminEventStream,
  dispatchAdminEvent,
} from '~/sse/admin-events.server';

export type FileUploadEvent = SerializeFrom<
  Prisma.FileUploadGetPayload<{
    include: { file: true };
  }>
>;

const EVENT_TYPE = 'file processing';

export function emitFileProcessingEvent(data: FileUploadEvent) {
  dispatchAdminEvent(EVENT_TYPE, data);
}

export const loader = (({ request }) => {
  return adminEventStream(request, EVENT_TYPE);
}) satisfies LoaderFunction;
