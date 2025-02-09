import type { useLoaderData } from '@remix-run/react';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useControlField, useField } from 'remix-validated-form';

import {
  UPLOAD_AUDIO_CONTENT_TYPE_KEY,
  UPLOAD_AUDIO_NAME_KEY,
} from '~/forms/upload-audio';
import { useSse } from '~/hooks/useSse';
import type { loader as audioUploadLoader } from '~/routes/admin.audio-upload.$id';
import type { action as newAudioUploadAction } from '~/routes/admin.audio-upload.new';
import type { AudioFileProcessingEvent } from '~/sse.server/audio-file-events';

import { xhrPromise } from './xhrPromise';

type UploadResponse = SerializeFrom<typeof newAudioUploadAction>;

type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;

function displayConversionStatus(
  status: Exclude<AudioFileProcessingEvent['conversionStatus'], 'DONE'>,
) {
  switch (status) {
    case 'USER_UPLOAD':
      return 'Uploading…';
    case 'CHECKING':
      return 'Checking…';
    case 'CONVERTING':
      return 'Converting…';
    case 'RE_UPLOAD':
      return 'Converting…';
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
  const onUploadClick = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) return;

    const file = fileInput.files[0]!;
    fileInput.value = '';
    setIsUploading(true);
    setFileName(file.name);
    setUploadProgress(0);

    const form = new FormData();
    form.append(UPLOAD_AUDIO_NAME_KEY, file.name);
    form.append(UPLOAD_AUDIO_CONTENT_TYPE_KEY, file.type);

    const newFileResponse = await fetch('/admin/audio-upload/new', {
      method: 'POST',
      body: form,
    });
    const { file: newFile, uploadUrl } =
      (await newFileResponse.json()) as UploadResponse;
    setFileState(newFile);
    // Wait a bit to make sure the fetcher is not triggered before the
    // file upload state is updated.
    setTimeout(() => {
      setFileId(newFile.id);
    }, 100);

    xhrPromise(file, {
      url: uploadUrl,
      onProgress: setUploadProgress,
      errorOnBadStatus: true,
    })
      .then(() => {
        setIsUploading(false);
        void fetch(`/admin/audio-upload/${newFile.id}/process`, {
          method: 'POST',
        });
      })
      .catch((error: unknown) => {
        console.error(`Audio file upload ${name} failed.`, error);
      });
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
            <button type="button" onClick={() => void onUploadClick()}>
              Upload
            </button>
          </>
        )}
      </p>
    </>
  );
};
