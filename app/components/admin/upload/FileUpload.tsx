import { useField } from '@rvf/remix';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useRef, useState } from 'react';

import {
  UPLOAD_FILE_CONTENT_TYPE_KEY,
  UPLOAD_FILE_NAME_KEY,
} from '../../../forms/upload-file';
import type { RouterOutput } from '../../../trpc';
import { useTRPC } from '../../../trpc';
import { xhrPromise } from './xhrPromise';

interface FileUploadProps {
  name: string;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
}

export const FileUpload: FC<FileUploadProps> = ({
  name,
  isUploading,
  setIsUploading,
}) => {
  const trpc = useTRPC();

  const field = useField<string | undefined>(name);
  const fileId = field.value();

  const [fileState, setFileState] =
    useState<RouterOutput['admin']['getImageFile']>();

  const createFileUpload = useMutation(
    trpc.admin.createFileUpload.mutationOptions(),
  );

  const { data: fetchedData } = useQuery(
    trpc.admin.getImageFile.queryOptions(
      { id: fileId ?? '' },
      // Only use query if needed.
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
    form.append(UPLOAD_FILE_NAME_KEY, file.name);
    form.append(UPLOAD_FILE_CONTENT_TYPE_KEY, file.type);

    const { file: newFile, uploadUrl } =
      await createFileUpload.mutateAsync(form);
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
      })
      .catch((error: unknown) => {
        console.error(`File upload ${name} failed.`, error);
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
            <>
              URL: <a href={file.url}>{file.name}</a>{' '}
              <button type="button" onClick={onRemoveFileClick}>
                Remove file
              </button>
            </>
          ) : (
            'Loading…'
          )
        ) : (
          <>
            <input type="file" ref={fileInputRef} accept="image/*" />{' '}
            <button type="button" onClick={() => void onUploadClick()}>
              Upload
            </button>
          </>
        )}
      </p>
    </>
  );
};
