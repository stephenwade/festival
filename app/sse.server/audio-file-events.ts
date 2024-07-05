import type { AudioFile } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';

import { dispatchAdminEvent } from './admin-events';

export type AudioFileProcessingEvent = SerializeFrom<AudioFile>;

export const AUDIO_FILE_EVENT_TYPE = 'audio file processing';

export function emitAudioFileProcessingEvent(data: AudioFileProcessingEvent) {
  dispatchAdminEvent(AUDIO_FILE_EVENT_TYPE, data);
}
