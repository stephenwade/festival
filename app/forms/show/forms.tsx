import type { Show } from '@prisma/client';
import { Form, useNavigate, useNavigation } from '@remix-run/react';
import type { FC } from 'react';
import { useState } from 'react';
import {
  useControlField,
  useField,
  useFieldArray,
  ValidatedForm,
} from 'remix-validated-form';
import { Temporal } from 'temporal-polyfill';
import type { z } from 'zod';

import { Input } from '~/components/admin/Input';
import { InputTimeZone } from '~/components/admin/InputTimeZone';
import { SaveButton } from '~/components/admin/SaveButton';
import { AudioFileUpload } from '~/components/admin/upload/AudioFileUpload';
import { FileUpload } from '~/components/admin/upload/FileUpload';
import {
  isIdle,
  useUploadAudioFile,
  useUploadStates,
} from '~/components/admin/upload/useUploadAudioFile';
import { useOrigin } from '~/hooks/useOrigin';

import type { schema, setSchema } from './schema';
import { clientValidator } from './schema';

const SHOW_FORM_ID = 'show-form';

interface SetFormProps {
  name: string;
  remove: () => void;
}

const SetForm: FC<SetFormProps> = ({ name, remove }) => {
  const { getInputProps } = useField(`${name}.id`);
  const [id] = useControlField<z.infer<typeof setSchema>['id']>(`${name}.id`);

  const uploadAudioFile = useUploadAudioFile();
  const { state } = uploadAudioFile;

  return (
    <fieldset>
      <legend>Set</legend>
      <input {...getInputProps({ type: 'hidden', value: id })} />
      <Input label="Artist" name={`${name}.artist`} />
      <Input label="Offset" name={`${name}.offset`} />
      <AudioFileUpload
        name={`${name}.audioFileId`}
        uploadAudioFile={uploadAudioFile}
      />
      <button
        type="button"
        onClick={() => {
          remove();
        }}
        disabled={state ? !isIdle(state) : false}
      >
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

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);

  const uploadStates = useUploadStates();
  const saveDisabled = Object.values(uploadStates).some(
    (state) => !isIdle(state),
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
            remove={() => {
              remove(index);
            }}
          />
        ))}
        <p>
          <button
            type="button"
            onClick={() => {
              push({});
            }}
          >
            Add set
          </button>
        </p>
        <p>
          <button
            type="button"
            onClick={() => {
              navigate(cancelLinkTo);
            }}
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
