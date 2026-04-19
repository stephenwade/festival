import { ClerkProvider, UserButton } from '@clerk/react';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

import adminCssHref from '../styles/admin.css?url';

const Admin: FC = () => {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY!}
      signInUrl="/admin/sign-in"
      signUpUrl="/admin/sign-up"
      signInFallbackRedirectUrl="/admin"
      signUpFallbackRedirectUrl="/admin"
      afterSignOutUrl="/admin"
    >
      <link rel="stylesheet" precedence="any" href={adminCssHref} />
      <h1>Festival admin</h1>
      <UserButton />
      <Outlet />
    </ClerkProvider>
  );
};

export default Admin;
