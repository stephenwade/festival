import type { useLoaderData } from '@remix-run/react';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useControlField, useField } from 'remix-validated-form';

import {
  UPLOAD_AUDIO_CONTENT_TYPE_KEY,
  UPLOAD_AUDIO_NAME_KEY,
} from '../../../forms/upload-audio';
import { useSse } from '../../../hooks/useSse';
import type { action as newAudioUploadAction } from '../../../routes/admin.audio-upload.new';
import type { AudioFileProcessingEvent } from '../../../sse.server/audio-file-events';
import type { RouterOutput } from '../../../trpc';
import { useTRPC } from '../../../trpc';
import { xhrPromise } from './xhrPromise';

type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;

type UploadResponse = SerializeFrom<typeof newAudioUploadAction>;

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
  const trpc = useTRPC();

  const { getInputProps } = useField(name);
  const [fileId, setFileId] = useControlField<string | undefined>(name);

  const [fileState, setFileState] =
    useState<SerializeFrom<RouterOutput['admin']['getAudioFile']>>();

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

  const { data: fetchedData } = useQuery(
    trpc.admin.getAudioFile.queryOptions(
      { id: fileId ?? '' },
      // Only use query if needed. Further data will be fetched from the SSE.
      { enabled: Boolean(fileId) && !fileState, staleTime: Infinity },
    ),
  );

  const file = fileState ?? fetchedData;

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
    // Wait a bit to make sure the query is not triggered before the
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
