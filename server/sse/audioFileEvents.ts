import { EventEmitter, on } from 'node:events';

import type { AudioFile } from '@prisma/client';

const audioFileEventEmitter = new EventEmitter();

const AUDIO_FILE_UPDATE_EVENT = 'audio-file-update';

export function emitAudioFileUpdate(data: AudioFile) {
  audioFileEventEmitter.emit(AUDIO_FILE_UPDATE_EVENT, data);
}

export function subscribeToAudioFileUpdates(signal?: AbortSignal) {
  return on(audioFileEventEmitter, AUDIO_FILE_UPDATE_EVENT, {
    signal,
  }) as AsyncIterable<[AudioFile]>;
}
