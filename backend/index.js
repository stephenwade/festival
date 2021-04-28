import Koa from 'koa';
import send from 'koa-send';
import Router from '@koa/router';

const PORT = 8000;

const app = new Koa();
const router = new Router();

router.get('/sets.json', async (ctx) => {
  await send(ctx, 'sets.json');
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(8000);
console.log(`Listening on port ${PORT}`);
