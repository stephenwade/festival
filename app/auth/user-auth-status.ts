import { createClerkClient } from '@clerk/remix/api.server';
import { getAuth } from '@clerk/remix/ssr.server';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

import { userIsAllowed } from './user-is-allowed.server';

export async function userAuthStatus(
  args: ActionFunctionArgs | LoaderFunctionArgs,
) {
  const { userId } = await getAuth(args);

  if (!userId) {
    console.log('User is not logged in');
    return 'unauthorized';
  }

  console.log(`User is logged in: ${userId}`);

  const user = await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);

  const allowed = await userIsAllowed(user);
  if (!allowed) {
    console.log('User is forbidden');
    return 'forbidden';
  }

  return 'ok';
}
