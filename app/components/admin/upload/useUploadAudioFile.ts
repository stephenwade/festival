// Inspired by https://github.com/Buzut/huge-uploader

import type { SerializeFrom } from '@remix-run/node';
import { nanoid } from 'nanoid';
import { useCallback, useState, useSyncExternalStore } from 'react';

import { uploadAudioFileKeys } from '~/forms/upload-audio';
import type { action as partialAudioUploadAction } from '~/routes/admin.audio-upload.partial';

import { xhrPromise } from './xhrPromise';

const UPLOAD_ENDPOINT = '/admin/audio-upload/partial';
const CHUNK_SIZE = 50_000_000; // 50 MB
const RETRIES = 5;
const DELAY_BEFORE_RETRY = 5000;

interface UploadData {
  file: File;
  totalChunks: number;
  uploadId: string;
  currentChunkIndex: number;
  abortController?: AbortController;
}

type UploadResponse = Exclude<
  SerializeFrom<typeof partialAudioUploadAction>,
  null
>;

interface UploadStateNotDone {
  status: 'in progress' | 'paused' | 'error';
  /** A number between 0 and 1 */ progress: number;
  retriesCount: number;
}
interface UploadStateDone {
  status: 'done';
  file: UploadResponse;
}
type UploadState = UploadStateNotDone | UploadStateDone;

export function isIdle(state: UploadState) {
  return ['error', 'done'].includes(state.status);
}

const uploadDataRecord: Record<string, UploadData> = {};
let uploadStateRecord: Record<string, UploadState> = {};
const listeners = new Set<() => void>();

export function useUploadStates() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return store;
}

function getSnapshot() {
  return uploadStateRecord;
}

function getServerSnapshot() {
  return uploadStateRecord;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function notifyListeners() {
  uploadStateRecord = { ...uploadStateRecord };
  for (const listener of listeners) {
    listener();
  }
}

function shouldContinue(uploadId: string) {
  const state = uploadStateRecord[uploadId];

  return state?.status === 'in progress' && navigator.onLine;
}

async function getCurrentChunk(uploadId: string) {
  const data = uploadDataRecord[uploadId];
  if (!data) {
    throw new Error('Upload data not found');
  }

  const length = CHUNK_SIZE;
  const start = length * data.currentChunkIndex;

  const arrayBuffer = await data.file
    .slice(start, start + length)
    .arrayBuffer();

  return new Blob([arrayBuffer], { type: 'application/octet-stream' });
}

function sendChunk(uploadId: string, chunk: Blob) {
  const data = uploadDataRecord[uploadId];
  if (!data) {
    throw new Error('Upload data not found');
  }

  const form = new FormData();
  form.append(uploadAudioFileKeys.uploadId, uploadId);
  form.append(
    uploadAudioFileKeys.chunkNumber,
    String(data.currentChunkIndex + 1),
  );
  form.append(uploadAudioFileKeys.totalChunks, String(data.totalChunks));
  form.append(uploadAudioFileKeys.chunk, chunk, data.file.name);

  const abortController = new AbortController();
  uploadDataRecord[uploadId] = { ...data, abortController };

  return xhrPromise(form, {
    url: UPLOAD_ENDPOINT,
    onProgress: (chunkProgress) => {
      const state = uploadStateRecord[uploadId];

      if (!state || !('progress' in state)) {
        return;
      }

      const progress =
        (data.currentChunkIndex * CHUNK_SIZE + chunkProgress * chunk.size) /
        data.file.size;
      uploadStateRecord[uploadId] = { ...state, progress };
      notifyListeners();
    },
    signal: abortController.signal,
  });
}

function retry(uploadId: string) {
  if (!shouldContinue(uploadId)) {
    return;
  }

  const state = uploadStateRecord[uploadId] as UploadStateNotDone;

  const nextRetriesCount = state.retriesCount + 1;
  const isError = nextRetriesCount >= RETRIES;
  const nextStatus = isError ? 'error' : state.status;
  uploadStateRecord[uploadId] = {
    ...state,
    status: nextStatus,
    retriesCount: nextRetriesCount,
  };
  notifyListeners();

  if (isError) {
    return;
  }

  setTimeout(() => {
    void sendChunks(uploadId);
  }, DELAY_BEFORE_RETRY);
}

async function sendChunks(uploadId: string) {
  if (!shouldContinue(uploadId)) {
    return;
  }

  const data = uploadDataRecord[uploadId];
  if (!data) {
    throw new Error('Upload data not found');
  }

  try {
    const chunk = await getCurrentChunk(uploadId);
    const response = await sendChunk(uploadId, chunk);
    if ([200, 201, 204].includes(response.status)) {
      const nextChunkIndex = data.currentChunkIndex + 1;
      uploadDataRecord[uploadId] = {
        ...data,
        currentChunkIndex: nextChunkIndex,
      };

      if (nextChunkIndex < data.totalChunks) {
        void sendChunks(uploadId);
      } else {
        const body = JSON.parse(response.responseText) as UploadResponse;
        uploadStateRecord[uploadId] = { status: 'done', file: body };
      }

      notifyListeners();
    } else if ([408, 502, 503, 504].includes(response.status)) {
      // errors that might be temporary, wait a bit then retry
      retry(uploadId);
    } else {
      if (!shouldContinue(uploadId)) {
        return;
      }

      const state = uploadStateRecord[uploadId];
      if (!state || state.status === 'done') {
        return;
      }
      uploadStateRecord[uploadId] = { ...state, status: 'error' };
      notifyListeners();
    }
  } catch {
    // this type of error can happen after network disconnection on CORS setup
    retry(uploadId);
  }
}

function start_(file: File): string {
  const uploadId = nanoid();

  uploadDataRecord[uploadId] = {
    file,
    totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    uploadId,
    currentChunkIndex: 0,
    abortController: new AbortController(),
  };
  uploadStateRecord[uploadId] = {
    status: 'in progress',
    progress: 0,
    retriesCount: 0,
  };
  notifyListeners();

  void sendChunks(uploadId);

  return uploadId;
}

function pause_(uploadId: string) {
  const state = uploadStateRecord[uploadId];
  if (!state || state.status !== 'in progress') {
    return;
  }

  const data = uploadDataRecord[uploadId];
  if (!data) {
    return;
  }

  uploadStateRecord[uploadId] = { ...state, status: 'paused' };
  notifyListeners();

  data.abortController?.abort();
}

function resume_(uploadId: string) {
  const state = uploadStateRecord[uploadId];
  if (!state || state.status !== 'paused') {
    return;
  }

  uploadStateRecord[uploadId] = { ...state, status: 'in progress' };
  notifyListeners();

  void sendChunks(uploadId);
}

function abort_(uploadId: string) {
  const state = uploadStateRecord[uploadId];
  if (!state || state.status === 'done') {
    return;
  }

  const data = uploadDataRecord[uploadId];
  if (!data) {
    return;
  }

  data.abortController?.abort();

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete uploadStateRecord[uploadId];
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete uploadDataRecord[uploadId];
  notifyListeners();
}

export function useUploadAudioFile() {
  const states = useUploadStates();

  const [uploadId, setUploadId] = useState<string>();

  const start = useCallback(
    (file: File): void => {
      if (uploadId) {
        abort_(uploadId);
      }

      const id = start_(file);
      setUploadId(id);
    },
    [uploadId],
  );

  const pause = useCallback((): void => {
    if (!uploadId) {
      return;
    }

    pause_(uploadId);
  }, [uploadId]);

  const resume = useCallback((): void => {
    if (!uploadId) {
      return;
    }

    resume_(uploadId);
  }, [uploadId]);

  const abort = useCallback((): void => {
    if (!uploadId) {
      return;
    }

    abort_(uploadId);
  }, [uploadId]);

  return {
    start,
    pause,
    resume,
    abort,
    state: uploadId ? states[uploadId] : undefined,
  };
}
