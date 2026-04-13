import { useField } from '@rvf/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import type { FC } from 'react';
import { useRef, useState } from 'react';

import {
  UPLOAD_AUDIO_CONTENT_TYPE_KEY,
  UPLOAD_AUDIO_NAME_KEY,
} from '../../../forms/upload-audio';
import type { RouterOutput } from '../../../trpc';
import { useTRPC } from '../../../trpc';
import { xhrPromise } from './xhrPromise';

function displayConversionStatus(
  status: Exclude<
    RouterOutput['admin']['getAudioFile']['conversionStatus'],
    'DONE'
  >,
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

  const field = useField<string | undefined>(name);
  const fileId = field.value();

  const [fileState, setFileState] =
    useState<RouterOutput['admin']['getAudioFile']>();

  const createAudioFileUpload = useMutation(
    trpc.admin.createAudioFileUpload.mutationOptions(),
  );
  const processAudioFile = useMutation(
    trpc.admin.processAudioFile.mutationOptions(),
  );

  useSubscription(
    trpc.admin.audioFileProcessingUpdates.subscriptionOptions(
      { id: fileId ?? '' },
      {
        enabled: Boolean(fileId),
        onData: (data) => {
          setFileState(data);
        },
      },
    ),
  );

  // Only use query if needed. Further data will be fetched from the SSE.
  const queryEnabled = Boolean(fileId) && !fileState;
  const { data: fetchedData, error: fetchedDataError } = useQuery(
    trpc.admin.getAudioFile.queryOptions(
      { id: fileId ?? '' },
      { enabled: queryEnabled, staleTime: Infinity },
    ),
  );

  if (queryEnabled && fetchedDataError) {
    throw fetchedDataError;
  }

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

    const { file: newFile, uploadUrl } =
      await createAudioFileUpload.mutateAsync(form);
    setFileState(newFile);
    // Wait a bit to make sure the query is not triggered before the
    // file upload state is updated.
    setTimeout(() => {
      field.setValue(newFile.id);
    }, 100);

    xhrPromise(file, {
      url: uploadUrl,
      onProgress: setUploadProgress,
      errorOnBadStatus: true,
    })
      .then(() => {
        setIsUploading(false);
        void processAudioFile.mutateAsync({ id: newFile.id });
      })
      .catch((error: unknown) => {
        console.error(`Audio file upload ${name} failed.`, error);
      });
  };

  const onRemoveFileClick = () => {
    field.setValue(undefined);
    setFileState(undefined);
  };

  return (
    <>
      <input
        {...field.getInputProps({
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
