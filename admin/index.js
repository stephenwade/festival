import Koa from 'koa';
import send from 'koa-send';
import serve from 'koa-static';
import Router from '@koa/router';

const PORT = 8000;

const app = new Koa();
const router = new Router();

router.get('/api/sets', async (ctx) => {
  await send(ctx, 'sets.json');
});

app.use(router.routes()).use(router.allowedMethods());

app.use(serve('ui/dist'));

app.listen(8000);
console.log(`Listening on port ${PORT}`);
