import { SignUp } from '@clerk/react';

import { Spinner } from '../components/Spinner';
import adminCssHref from '../styles/admin.css?url';
import { AdminAuthPageGuard } from './auth-route-guards';

export default function SignUpRoute() {
  return (
    <AdminAuthPageGuard>
      <title>Sign up | Festival admin</title>
      <link rel="stylesheet" precedence="any" href={adminCssHref} />
      <h2>Sign up</h2>
      <SignUp
        routing="path"
        path="/admin/sign-up"
        signInUrl="/admin/sign-in"
        fallback={<Spinner />}
      />
    </AdminAuthPageGuard>
  );
}
