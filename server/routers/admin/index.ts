import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { schema as showSchema } from '../../schemas/show.ts';
import { protectedProcedure, router } from '../../trpc.ts';
import { createAudioFileUpload } from './createAudioFileUpload.ts';
import { createFileUpload } from './createFileUpload.ts';
import { createShow } from './createShow.ts';
import { deleteShow } from './deleteShow.ts';
import { getAudioFile } from './getAudioFile.ts';
import { getImageFile } from './getImageFile.ts';
import { getShow, getShowForEditing } from './getShow.ts';
import { getShows } from './getShows.ts';
import { processAudioFile } from './processAudioFile.ts';
import { updateShow } from './updateShow.ts';

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
  createFileUpload: protectedProcedure
    .input(
      zfd.formData({
        name: zfd.text(),
        contentType: zfd.text(),
      }),
    )
    .mutation(({ input }) => createFileUpload(input)),
  createAudioFileUpload: protectedProcedure
    .input(
      zfd.formData({
        name: zfd.text(),
        contentType: zfd.text(),
      }),
    )
    .mutation(({ input }) =>
      createAudioFileUpload({
        name: input.name,
        contentType: input.contentType,
      }),
    ),
  createShow: protectedProcedure
    .input(showSchema)
    .mutation(({ input }) => createShow(input)),
  updateShow: protectedProcedure
    .input(showSchema)
    .mutation(({ input }) => updateShow(input)),
  deleteShow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input: { id } }) => deleteShow(id)),
  processAudioFile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input: { id } }) => processAudioFile(id)),
});
