import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (!global.__db) {
  global.__db = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}
const db = global.__db;

export { db };
