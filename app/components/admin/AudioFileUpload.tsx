import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useControlField, useField } from 'remix-validated-form';

import { useSse } from '~/hooks/useSse';
import type { loader as audioUploadLoader } from '~/routes/admin.audio-upload.$id';
import type { AudioFileProcessingEvent } from '~/sse.server/audio-file-events';

import { AudioFileUploader } from './AudioFileUploader';

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
  const [uploadProgress, setUploadProgress] = useState<number | undefined>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onUploadClick = () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) return;

    const file = fileInput.files[0]!;
    fileInput.value = '';
    setIsUploading(true);
    setFileName(file.name);
    setUploadProgress(undefined);

    const uploader = new AudioFileUploader(file, {
      onProgress: ({ progress }) => {
        setUploadProgress(progress);
      },
      onFinish: ({ file }) => {
        setFileState(file);

        // Wait a bit to make sure the fetcher is not triggered before the
        // file upload state is updated.
        setTimeout(() => {
          setFileId(file.id);
          setIsUploading(false);
        }, 100);
      },
      onError: () => {
        console.error(`Audio file upload ${name} failed.`);
      },
    });
    uploader.start();
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
