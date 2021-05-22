import { validateUserLoggedIn } from './auth.js';

export default async (ctx) => {
  try {
    await validateUserLoggedIn(ctx.request);

    ctx.body = 'Validation successful';
  } catch (e) {
    ctx.throw(401, e.message);
  }
};
