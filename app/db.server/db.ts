import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (!globalThis.__db) {
  globalThis.__db = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}
const db = globalThis.__db;

export { db };
