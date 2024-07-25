// Inspired by https://github.com/Buzut/huge-uploader

import type { SerializeFrom } from '@remix-run/node';
import { nanoid } from 'nanoid';

import { uploadAudioFileKeys } from '~/forms/upload-audio';
import type { action as partialAudioUploadAction } from '~/routes/admin.audio-upload.partial';

import { xhrPromise } from './xhrPromise';

type UploadResponse = Exclude<
  SerializeFrom<typeof partialAudioUploadAction>,
  null
>;

const UPLOAD_ENDPOINT = '/admin/audio-upload/partial';
const CHUNK_SIZE = 50_000_000; // 50 MB
const RETRIES = 5;
const DELAY_BEFORE_RETRY = 5000;

type HandleUploadProgressFunction = (detail: {
  /** A number between 0 and 1 */
  progress: number;
}) => void;
type HandleUploadFinishFunction = (detail: { file: UploadResponse }) => void;
type HandleUploadChunkRetryFunction = (detail: {
  chunkIndex: number;
  retriesLeft: number;
}) => void;
type HandleUploadErrorFunction = (detail: { chunkIndex: number }) => void;

interface AudioFileUploaderOptions {
  onProgress?: HandleUploadProgressFunction;
  onFinish?: HandleUploadFinishFunction;
  onChunkRetry?: HandleUploadChunkRetryFunction;
  onError?: HandleUploadErrorFunction;
}

type UploadStatus = 'not started' | 'in progress' | 'paused' | 'done';

export class AudioFileUploader {
  status: UploadStatus = 'not started';

  private uploadId = nanoid();
  private currentChunkIndex = 0;
  private retriesCount = 0;
  private abortController: AbortController | null = null;

  private get totalChunks() {
    return Math.ceil(this.file.size / CHUNK_SIZE);
  }

  constructor(
    private file: File,
    private options: AudioFileUploaderOptions,
  ) {}

  private onlineCallback = () => {
    void this.sendChunks();
  };

  start() {
    this.status = 'in progress';
    void this.sendChunks();

    window.addEventListener('online', this.onlineCallback);
  }

  pause() {
    if (this.status === 'in progress') {
      this.status = 'paused';
      this.abortController?.abort();
    }
  }

  resume() {
    if (this.status === 'paused') {
      this.status = 'in progress';
      void this.sendChunks();
    }
  }

  private cleanupEventListener() {
    window.removeEventListener('online', this.onlineCallback);
  }

  private async getCurrentChunk() {
    const length = CHUNK_SIZE;
    const start = length * this.currentChunkIndex;

    const arrayBuffer = await this.file
      .slice(start, start + length)
      .arrayBuffer();

    return new Blob([arrayBuffer], { type: 'application/octet-stream' });
  }

  private sendChunk(chunk: Blob) {
    const form = new FormData();
    form.append(uploadAudioFileKeys.uploadId, this.uploadId);
    form.append(
      uploadAudioFileKeys.chunkNumber,
      String(this.currentChunkIndex + 1),
    );
    form.append(uploadAudioFileKeys.totalChunks, String(this.totalChunks));
    form.append(uploadAudioFileKeys.chunk, chunk, this.file.name);

    this.abortController = new AbortController();
    return xhrPromise(form, {
      url: UPLOAD_ENDPOINT,
      onProgress: (progress) => {
        this.options.onProgress?.({
          progress: (this.currentChunkIndex + progress) / this.totalChunks,
        });
      },
      signal: this.abortController.signal,
    });
  }

  private shouldContinue() {
    return this.status === 'in progress' && navigator.onLine;
  }

  private retry() {
    if (!this.shouldContinue()) {
      return;
    }

    this.retriesCount += 1;
    if (this.retriesCount >= RETRIES) {
      this.cleanupEventListener();
      this.options.onError?.({ chunkIndex: this.currentChunkIndex });
      return;
    }

    this.options.onChunkRetry?.({
      chunkIndex: this.currentChunkIndex,
      retriesLeft: RETRIES - this.retriesCount,
    });
    setTimeout(() => {
      void this.sendChunks();
    }, DELAY_BEFORE_RETRY);
  }

  private async sendChunks() {
    if (!this.shouldContinue()) {
      return;
    }

    try {
      const chunk = await this.getCurrentChunk();
      const response = await this.sendChunk(chunk);
      if ([200, 201, 204].includes(response.status)) {
        this.currentChunkIndex += 1;
        if (this.currentChunkIndex < this.totalChunks) {
          void this.sendChunks();
        } else {
          this.status = 'done';
          this.cleanupEventListener();
          const body = JSON.parse(response.responseText) as UploadResponse;
          this.options.onFinish?.({ file: body });
        }
      } else if ([408, 502, 503, 504].includes(response.status)) {
        // errors that might be temporary, wait a bit then retry
        this.retry();
      } else {
        if (!this.shouldContinue()) {
          return;
        }
        this.cleanupEventListener();
        this.options.onError?.({ chunkIndex: this.currentChunkIndex });
      }
    } catch {
      // this type of error can happen after network disconnection on CORS setup
      this.retry();
    }
  }
}
