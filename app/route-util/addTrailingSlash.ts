import { redirect } from '@remix-run/node';

export function addTrailingSlash(path: string) {
  if (!path.endsWith('/')) {
    throw redirect(`${path}/`, { status: 308 });
  }
}
