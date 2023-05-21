import type { Show } from '@prisma/client';
import { Link } from '@remix-run/react';
import type { FC } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import { Input } from '~/components/admin/Input';
import { SubmitButton } from '~/components/admin/SubmitButton';
import { useOrigin } from '~/hooks/useOrigin';

import type { schema } from './validators';
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

  return (
    <ValidatedForm
      validator={clientValidator}
      defaultValues={defaultValues}
      method="post"
    >
      <Input label="Name" name="name" />
      <Input label="URL" prefix={`${origin ?? ''}/`} name="id" />
      <Input label="Description" name="description" />
      <Input label="Start date" name="startDate" />
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
