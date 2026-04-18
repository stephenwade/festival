import { UserButton } from '@clerk/react';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

import adminCssHref from '../styles/admin.css?url';

const Admin: FC = () => {
  return (
    <>
      <link rel="stylesheet" precedence="any" href={adminCssHref} />
      <h1>Festival admin</h1>
      <UserButton />
      <Outlet />
    </>
  );
};

export default Admin;
