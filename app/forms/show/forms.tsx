import type { Show } from '@prisma/client';
import { Link } from '@remix-run/react';
import type { FC } from 'react';
import { useFieldArray, ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import { Input } from '~/components/admin/Input';
import { SubmitButton } from '~/components/admin/SubmitButton';
import { useOrigin } from '~/hooks/useOrigin';

import type { schema, setSchema } from './validators';
import { clientValidator } from './validators';

type ShowFormProps = {
  defaultValues?: z.infer<typeof schema>;
  cancelLinkTo: string;
  submitButtonText: string;
  submitButtonTextSubmitting: string;
};

const ShowForm: FC<ShowFormProps> = ({
  defaultValues,
  cancelLinkTo,
  submitButtonText,
  submitButtonTextSubmitting,
}) => {
  const origin = useOrigin();

  const [sets, { push, remove }] = useFieldArray<z.infer<typeof setSchema>>(
    'sets',
    { formId: 'show-form' }
  );

  return (
    <ValidatedForm
      id="show-form"
      validator={clientValidator}
      defaultValues={defaultValues}
      method="post"
    >
      <Input label="Name" name="name" />
      <Input label="URL" prefix={`${origin ?? ''}/`} name="id" />
      <Input label="Description" name="description" />
      <Input label="Start date" name="startDate" />
      <h4>Sets</h4>
      {sets.map((set, index) => (
        <fieldset key={set.id}>
          <legend>Set</legend>
          <input type="hidden" name={`sets[${index}].id`} value={set.id} />
          <Input label="Artist" name={`sets[${index}].artist`} />
          <Input label="Offset" name={`sets[${index}].offset`} />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </fieldset>
      ))}
      <p>
        <button type="button" onClick={() => push({ id: crypto.randomUUID() })}>
          Add set
        </button>
      </p>
      <p>
        <Link to={cancelLinkTo}>Cancel</Link>{' '}
        <SubmitButton
          text={submitButtonText}
          textSubmitting={submitButtonTextSubmitting}
        />
      </p>
    </ValidatedForm>
  );
};

export const NewShowForm: FC = () => (
  <ShowForm
    cancelLinkTo="/admin/shows"
    submitButtonText="Add"
    submitButtonTextSubmitting="Adding…"
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
    submitButtonText="Save"
    submitButtonTextSubmitting="Saving…"
  />
);
