import { UserButton } from '@clerk/remix';
import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';

import adminStylesUrl from '~/styles/admin.css';

export const meta: MetaFunction = () => [{ title: 'Festival admin' }];

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: adminStylesUrl },
];

const Admin: FC = () => {
  return (
    <>
      <h1>Festival admin</h1>
      <UserButton />
      <Outlet />
    </>
  );
};

export default Admin;
