import type { Prisma } from '@prisma/client';
import type { LoaderFunction, SerializeFrom } from '@remix-run/node';
import { serverOnly$ } from 'vite-env-only';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
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

export const emitAudioFileProcessingEvent = serverOnly$(
  (data: AudioFileUploadEvent) => {
    dispatchAdminEvent(EVENT_TYPE, data);
  },
);

export const loader = (async (args) => {
  await redirectToLogin(args);

  return adminEventStream(args.request, EVENT_TYPE);
}) satisfies LoaderFunction;
