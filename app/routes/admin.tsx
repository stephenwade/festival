import '~/styles/admin.css';

import { UserButton } from '@clerk/remix';
import type { MetaFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';

export const meta: MetaFunction = () => [{ title: 'Festival admin' }];

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
