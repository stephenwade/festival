import { Magic } from '@magic-sdk/admin';

export const magic = new Magic(process.env.FESTIVAL_MAGIC_SECRET_KEY);
