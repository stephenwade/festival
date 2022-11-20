import type { ActionFunction, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type { FC } from 'react';
import { validationError } from 'remix-validated-form';

import { db } from '~/db/db.server';
import { makeServerValidator, NewShowForm } from '~/forms/show';

export const meta: MetaFunction = () => {
  return {
    title: 'New show | Festival admin',
  };
};

export const action: ActionFunction = async ({ request }) => {
  const validator = makeServerValidator();

  const form = await request.formData();
  const { data, error } = await validator.validate(form);
  if (error) return validationError(error);

  const show = await db.show.create({ data });
  return redirect(`/admin/shows/${show.id}`);
};

const NewShow: FC = () => {
  return (
    <>
      <h3>New show</h3>
      <NewShowForm />
    </>
  );
};

export default NewShow;
