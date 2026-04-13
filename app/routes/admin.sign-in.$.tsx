import { SignIn } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';

import { Spinner } from '../components/Spinner';
import adminCssHref from '../styles/admin.css?url';
import { AdminAuthPageGuard } from './auth-route-guards';

export default function SignInRoute() {
  return (
    <AdminAuthPageGuard>
      <Helmet>
        <title>Sign in | Festival admin</title>
        <link rel="stylesheet" href={adminCssHref} />
      </Helmet>
      <h2>Sign in</h2>
      <SignIn
        routing="path"
        path="/admin/sign-in"
        signUpUrl="/admin/sign-up"
        fallback={<Spinner />}
      />
    </AdminAuthPageGuard>
  );
}
