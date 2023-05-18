import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { FC } from 'react';
import { validationError } from 'remix-validated-form';

import { db } from '~/db/db.server';
import { EditShowForm, makeServerValidator } from '~/forms/show';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async ({ params }) => {
  const id = params.show as string;

  const show = await db.show.findUnique({ where: { id } });
  if (!show) throw notFound();

  return json(show);
}) satisfies LoaderFunction;

export const meta: MetaFunction = () => {
  return {
    title: 'Edit show | Festival admin',
  };
};

export const action: ActionFunction = async ({ params, request }) => {
  const previousId = params.show as string;
  const validator = makeServerValidator({ previousId });

  const form = await request.formData();
  const { data, error } = await validator.validate(form);
  if (error) return validationError(error);

  await db.show.update({
    where: { id: previousId },
    data,
  });
  return redirect(`/admin/shows/${data.id}`);
};

const EditShow: FC = () => {
  const show = useLoaderData<typeof loader>();

  return (
    <>
      <h3>Edit show</h3>
      <EditShowForm defaultValues={show} showId={show.id} />
    </>
  );
};

export default EditShow;
