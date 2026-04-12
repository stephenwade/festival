import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useParams } from '@remix-run/react';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { validationError } from 'remix-validated-form';
import { Temporal } from 'temporal-polyfill';

import { cache, INDEX_SHOW_SLUG_KEY } from '../../server/util/cache';
import { redirectToLogin } from '../auth/redirect-to-login.server';
import { db } from '../db.server/db';
import { EditShowForm } from '../forms/show/forms';
import { makeServerValidator } from '../forms/show/schema.server';
import { replaceUndefinedsWithNull } from '../forms/utils/replaceUndefinedsWithNull';
import { useTRPC } from '../trpc';
import { isDefined } from '../utils/is-defined';
import { omit } from '../utils/omit';

export const loader = (async (args) => {
  await redirectToLogin(args);

  return null;
}) satisfies LoaderFunction;

export const action = (async (args) => {
  await redirectToLogin(args);

  console.log('Editing show', { method: args.request.method });

  const id = args.params.show!;

  if (args.request.method === 'DELETE') {
    await db.show.delete({ where: { id } });

    cache.del(INDEX_SHOW_SLUG_KEY);

    return redirect('/admin/shows');
  }

  const show = await db.show.findUniqueOrThrow({ where: { id } });

  const validator = makeServerValidator({ previousSlug: show.slug });

  const form = await args.request.formData();
  const { data, error } = await validator.validate(form);
  if (error) return validationError(error);

  const { startDate, sets, ...rest } = replaceUndefinedsWithNull(data);

  const startInstant = startDate
    ? Temporal.PlainDateTime.from(startDate)
        .toZonedDateTime(rest.timeZone)
        .toInstant()
    : undefined;

  await db.show.update({
    where: { id },
    data: {
      ...rest,
      startDate: startInstant?.toString(),
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
  const trpc = useTRPC();
  const id = useParams().show!;

  const { data: show } = useQuery(
    trpc.admin.getShowForEditing.queryOptions({ id }),
  );

  return (
    <>
      <Helmet>
        <title>Edit show | Festival admin</title>
      </Helmet>
      <h3>Edit show</h3>
      {show ? <EditShowForm defaultValues={show} showId={show.id} /> : null}
    </>
  );
};

export default EditShow;
