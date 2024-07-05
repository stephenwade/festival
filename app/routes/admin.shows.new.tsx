import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type { FC } from 'react';
import { validationError } from 'remix-validated-form';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { cache, INDEX_SHOW_SLUG_KEY } from '~/cache.server/cache';
import { db } from '~/db.server/db';
import { NewShowForm } from '~/forms/show/forms';
import { makeServerValidator } from '~/forms/show/validator.server';

export const meta: MetaFunction = () => [
  { title: 'New show | Festival admin' },
];

export const action = (async (args) => {
  await redirectToLogin(args);

  console.log('Creating new show');

  const validator = makeServerValidator();

  const form = await args.request.formData();
  const { data, error } = await validator.validate(form);
  if (error) return validationError(error);

  const { sets, ...rest } = data;

  const show = await db.show.create({
    data: {
      ...rest,
      sets: { create: sets },
    },
  });

  cache.del(INDEX_SHOW_SLUG_KEY);

  return redirect(`/admin/shows/${show.id}`);
}) satisfies ActionFunction;

export const loader = (async (args) => {
  await redirectToLogin(args);

  return null;
}) satisfies LoaderFunction;

const NewShow: FC = () => {
  return (
    <>
      <h3>New show</h3>
      <NewShowForm />
    </>
  );
};

export default NewShow;
