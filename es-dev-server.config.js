/* global require, module */

const range = require('koa-range');

module.exports = {
  compatibility: 'none',
  middlewares: [range],
  port: 8080,
  watch: true,
};
