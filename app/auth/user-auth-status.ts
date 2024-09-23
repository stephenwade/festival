import type { User as ClerkUser } from '@clerk/remix/api.server';
import { createClerkClient } from '@clerk/remix/api.server';
import { getAuth } from '@clerk/remix/ssr.server';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

import { db } from '~/db.server/db';

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

async function userIsAllowed(user: ClerkUser) {
  const verifiedEmailAddresses = user.emailAddresses
    .filter((email) => email.verification?.status === 'verified')
    .map((email) => email.emailAddress);
  if (verifiedEmailAddresses.length === 0) {
    return false;
  }

  const inAllowlist =
    verifiedEmailAddresses.includes(process.env.FIRST_ADMIN_EMAIL_ADDRESS!) ||
    (await db.adminUserAllowlist.count({
      where: {
        emailAddress: { in: verifiedEmailAddresses },
      },
    })) > 0;

  return inAllowlist;
}
