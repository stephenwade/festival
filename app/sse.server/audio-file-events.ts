import type { AudioFile } from '@prisma/client';
import type { useLoaderData } from '@remix-run/react';

import { dispatchAdminEvent } from './admin-events';

type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;

export type AudioFileProcessingEvent = SerializeFrom<AudioFile>;

export const AUDIO_FILE_EVENT_TYPE = 'audio file processing';

export function emitAudioFileProcessingEvent(data: AudioFileProcessingEvent) {
  dispatchAdminEvent(AUDIO_FILE_EVENT_TYPE, data);
}
