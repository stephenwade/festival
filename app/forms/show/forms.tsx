import { Link } from '@remix-run/react';
import type { FC } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import { Input } from '~/components/admin/Input';
import { useOrigin } from '~/hooks/useOrigin';

import type { schema } from './validators';
import { clientValidator } from './validators';

type ShowFormProps = {
  defaultValues?: z.infer<typeof schema>;
  cancelLinkTo: string;
  submitButtonText: string;
};

const ShowForm: FC<ShowFormProps> = ({
  defaultValues,
  cancelLinkTo,
  submitButtonText,
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
      <p>
        <Link to={cancelLinkTo}>Cancel</Link>{' '}
        <button type="submit" className="button">
          {submitButtonText}
        </button>
      </p>
    </ValidatedForm>
  );
};

export const NewShowForm: FC = () => (
  <ShowForm cancelLinkTo="/admin/shows" submitButtonText="Add" />
);

type EditShowFormProps = {
  showId: string;
} & Required<Pick<ShowFormProps, 'defaultValues'>>;

export const EditShowForm: FC<EditShowFormProps> = ({
  defaultValues,
  showId,
}) => (
  <ShowForm
    defaultValues={defaultValues}
    cancelLinkTo={`/admin/shows/${showId}`}
    submitButtonText="Save"
  />
);
