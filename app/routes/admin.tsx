import '../styles/admin.css';

import { UserButton } from '@clerk/remix';
import { Outlet } from '@remix-run/react';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

const Admin: FC = () => {
  return (
    <>
      <Helmet>
        <title>Festival admin</title>
      </Helmet>
      <h1>Festival admin</h1>
      <UserButton />
      <Outlet />
    </>
  );
};

export default Admin;
