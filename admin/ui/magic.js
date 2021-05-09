// the Magic global is created by the magic-sdk script in index.html
/* global Magic */

export const magic = new Magic('MAGIC_PUBLISHABLE_KEY');

export const fetchWithMagic = async (resource, init) =>
  fetch(resource, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${await magic.user.getIdToken()}`,
    },
  });
