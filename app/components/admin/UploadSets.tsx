import type { FC } from 'react';
import { useRef } from 'react';
import { useBoolean } from 'usehooks-ts';

type Props = {
  showId: string;
};

export const UploadSets: FC<Props> = ({ showId }) => {
  const {
    value: showingAddSets,
    setTrue: showAddSets,
    setFalse: hideAddSets,
  } = useBoolean();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onUploadClick = () => {
    const form = new FormData();
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files?.length) return;

    for (const [i, file] of [...fileInput.files].entries()) {
      form.append(`upload-${i}`, file);
    }

    // Can't use fetch because it doesn't support tracking upload progress
    const request = new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `/admin/shows/${showId}/upload-sets`);

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as string);
        } else {
          reject({ reason: 'Bad status code', status: xhr.status });
        }
      });

      xhr.upload.addEventListener('progress', (event) => {
        console.log('Progress:', (event.loaded / event.total) * 100);
      });

      xhr.addEventListener('error', () => {
        reject({ reason: 'Error', status: xhr.status });
      });

      xhr.addEventListener('abort', () => {
        reject({ reason: 'Aborted' });
      });

      xhr.send(form);
    });

    request
      .then((response) => {
        console.log('Request complete', response);
      })
      .catch((error) => {
        console.error('Error', error);
      });
  };

  return showingAddSets ? (
    <>
      <input type="file" ref={fileInputRef} accept="audio/*" multiple />{' '}
      <button onClick={onUploadClick}>Upload</button>{' '}
      <button onClick={hideAddSets}>Done</button>
    </>
  ) : (
    <button onClick={showAddSets}>Add sets</button>
  );
};
