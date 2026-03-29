import { UserButton } from '@clerk/remix';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import adminCssHref from '../styles/admin.css?url';

const Admin: FC = () => {
  return (
    <>
      <Helmet>
        <title>Festival admin</title>
        <link rel="stylesheet" href={adminCssHref} />
      </Helmet>
      <h1>Festival admin</h1>
      <UserButton />
      <Outlet />
    </>
  );
};

export default Admin;
