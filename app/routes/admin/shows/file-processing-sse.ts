import type { LoaderFunction } from '@remix-run/node';

import {
  createAdminSseResponse,
  getAdminEmitter,
} from '~/sse/admin-emitter.server';
import type {
  FileProcessingEventName,
  FileProcessingFileUpdateData,
  FileProcessingNewSetData,
  FileProcessingSetUpdateData,
} from '~/types/admin/file-processing-events';
import { FileProcessingEventNames } from '~/types/admin/file-processing-events';

export function emitNewSet(data: FileProcessingNewSetData) {
  const emitter = getAdminEmitter<FileProcessingEventName>();

  emitter.emit('new set', data);
}

export function emitSetUpdate(data: FileProcessingSetUpdateData) {
  const emitter = getAdminEmitter<FileProcessingEventName>();

  emitter.emit('set update', data);
}

export function emitFileUpdate(data: FileProcessingFileUpdateData) {
  const emitter = getAdminEmitter<FileProcessingEventName>();

  emitter.emit('file update', data);
}

export const loader: LoaderFunction = ({ request }) => {
  return createAdminSseResponse(request, FileProcessingEventNames);
};
