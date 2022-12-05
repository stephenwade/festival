import type { Show } from '@prisma/client';
import type { FC } from 'react';
import { useReducer, useRef } from 'react';
import { useBoolean } from 'usehooks-ts';

import { UPLOAD_SET_FORM_KEY } from '~/types/admin/upload-set';

type PutFormOptions = {
  url: string;
  onProgress?: (progress: number) => void;
};

function putForm(form: FormData, options: PutFormOptions) {
  const { url, onProgress } = options;

  // Can't use fetch because it doesn't support tracking upload progress
  const request = new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as string);
      } else {
        reject({ reason: 'Bad status code', status: xhr.status });
      }
    });

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        onProgress(event.loaded / event.total);
      });
    }

    xhr.addEventListener('error', () => {
      reject({ reason: 'Error', status: xhr.status });
    });

    xhr.addEventListener('abort', () => {
      reject({ reason: 'Aborted' });
    });

    xhr.send(form);
  });

  return request;
}

let nextUploadId = 0;

type UploadMap = Map<number, { filename: string; progress: number }>;
function uploadMapReducer(
  map: UploadMap,
  action: { uploadId: number } & (
    | { filename: string }
    | { progress: number }
    | { complete: true }
  )
) {
  const { uploadId, ...data } = action;

  const result = new Map(map);

  const thisUpload = map.get(uploadId);

  if (thisUpload) {
    if ('progress' in data) {
      result.set(uploadId, {
        ...thisUpload,
        progress: data.progress,
      });
    } else if ('complete' in data) {
      result.delete(uploadId);
    }
  } else if ('filename' in data) {
    result.set(uploadId, {
      filename: data.filename,
      progress: 0,
    });
  }

  return result;
}

type Props = {
  showId: Show['id'];
};

export const UploadSets: FC<Props> = ({ showId }) => {
  const {
    value: showingAddSets,
    setTrue: showAddSets,
    setFalse: hideAddSets,
  } = useBoolean();

  const [filesUploading, dispatchUploadProgress] = useReducer(
    uploadMapReducer,
    null,
    () => new Map()
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onUploadClick = () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files?.length) return;

    for (const file of fileInput.files) {
      const uploadId = nextUploadId++;
      dispatchUploadProgress({ uploadId, filename: file.name });

      const form = new FormData();
      form.append(UPLOAD_SET_FORM_KEY, file);
      putForm(form, {
        url: `/admin/shows/${showId}/upload-set`,
        onProgress: (progress) => {
          dispatchUploadProgress({ uploadId, progress });
        },
      })
        .then(() => {
          dispatchUploadProgress({ uploadId, complete: true });
        })
        .catch((error: { reason: string; status?: number }) => {
          console.error(`File upload ${uploadId} failed.`, error);
        });
    }

    fileInput.value = '';
  };

  return (
    <>
      <p>
        {showingAddSets ? (
          <>
            <input type="file" ref={fileInputRef} accept="audio/*" multiple />{' '}
            <button onClick={onUploadClick}>Upload</button>{' '}
            <button onClick={hideAddSets}>Done</button>
          </>
        ) : (
          <button onClick={showAddSets}>Add sets</button>
        )}
      </p>
      {filesUploading.size > 0 ? (
        <>
          <h4>Uploading…</h4>
          <ul>
            {[...filesUploading.entries()].map(
              ([uploadId, { filename, progress }]) => (
                <li key={uploadId}>
                  <progress value={progress} /> {filename}
                </li>
              )
            )}
          </ul>
        </>
      ) : null}
    </>
  );
};
