import { EventEmitter, on } from 'node:events';

import type { AudioFile } from '@prisma/client';

function getAudioFileEventEmitter() {
  globalThis.audioFileEventEmitter ??= new EventEmitter();

  return globalThis.audioFileEventEmitter;
}

declare global {
  var audioFileEventEmitter: EventEmitter | undefined;
}

const AUDIO_FILE_UPDATE_EVENT = 'audio-file-update';

export function emitAudioFileUpdate(data: AudioFile) {
  getAudioFileEventEmitter().emit(AUDIO_FILE_UPDATE_EVENT, data);
}

export function subscribeToAudioFileUpdates(signal?: AbortSignal) {
  return on(getAudioFileEventEmitter(), AUDIO_FILE_UPDATE_EVENT, {
    signal,
  }) as AsyncIterable<[AudioFile]>;
}
