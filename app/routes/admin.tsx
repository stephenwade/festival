import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';

import adminStylesUrl from '~/styles/admin.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: adminStylesUrl },
];

export const meta: MetaFunction = () => {
  return {
    title: 'Festival admin',
  };
};

const Admin: FC = () => {
  return (
    <>
      <h1>Festival admin</h1>
      <Outlet />
    </>
  );
};

export default Admin;
