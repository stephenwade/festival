import type { LoaderFunction } from '@remix-run/node';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { redirectToLogin } from '../auth/redirect-to-login.server';
import { NewShowForm } from '../forms/show';

export const loader = (async (args) => {
  await redirectToLogin(args);

  return null;
}) satisfies LoaderFunction;

const NewShow: FC = () => {
  return (
    <>
      <Helmet>
        <title>New show | Festival admin</title>
      </Helmet>
      <h3>New show</h3>
      <NewShowForm />
    </>
  );
};

export default NewShow;
