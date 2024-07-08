import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { FC } from 'react';
import { validationError } from 'remix-validated-form';
import { Temporal, toTemporalInstant } from 'temporal-polyfill';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { cache, INDEX_SHOW_SLUG_KEY } from '~/cache.server/cache';
import { db } from '~/db.server/db';
import { EditShowForm } from '~/forms/show/forms';
import { makeServerValidator } from '~/forms/show/schema.server';
import { replaceNullsWithUndefined } from '~/forms/utils/replaceNullsWithUndefined';
import { replaceUndefinedsWithNull } from '~/forms/utils/replaceUndefinedsWithNull';
import { isDefined } from '~/utils/is-defined';
import { omit } from '~/utils/omit';
import { notFound } from '~/utils/responses.server';

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

  const startDate = show.startDate
    ? toTemporalInstant
        .call(show.startDate)
        .toZonedDateTimeISO(show.timeZone)
        .toPlainDateTime()
        .toString({ smallestUnit: 'second' })
    : null;

  return json(replaceNullsWithUndefined({ ...show, startDate }));
}) satisfies LoaderFunction;

export const action = (async (args) => {
  await redirectToLogin(args);

  console.log('Editing show', { method: args.request.method });

  const id = args.params.show!;

  if (args.request.method === 'DELETE') {
    await db.show.delete({ where: { id } });

    return redirect('/admin/shows');
  }

  const show = await db.show.findUniqueOrThrow({ where: { id } });

  const validator = makeServerValidator({ previousSlug: show.slug });

  const form = await args.request.formData();
  const { data, error } = await validator.validate(form);
  if (error) return validationError(error);

  const { sets, ...rest } = replaceUndefinedsWithNull(data);

  const startDate = rest.startDate
    ? new Date(
        Temporal.PlainDateTime.from(rest.startDate).toZonedDateTime(
          rest.timeZone,
        ).epochMilliseconds,
      )
    : null;

  await db.show.update({
    where: { id },
    data: {
      ...rest,
      startDate,
      sets: {
        deleteMany: {
          id: { notIn: sets.map((set) => set.id).filter(isDefined) },
        },
        update: sets
          .filter((set) => isDefined(set.id))
          .map((set) => ({
            where: { id: set.id! },
            data: omit(set, ['id']),
          })),
        create: sets
          .filter((set) => !isDefined(set.id))
          .map((set) => omit(set, ['id'])),
      },
    },
  });

  cache.del(INDEX_SHOW_SLUG_KEY);

  return redirect(`/admin/shows/${id}`);
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
