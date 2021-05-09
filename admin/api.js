import Koa from 'koa';
import Router from '@koa/router';

import test from './api/test.js';
import sets from './api/sets.js';

const api = new Koa();
const router = new Router();

router.get('/sets', sets);
router.post('/test', test);

api.use(router.routes()).use(router.allowedMethods());

export default api;
