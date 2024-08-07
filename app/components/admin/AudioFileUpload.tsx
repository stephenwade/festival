import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useControlField, useField } from 'remix-validated-form';

import { UPLOAD_AUDIO_FORM_KEY } from '~/forms/upload-audio';
import { useSse } from '~/hooks/useSse';
import type { loader as audioUploadLoader } from '~/routes/admin.audio-upload.$id';
import type { action as newAudioUploadAction } from '~/routes/admin.audio-upload.new';
import type { AudioFileProcessingEvent } from '~/sse.server/audio-file-events';

type PutFormResponse = SerializeFrom<typeof newAudioUploadAction>;

interface PutFormOptions {
  url: string;
  onProgress?: (progress: number) => void;
}

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

function displayConversionStatus(
  status: Exclude<AudioFileProcessingEvent['conversionStatus'], 'DONE'>,
) {
  switch (status) {
    case 'CHECKING':
      return 'Checking…';
    case 'CONVERTING':
      return 'Converting…';
    case 'UPLOADING':
      return 'Uploading…';
    case 'ERROR':
      return 'Error';
  }
}

interface AudioFileUploadProps {
  name: string;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
}

export const AudioFileUpload: FC<AudioFileUploadProps> = ({
  name,
  isUploading,
  setIsUploading,
}) => {
  const { getInputProps } = useField(name);
  const [fileId, setFileId] = useControlField<string | undefined>(name);

  const [fileState, setFileState] =
    useState<SerializeFrom<typeof audioUploadLoader>>();

  useSse(
    '/admin/audio-upload/events',
    useCallback(
      (data: AudioFileProcessingEvent) => {
        if (data.id !== fileId) return;
        setFileState(data);
      },
      [fileId],
    ),
  );

  const fetcher = useFetcher<typeof audioUploadLoader>();
  useEffect(() => {
    if (!fileId || fetcher.data || fetcher.state === 'loading' || fileState) {
      return;
    }

    // Only use fetcher if needed. Further data will be fetched from the SSE.
    fetcher.load(`/admin/audio-upload/${fileId}`);
  }, [fetcher, fileId, fileState]);

  const file = fileState ?? fetcher.data;

  const [fileName, setFileName] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onUploadClick = () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) return;

    const file = fileInput.files[0]!;
    setIsUploading(true);
    setFileName(file.name);
    setUploadProgress(0);

    const form = new FormData();
    form.append(UPLOAD_AUDIO_FORM_KEY, file);
    putForm(form, {
      url: '/admin/audio-upload/new',
      onProgress: setUploadProgress,
    })
      .then((file) => {
        setFileState(file);

        // Wait a bit to make sure the fetcher is not triggered before the
        // file upload state is updated.
        setTimeout(() => {
          setFileId(file.id);
          setIsUploading(false);
        }, 100);
      })
      .catch((error: unknown) => {
        console.error(`Audio file upload ${name} failed.`, error);
      });

    fileInput.value = '';
  };

  const onRemoveFileClick = () => {
    setFileId(undefined);
    setFileState(undefined);
  };

  return (
    <>
      <input
        {...getInputProps({
          type: 'hidden',
          value: fileId ?? '',
        })}
      />
      <p>
        {isUploading ? (
          <>
            Uploading… <progress value={uploadProgress} /> {fileName}
          </>
        ) : fileId ? (
          file ? (
            file.conversionStatus === 'DONE' ? (
              <>
                Duration: {file.duration}{' '}
                <button type="button" onClick={onRemoveFileClick}>
                  Remove file
                </button>
              </>
            ) : file.errorMessage ? (
              <>Error while converting audio file: {file.errorMessage}</>
            ) : (
              <>
                {displayConversionStatus(file.conversionStatus)}{' '}
                {file.conversionProgress === null ? null : (
                  <progress value={file.conversionProgress} />
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
