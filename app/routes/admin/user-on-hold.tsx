import type { LoaderFunction } from '@remix-run/node';

import { redirectToLogin } from '~/auth/redirect-to-login.server';

export const loader = (async (args) => {
  await redirectToLogin(args, { onHoldPage: true });

  return null;
}) satisfies LoaderFunction;

export default function UserOnHold() {
  return (
    <>
      <h2>On hold</h2>
      <p>Ask an admin to add your email address to the allowlist.</p>
    </>
  );
}
