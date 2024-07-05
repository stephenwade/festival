import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { FC } from 'react';
import { validationError } from 'remix-validated-form';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { cache, INDEX_SHOW_ID_KEY } from '~/cache.server/cache';
import { db } from '~/db.server/db';
import { EditShowForm } from '~/forms/show/forms';
import { makeServerValidator } from '~/forms/show/validator.server';
import { replaceNullsWithUndefined } from '~/forms/utils/replaceNullsWithUndefined';
import { replaceUndefinedsWithNull } from '~/forms/utils/replaceUndefinedsWithNull';

const notFound = () => new Response('Not Found', { status: 404 });

export const meta: MetaFunction = () => [
  { title: 'Edit show | Festival admin' },
];

export const loader = (async (args) => {
  await redirectToLogin(args);

  const id = args.params.show!;

  const show = await db.show.findUnique({
    where: { id },
    include: {
      sets: {
        include: { audioFile: true },
        orderBy: { offset: 'asc' },
      },
    },
  });
  if (!show) throw notFound();

  return json(replaceNullsWithUndefined(show));
}) satisfies LoaderFunction;

export const action = (async (args) => {
  await redirectToLogin(args);

  console.log('Editing show', { method: args.request.method });

  const previousId = args.params.show!;

  if (args.request.method === 'DELETE') {
    await db.show.delete({ where: { id: previousId } });

    return redirect('/admin/shows');
  }

  const validator = makeServerValidator({ previousId });

  const form = await args.request.formData();
  const { data, error } = await validator.validate(form);
  if (error) return validationError(error);

  const { sets, ...rest } = replaceUndefinedsWithNull(data);

  await db.show.update({
    where: { id: previousId },
    data: {
      ...rest,
      sets: {
        deleteMany: {
          showId: previousId,
          id: { notIn: sets.map((set) => set.id) },
        },
        upsert: sets.map((set) => ({
          create: set,
          update: set,
          where: { id: set.id },
        })),
      },
    },
  });
  await Promise.all([
    db.set.deleteMany({
      where: {
        showId: rest.id,
        id: { notIn: sets.map((set) => set.id) },
      },
    }),
    sets.map((set) =>
      db.set.upsert({
        create: { ...set, showId: rest.id },
        update: set,
        where: { id: set.id },
      }),
    ),
  ]);

  cache.del(INDEX_SHOW_ID_KEY);

  return redirect(`/admin/shows/${data.id}`);
}) satisfies ActionFunction;

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
