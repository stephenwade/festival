import type { Prisma } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';

import { dispatchAdminEvent } from './admin-events';

export type AudioFileUploadEvent = SerializeFrom<
  Prisma.AudioFileUploadGetPayload<{
    include: { audioFile: true };
  }>
>;

export const AUDIO_FILE_EVENT_TYPE = 'audio file processing';

export function emitAudioFileProcessingEvent(data: AudioFileUploadEvent) {
  dispatchAdminEvent(AUDIO_FILE_EVENT_TYPE, data);
}
