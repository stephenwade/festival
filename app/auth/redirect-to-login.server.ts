import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { forbidden, unauthorized } from '~/utils/responses.server';

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

export async function requireLogin(
  args: ActionFunctionArgs | LoaderFunctionArgs,
) {
  const status = await userAuthStatus(args);

  switch (status) {
    case 'unauthorized':
      throw unauthorized();
    case 'forbidden':
      throw forbidden();
    case 'ok':
      break;
  }
}
