import Router from '@koa/router';
import Koa from 'koa';

import sets from './api/sets.js';
import test from './api/test.js';

const api = new Koa();
const router = new Router();

router.get('/sets', sets);
router.post('/test', test);

api.use(router.routes()).use(router.allowedMethods());

export default api;
