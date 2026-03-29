import type { LoaderFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { redirectToLogin } from '../auth/redirect-to-login.server';

export const loader = (async (args) => {
  await redirectToLogin(args);

  return null;
}) satisfies LoaderFunction;

const Shows: FC = () => {
  return (
    <>
      <Helmet>
        <title>Shows | Festival admin</title>
      </Helmet>
      <h2>Shows</h2>
      <Outlet />
    </>
  );
};

export default Shows;
