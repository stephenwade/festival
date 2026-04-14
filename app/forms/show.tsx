import type { Show } from '@prisma/client';
import { withStandardSchema } from '@rvf/core';
import type { FieldErrors } from '@rvf/react';
import { FormProvider, useField, useFieldArray, useForm } from '@rvf/react';
import { useMutation } from '@tanstack/react-query';
import { TRPCClientError } from '@trpc/client';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Temporal } from 'temporal-polyfill';
import { useCounter } from 'usehooks-ts';
import type { z } from 'zod';

import type { AppRouter } from '../../server/routers/index';
import type { setSchema } from '../../shared/schemas/show';
import { schema as showSchema } from '../../shared/schemas/show';
import { Input } from '../components/admin/Input';
import { InputTimeZone } from '../components/admin/InputTimeZone';
import { AudioFileUpload } from '../components/admin/upload/AudioFileUpload';
import { FileUpload } from '../components/admin/upload/FileUpload';
import { useOrigin } from '../hooks/useOrigin';
import { useTRPC } from '../trpc';

interface SetFormProps {
  name: string;
  remove: () => void;

  /** Changes to this prop are ignored. */
  onIsUploadingChanged: (isUploading: boolean) => void;
}

const SetForm: FC<SetFormProps> = ({ name, remove, onIsUploadingChanged }) => {
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isUploading) {
      onIsUploadingChanged(isUploading);
      return () => {
        onIsUploadingChanged(false);
      };
    }
  }, [isUploading, onIsUploadingChanged]);

  const field = useField<z.infer<typeof setSchema>['id']>(`${name}.id`);
  const id = field.value();

  return (
    <fieldset>
      <legend>Set</legend>
      <input {...field.getInputProps({ type: 'hidden', value: id })} />
      <Input label="Artist" name={`${name}.artist`} />
      <Input label="Offset" name={`${name}.offset`} />
      <AudioFileUpload
        name={`${name}.audioFileId`}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />
      <button
        type="button"
        onClick={() => {
          remove();
        }}
        disabled={isUploading}
      >
        Remove set
      </button>
    </fieldset>
  );
};

interface ShowFormProps {
  defaultValues: z.infer<typeof showSchema>;
  cancelLinkTo: string;
  showId?: string;
  showDeleteButton?: boolean;
}

function getServerValidationErrors(error: unknown): FieldErrors | undefined {
  if (error instanceof TRPCClientError) {
    return (
      (error as TRPCClientError<AppRouter>).data?.rvfValidationErrors ??
      undefined
    );
  }
}

const ShowForm: FC<ShowFormProps> = ({
  defaultValues,
  cancelLinkTo,
  showId,
}) => {
  const origin = useOrigin();
  const navigate = useNavigate();
  const trpc = useTRPC();

  const createShow = useMutation(trpc.admin.createShow.mutationOptions());
  const updateShow = useMutation(trpc.admin.updateShow.mutationOptions());
  const deleteShow = useMutation(trpc.admin.deleteShow.mutationOptions());

  const savePending = createShow.isPending || updateShow.isPending;
  const deletePending = deleteShow.isPending;

  const {
    count: countUploading,
    increment: incUploading,
    decrement: decUploading,
  } = useCounter();

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] =
    useState<FieldErrors>();

  const buttonsDisabled = countUploading > 0 || savePending || deletePending;

  const onIsUploadingChanged = useCallback(
    (isUploading: boolean) => {
      if (isUploading) incUploading();
      else decUploading();
    },
    [incUploading, decUploading],
  );

  const form = useForm({
    validator: withStandardSchema(showSchema),
    defaultValues,
    serverValidationErrors,
    onBeforeSubmit: () => {
      if (serverValidationErrors) {
        setServerValidationErrors(undefined);
      }
    },
    handleSubmit: async (_data, formData) => {
      if (showId) {
        return await updateShow.mutateAsync(formData);
      }

      return await createShow.mutateAsync(formData);
    },
    onSubmitSuccess: ({ id }) => {
      void navigate(`/admin/shows/${id}`);
    },
    onSubmitFailure: (error) => {
      const nextServerValidationErrors = getServerValidationErrors(error);

      if (nextServerValidationErrors) {
        setServerValidationErrors(nextServerValidationErrors);
        return;
      }
    },
  });

  const sets = useFieldArray(form.scope('sets'));

  const onDeleteClick = async () => {
    if (!showId) return;

    await deleteShow.mutateAsync({ id: showId });
    void navigate('/admin/shows');
  };

  return (
    <FormProvider scope={form.scope()}>
      <form {...form.getFormProps()}>
        {showId ? <input type="hidden" name="id" value={showId} /> : null}
        <Input label="Name" name="name" />
        <Input label="URL" prefix={`${origin ?? ''}/`} name="slug" />
        <Input label="Description" name="description" />
        <Input
          label="Start date"
          name="startDate"
          type="datetime-local"
          step="1"
        />
        <InputTimeZone label="Time zone" name="timeZone" />
        Show logo:{' '}
        <FileUpload
          name="logoImageFileId"
          isUploading={isUploadingLogo}
          setIsUploading={setIsUploadingLogo}
        />
        Background image:{' '}
        <FileUpload
          name="backgroundImageFileId"
          isUploading={isUploadingBackground}
          setIsUploading={setIsUploadingBackground}
        />
        <Input label="Background color" type="color" name="backgroundColor" />
        <Input
          label="Background color at 75% L"
          type="color"
          name="backgroundColorSecondary"
        />
        <h4>Sets</h4>
        {sets.map((key, _form, index) => (
          <SetForm
            key={key}
            name={`sets[${index}]`}
            remove={() => {
              void sets.remove(index);
            }}
            onIsUploadingChanged={onIsUploadingChanged}
          />
        ))}
        <p>
          <button
            type="button"
            onClick={() => {
              void sets.push({});
            }}
          >
            Add set
          </button>
        </p>
        <p>
          <button
            type="button"
            onClick={() => {
              void navigate(cancelLinkTo);
            }}
            disabled={buttonsDisabled}
          >
            Cancel
          </button>{' '}
          <button type="submit" disabled={buttonsDisabled}>
            {savePending ? 'Saving…' : 'Save'}
          </button>
        </p>
      </form>
      {showId ? (
        <p>
          <button
            type="button"
            onClick={() => {
              void onDeleteClick();
            }}
            disabled={buttonsDisabled}
          >
            {deletePending ? 'Deleting show…' : 'Delete show'}
          </button>
        </p>
      ) : null}
    </FormProvider>
  );
};

export const NewShowForm: FC = () => (
  <ShowForm
    defaultValues={{
      name: '',
      slug: '',
      sets: [],
      timeZone: Temporal.Now.timeZoneId(),
    }}
    cancelLinkTo="/admin/shows"
  />
);

type EditShowFormProps = {
  showId: Show['id'];
} & Required<Pick<ShowFormProps, 'defaultValues'>>;

export const EditShowForm: FC<EditShowFormProps> = ({
  defaultValues,
  showId,
}) => (
  <ShowForm
    defaultValues={defaultValues}
    cancelLinkTo={`/admin/shows/${showId}`}
    showId={showId}
  />
);
