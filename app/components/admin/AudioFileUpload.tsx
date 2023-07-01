import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useControlField, useField } from 'remix-validated-form';
import type { z } from 'zod';

import type { setSchema } from '~/forms/show';
import { UPLOAD_AUDIO_FORM_KEY } from '~/forms/upload-audio';
import { useSse } from '~/hooks/useSse';
import type { loader as audioUploadLoader } from '~/routes/admin/audio-upload/$id';
import type { AudioFileUploadEvent } from '~/routes/admin/audio-upload/events';
import type { action as newAudioUploadAction } from '~/routes/admin/audio-upload/new';

type PutFormResponse = SerializeFrom<typeof newAudioUploadAction>;

type PutFormOptions = {
  url: string;
  onProgress?: (progress: number) => void;
};

function putForm(form: FormData, options: PutFormOptions) {
  const { url, onProgress } = options;

  // Can't use fetch because it doesn't support tracking upload progress
  const request = new Promise<PutFormResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText) as PutFormResponse;
        resolve(response);
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

type Props = {
  name: string;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
};

export const AudioFileUpload: FC<Props> = ({
  name,
  isUploading,
  setIsUploading,
}) => {
  const { getInputProps } = useField(name);
  const [fileUploadId, setFileUploadId] =
    useControlField<z.infer<typeof setSchema>['audioFileUploadId']>(name);

  const [fileUploadState, setFileUploadState] =
    useState<SerializeFrom<typeof audioUploadLoader>>();

  useSse(
    '/admin/audio-upload/events',
    useCallback(
      (data: AudioFileUploadEvent) => {
        if (data.id !== fileUploadId) return;
        setFileUploadState(data);
      },
      [fileUploadId]
    )
  );

  const fetcher = useFetcher<typeof audioUploadLoader>();
  useEffect(() => {
    if (
      !fileUploadId ||
      fetcher.data ||
      fetcher.state === 'loading' ||
      fileUploadState
    ) {
      return;
    }

    // Only use fetcher if needed. Further data will be fetched from the SSE.
    fetcher.load(`/admin/audio-upload/${fileUploadId}`);
  }, [fetcher, fileUploadId, fileUploadState]);

  const fileUpload = fileUploadState ?? fetcher.data;

  const [fileName, setFileName] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onUploadClick = () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files?.length) return;

    const file = fileInput.files[0];
    setIsUploading(true);
    setFileName(file.name);
    setUploadProgress(0);

    const form = new FormData();
    form.append(UPLOAD_AUDIO_FORM_KEY, file);
    putForm(form, {
      url: '/admin/audio-upload/new',
      onProgress: setUploadProgress,
    })
      .then((fileUpload) => {
        setFileUploadState({ ...fileUpload, audioFile: null });

        // Wait a bit to make sure the fetcher is not triggered before the
        // file upload state is updated.
        setTimeout(() => {
          setFileUploadId(fileUpload.id);
          setIsUploading(false);
        }, 100);
      })
      .catch((error: { reason: string; status?: number }) => {
        console.error(`Audio file upload ${name} failed.`, error);
      });

    fileInput.value = '';
  };

  const onRemoveFileClick = () => {
    setFileUploadId(undefined);
    setFileUploadState(undefined);
  };

  return (
    <>
      <input
        {...getInputProps({
          type: 'hidden',
          value: fileUploadId ?? '',
        })}
      />
      <p>
        {isUploading ? (
          <>
            Uploading… <progress value={uploadProgress} /> {fileName}
          </>
        ) : fileUploadId ? (
          fileUpload ? (
            fileUpload.audioFile ? (
              <>
                Duration: {fileUpload.audioFile.duration}{' '}
                <button type="button" onClick={onRemoveFileClick}>
                  Remove file
                </button>
              </>
            ) : fileUpload.errorMessage ? (
              <>Error while converting audio file: {fileUpload.errorMessage}</>
            ) : (
              <>
                {fileUpload.status}{' '}
                {fileUpload.convertProgress !== null && (
                  <progress value={fileUpload.convertProgress} />
                )}
              </>
            )
          ) : (
            'Loading…'
          )
        ) : (
          <>
            <input type="file" ref={fileInputRef} accept="audio/*" />{' '}
            <button type="button" onClick={onUploadClick}>
              Upload
            </button>
          </>
        )}
      </p>
    </>
  );
};
