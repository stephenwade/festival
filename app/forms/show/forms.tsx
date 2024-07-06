import type { Show } from '@prisma/client';
import { Form, useNavigate, useNavigation } from '@remix-run/react';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  useControlField,
  useField,
  useFieldArray,
  ValidatedForm,
} from 'remix-validated-form';
import { Temporal } from 'temporal-polyfill';
import { useCounter } from 'usehooks-ts';
import type { z } from 'zod';

import { AudioFileUpload } from '~/components/admin/AudioFileUpload';
import { FileUpload } from '~/components/admin/FileUpload';
import { Input } from '~/components/admin/Input';
import { InputTimeZone } from '~/components/admin/InputTimeZone';
import { SaveButton } from '~/components/admin/SaveButton';
import { useOrigin } from '~/hooks/useOrigin';

import type { schema, setSchema } from './validator';
import { clientValidator } from './validator';

const SHOW_FORM_ID = 'show-form';

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
        if (isUploading) onIsUploadingChanged(false);
      };
    }
  }, [isUploading, onIsUploadingChanged]);

  const { getInputProps } = useField(`${name}.id`);
  const [id] = useControlField<z.infer<typeof setSchema>['id']>(`${name}.id`);

  return (
    <fieldset>
      <legend>Set</legend>
      <input {...getInputProps({ type: 'hidden', value: id })} />
      <Input label="Artist" name={`${name}.artist`} />
      <Input label="Offset" name={`${name}.offset`} />
      <AudioFileUpload
        name={`${name}.audioFileId`}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />
      <button type="button" onClick={() => remove()} disabled={isUploading}>
        Remove set
      </button>
    </fieldset>
  );
};

interface ShowFormProps {
  defaultValues?: Partial<z.infer<typeof schema>>;
  cancelLinkTo: string;
  showDeleteButton?: boolean;
}

const ShowForm: FC<ShowFormProps> = ({
  defaultValues,
  cancelLinkTo,
  showDeleteButton,
}) => {
  const origin = useOrigin();
  const navigate = useNavigate();

  const navigation = useNavigation();
  const isDeleting =
    navigation.state === 'submitting' && navigation.formMethod === 'DELETE';

  const {
    count: countUploading,
    increment: incUploading,
    decrement: decUploading,
  } = useCounter();

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);

  const saveDisabled = countUploading > 0;

  const onIsUploadingChanged = useCallback(
    (isUploading: boolean) => {
      if (isUploading) incUploading();
      else decUploading();
    },
    [incUploading, decUploading],
  );

  const [sets, { push, remove }] = useFieldArray<z.infer<typeof setSchema>>(
    'sets',
    { formId: SHOW_FORM_ID },
  );

  return (
    <>
      <ValidatedForm
        id={SHOW_FORM_ID}
        validator={clientValidator}
        defaultValues={defaultValues}
        method="post"
      >
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
        {sets.map((set, index) => (
          <SetForm
            key={set.key}
            name={`sets[${index}]`}
            remove={() => remove(index)}
            onIsUploadingChanged={onIsUploadingChanged}
          />
        ))}
        <p>
          <button
            type="button"
            onClick={() => push({ id: crypto.randomUUID() })}
          >
            Add set
          </button>
        </p>
        <p>
          <button
            type="button"
            onClick={() => navigate(cancelLinkTo)}
            disabled={saveDisabled}
          >
            Cancel
          </button>{' '}
          <SaveButton disabled={saveDisabled} />
        </p>
      </ValidatedForm>
      {showDeleteButton ? (
        <Form method="delete">
          <p>
            <button disabled={isDeleting}>
              {isDeleting ? 'Deleting show…' : 'Delete show'}
            </button>
          </p>
        </Form>
      ) : null}
    </>
  );
};

export const NewShowForm: FC = () => (
  <ShowForm
    defaultValues={{
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
    showDeleteButton
  />
);
