import type { User as ClerkUser } from '@clerk/remix/api.server';

import { db } from '~/db.server/db';

export async function userIsAllowed(user: ClerkUser) {
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
