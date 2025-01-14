import type { useLoaderData } from '@remix-run/react';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useControlField, useField } from 'remix-validated-form';

import { useSse } from '~/hooks/useSse';
import type { loader as audioUploadLoader } from '~/routes/admin.audio-upload.$id';
import type { AudioFileProcessingEvent } from '~/sse.server/audio-file-events';

import type { useUploadAudioFile } from './useUploadAudioFile';

type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;

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
  uploadAudioFile: ReturnType<typeof useUploadAudioFile>;
}

export const AudioFileUpload: FC<AudioFileUploadProps> = ({
  name,
  uploadAudioFile,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { start, pause, resume, abort, state } = uploadAudioFile;

  useEffect(() => {
    if (state?.status === 'done') {
      setFileState(state.file);

      // Wait a bit to make sure the fetcher is not triggered before the
      // file upload state is updated.
      setTimeout(() => {
        setFileId(state.file.id);
      }, 100);
    }
  }, [setFileId, state]);

  const onUploadClick = () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) return;

    const file = fileInput.files[0]!;
    fileInput.value = '';
    setFileName(file.name);

    start(file);
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
        {state === undefined ? (
          <>
            <input type="file" ref={fileInputRef} accept="audio/*" />{' '}
            <button type="button" onClick={onUploadClick}>
              Upload
            </button>
          </>
        ) : state.status === 'in progress' ? (
          <>
            Uploading… <progress value={state.progress} /> {fileName}{' '}
            <button type="button" onClick={pause}>
              Pause
            </button>{' '}
            <button type="button" onClick={abort}>
              Cancel
            </button>
          </>
        ) : state.status === 'paused' ? (
          <>
            Paused <progress value={state.progress} /> {fileName}{' '}
            <button type="button" onClick={resume}>
              Resume
            </button>{' '}
            <button type="button" onClick={abort}>
              Cancel
            </button>
          </>
        ) : state.status === 'error' ? (
          <>Error while uploading file</>
        ) : file ? (
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
        )}
      </p>
    </>
  );
};
