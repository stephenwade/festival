import type { Prisma } from '@prisma/client';
import type { LoaderFunction, SerializeFrom } from '@remix-run/node';

import {
  adminEventStream,
  dispatchAdminEvent,
} from '~/sse/admin-events.server';

export type AudioFileUploadEvent = SerializeFrom<
  Prisma.AudioFileUploadGetPayload<{
    include: { audioFile: true };
  }>
>;

const EVENT_TYPE = 'audio file processing';

export function emitAudioFileProcessingEvent(data: AudioFileUploadEvent) {
  dispatchAdminEvent(EVENT_TYPE, data);
}

export const loader = (({ request }) => {
  return adminEventStream(request, EVENT_TYPE);
}) satisfies LoaderFunction;
