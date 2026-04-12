import { z } from 'zod';

import { protectedProcedure, router } from '../../trpc.ts';
import { getAudioFile } from './getAudioFile.ts';
import { getImageFile } from './getImageFile.ts';
import { getShow, getShowForEditing } from './getShow.ts';
import { getShows } from './getShows.ts';

export const adminRouter = router({
  getShows: protectedProcedure.query(() => getShows()),
  getShow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input: { id } }) => getShow(id)),
  getShowForEditing: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input: { id } }) => getShowForEditing(id)),
  getAudioFile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input: { id } }) => getAudioFile(id)),
  getImageFile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input: { id } }) => getImageFile(id)),
});
