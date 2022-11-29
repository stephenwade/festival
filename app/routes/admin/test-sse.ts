import type { LoaderFunction } from '@remix-run/node';

import { createAdminSseResponse } from '~/sse/admin-emitter.server';

export const loader: LoaderFunction = ({ request }) => {
  return createAdminSseResponse(request, ['stdout', 'stderr', 'exit code']);
};
