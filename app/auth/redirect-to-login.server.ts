import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { userAuthStatus } from './user-auth-status';

interface RedirectToLoginArgs {
  onHoldPage?: boolean;
}

export async function redirectToLogin(
  args: ActionFunctionArgs | LoaderFunctionArgs,
  { onHoldPage }: RedirectToLoginArgs = {},
) {
  const status = await userAuthStatus(args);

  switch (status) {
    case 'unauthorized':
      throw redirect(`/admin/sign-in?redirect_url=${args.request.url}`);
    case 'forbidden':
      if (!onHoldPage) {
        throw redirect('/admin/user-on-hold');
      }
      break;
    case 'ok':
      if (onHoldPage) {
        throw redirect('/admin');
      }
      break;
  }
}
