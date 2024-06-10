import NodeCache from 'node-cache';

export const cache = new NodeCache({
  stdTTL: 60 * 60 * 1, // 1 hour
});

export const INDEX_SHOW_ID_KEY = 'indexShowId';
