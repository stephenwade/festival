import { db } from '../../../app/db.server/db.ts';
import { cache, INDEX_SHOW_SLUG_KEY } from '../../util/cache.ts';

export async function deleteShow(id: string): Promise<void> {
  console.log('Deleting show');

  await db.show.delete({ where: { id } });

  cache.del(INDEX_SHOW_SLUG_KEY);
}
