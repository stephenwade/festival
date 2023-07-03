import type { LoaderFunction, V2_MetaFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';

import { redirectToLogin } from '~/auth/redirect-to-login.server';

export const meta: V2_MetaFunction = () => [
  { title: 'Shows | Festival admin' },
];

export const loader = (async (args) => {
  await redirectToLogin(args);

  return null;
}) satisfies LoaderFunction;

const Shows: FC = () => {
  return (
    <>
      <h2>Shows</h2>
      <Outlet />
    </>
  );
};

export default Shows;
