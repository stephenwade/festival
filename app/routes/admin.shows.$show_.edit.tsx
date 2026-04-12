import type { LoaderFunction } from '@remix-run/node';
import { useParams } from '@remix-run/react';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { redirectToLogin } from '../auth/redirect-to-login.server';
import { EditShowForm } from '../forms/show';
import { useTRPC } from '../trpc';

export const loader = (async (args) => {
  await redirectToLogin(args);

  return null;
}) satisfies LoaderFunction;

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
