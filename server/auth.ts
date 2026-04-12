import { createClerkClient, type SessionAuthObject } from '@clerk/express';

import { userIsAllowed } from '../app/auth/user-is-allowed.server.ts';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function getUserAuthStatus({ userId }: SessionAuthObject) {
  if (!userId) {
    return 'unauthorized';
  }

  const user = await clerkClient.users.getUser(userId);
  const allowed = await userIsAllowed(user);
  if (allowed) {
    return 'ok';
  }
  return 'forbidden';
}
