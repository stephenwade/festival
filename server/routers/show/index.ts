import { z } from 'zod';

import { publicProcedure, router } from '../../trpc.ts';
import { getIndexShowSlug } from './getIndexShowSlug.ts';
import { getShowData } from './getShowData.ts';
import { getShowStyles } from './getShowStyles.ts';

export const showRouter = router({
  getIndexShowSlug: publicProcedure.query(() => getIndexShowSlug()),
  getShowData: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input: { slug } }) => getShowData(slug)),
  getShowStyles: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input: { slug } }) => getShowStyles(slug)),
});
