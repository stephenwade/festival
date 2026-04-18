import { SignIn } from '@clerk/react';

import { Spinner } from '../components/Spinner';
import adminCssHref from '../styles/admin.css?url';
import { AdminAuthPageGuard } from './auth-route-guards';

export default function SignInRoute() {
  return (
    <AdminAuthPageGuard>
      <title>Sign in | Festival admin</title>
      <link rel="stylesheet" precedence="any" href={adminCssHref} />
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
