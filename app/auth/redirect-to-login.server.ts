import { createClerkClient } from '@clerk/remix/api.server';
import { getAuth } from '@clerk/remix/ssr.server';
import { type DataFunctionArgs, redirect } from '@remix-run/node';

import { userIsAllowed } from './user-is-allowed.server';

type RedirectToLoginArgs = {
  onHoldPage?: boolean;
};

export async function redirectToLogin(
  args: DataFunctionArgs,
  { onHoldPage }: RedirectToLoginArgs = {},
) {
  const { userId } = await getAuth(args);

  if (!userId) {
    throw redirect(`/admin/sign-in?redirect_url=${args.request.url}`);
  }

  const user = await createClerkClient({
    apiKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);

  const allowed = await userIsAllowed(user);
  if (!allowed && !onHoldPage) {
    throw redirect('/admin/user-on-hold');
  }
  if (allowed && onHoldPage) {
    throw redirect('/admin');
  }
}
