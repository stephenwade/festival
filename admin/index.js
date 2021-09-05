import Koa from 'koa';
import mount from 'koa-mount';
import serve from 'koa-static';
import http from 'http';

import './env.js';
import api from './api.js';

const PORT = 8888;

const app = new Koa();

app.use(mount('/api', api));

app.use(serve('ui/dist'));

http.createServer(app.callback()).listen(PORT, 'localhost');
console.log(`http://localhost:${PORT}`);
