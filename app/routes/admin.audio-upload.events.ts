import type { LoaderFunction } from '@remix-run/node';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { adminEventStream } from '~/sse.server/admin-events';
import { AUDIO_FILE_EVENT_TYPE } from '~/sse.server/audio-file-events';

export const loader = (async (args) => {
  await redirectToLogin(args);

  return await adminEventStream(args.request, AUDIO_FILE_EVENT_TYPE);
}) satisfies LoaderFunction;
