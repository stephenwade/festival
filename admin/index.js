import Koa from 'koa';
import mount from 'koa-mount';
import serve from 'koa-static';

import api from './api.js';

const PORT = 8000;

const app = new Koa();

app.use(mount('/api', api));

app.use(serve('ui/dist'));

app.listen(8000);
console.log(`http://localhost:${PORT}`);
