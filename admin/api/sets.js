import send from 'koa-send';

export default async (ctx) => {
  await send(ctx, 'sets.json');
};
