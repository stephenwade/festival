import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useControlField, useField } from 'remix-validated-form';

import { UPLOAD_FILE_FORM_KEY } from '~/forms/upload-file';
import type { loader as fileUploadLoader } from '~/routes/admin.file-upload.$id';
import type { action as newFileUploadAction } from '~/routes/admin.file-upload.new';

import { xhrPromise } from './xhrPromise';

type UploadResponse = SerializeFrom<typeof newFileUploadAction>;

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
  const { getInputProps } = useField(name);
  const [fileId, setFileId] = useControlField<string | undefined>(name);

  const [fileState, setFileState] =
    useState<SerializeFrom<typeof fileUploadLoader>>();

  const fetcher = useFetcher<typeof fileUploadLoader>();
  useEffect(() => {
    if (!fileId || fetcher.data || fetcher.state === 'loading' || fileState) {
      return;
    }

    // Only use fetcher if needed.
    fetcher.load(`/admin/file-upload/${fileId}`);
  }, [fetcher, fileId, fileState]);

  const file = fileState ?? fetcher.data;

  const [fileName, setFileName] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onUploadClick = () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) return;

    const file = fileInput.files[0]!;
    fileInput.value = '';
    setIsUploading(true);
    setFileName(file.name);
    setUploadProgress(0);

    const form = new FormData();
    form.append(UPLOAD_FILE_FORM_KEY, file);
    xhrPromise(form, {
      url: '/admin/file-upload/new',
      onProgress: setUploadProgress,
      errorOnBadStatus: true,
    })
      .then((response) => {
        const file = JSON.parse(response.responseText) as UploadResponse;

        setFileState(file);

        // Wait a bit to make sure the fetcher is not triggered before the
        // file upload state is updated.
        setTimeout(() => {
          setFileId(file.id);
          setIsUploading(false);
        }, 100);
      })
      .catch((error: unknown) => {
        console.error(`File upload ${name} failed.`, error);
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
            <button type="button" onClick={onUploadClick}>
              Upload
            </button>
          </>
        )}
      </p>
    </>
  );
};
