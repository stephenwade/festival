import { validateUserLoggedIn } from './auth.js';

export default async (ctx) => {
  try {
    await validateUserLoggedIn(ctx.request);

    ctx.body = 'Validation successful';
  } catch {
    ctx.throw(401, 'Validation failed!');
  }
};
