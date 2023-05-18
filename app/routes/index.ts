import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export const loader = (() => {
  return redirect('/my-show');
}) satisfies LoaderFunction;
