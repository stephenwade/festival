import { magic } from './magic.js';

export default async (ctx) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const didToken = ctx.request.headers.authorization.substring(7);
    await magic.token.validate(didToken);

    ctx.body = 'Validation successful';
  } catch {
    ctx.throw(401, 'Validation failed!');
  }
};
