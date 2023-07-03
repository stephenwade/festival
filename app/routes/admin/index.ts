import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export const loader = (() => {
  return redirect('/admin/shows');
}) satisfies LoaderFunction;
