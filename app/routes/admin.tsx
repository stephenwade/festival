import { UserButton } from '@clerk/clerk-react';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

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
